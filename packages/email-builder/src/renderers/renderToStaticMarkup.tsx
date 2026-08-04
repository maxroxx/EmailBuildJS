import React from 'react';
import { renderToStaticMarkup as baseRenderToStaticMarkup } from 'react-dom/server';

import Reader, { TReaderDocument } from '../Reader/core';

type TOptions = {
  rootBlockId: string;
};

function findColumnSpans(innerContent: string): { start: number; end: number }[] {
  const spans: { start: number; end: number }[] = [];
  const regex = /<div[^>]*display:inline-block[^>]*>/g;
  let match;
  while ((match = regex.exec(innerContent)) !== null) {
    let depth = 1;
    let i = match.index + match[0].length;
    while (depth > 0 && i < innerContent.length) {
      const nextOpen = innerContent.indexOf('<div', i);
      const nextClose = innerContent.indexOf('</div>', i);
      if (nextClose === -1) {
        break;
      }
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        i = nextOpen + 4;
      } else {
        depth--;
        if (depth === 0) {
          spans.push({ start: match.index, end: nextClose + 6 });
          break;
        }
        i = nextClose + 6;
      }
    }
  }
  return spans;
}

const EMAIL_WIDTH = 600;

function addGhostTables(html: string): string {
  const marker = 'class="mj-column-wrapper"';
  const parts: string[] = [];
  let cursor = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const markerIndex = html.indexOf(marker, cursor);
    if (markerIndex === -1) {
      parts.push(html.substring(cursor));
      break;
    }

    const openDivStart = html.lastIndexOf('<div', markerIndex);
    const openDivEnd = html.indexOf('>', markerIndex);
    const openTag = html.substring(openDivStart, openDivEnd + 1);

    parts.push(html.substring(cursor, openDivStart));

    let depth = 1;
    let pos = openDivEnd + 1;
    let closeDivIndex = -1;

    while (depth > 0 && pos < html.length) {
      const nextClose = html.indexOf('</div>', pos);

      let nextOpen = -1;
      for (let i = pos; i < html.length; i++) {
        if (html[i] === '<' && html.substring(i, i + 4) === '<div') {
          nextOpen = i;
          break;
        }
      }

      if (nextClose === -1) {
        break;
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + 4;
      } else {
        depth--;
        if (depth === 0) {
          closeDivIndex = nextClose;
          break;
        }
        pos = nextClose + 6;
      }
    }

    if (closeDivIndex === -1) {
      parts.push(openTag);
      cursor = openDivEnd + 1;
      continue;
    }

    const innerContent = html.substring(openDivEnd + 1, closeDivIndex);
    const columnSpans = findColumnSpans(innerContent);
    const columnCount = columnSpans.length;

    if (columnCount === 0) {
      parts.push(openTag + innerContent + '</div>');
      cursor = closeDivIndex + 6;
      continue;
    }

    const tdWidth = Math.round(EMAIL_WIDTH / columnCount);
    const ghostOpen = `<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center"><tr><td valign="top" width="${tdWidth}"><![endif]-->`;
    const tdSeparator = `<!--[if mso | IE]></td><td valign="top" width="${tdWidth}"><![endif]-->`;
    const ghostClose = `<!--[if mso | IE]></td></tr></table><![endif]-->`;

    let rebuilt = '';
    let contentCursor = 0;
    for (let i = 0; i < columnSpans.length; i++) {
      const span = columnSpans[i];
      rebuilt += innerContent.substring(contentCursor, span.start);
      rebuilt += innerContent.substring(span.start, span.end);
      contentCursor = span.end;
      if (i < columnSpans.length - 1) {
        rebuilt += tdSeparator;
      }
    }
    rebuilt += innerContent.substring(contentCursor);

    parts.push(openTag);
    parts.push(ghostOpen);
    parts.push(rebuilt);
    parts.push(ghostClose);
    parts.push('</div>');
    cursor = closeDivIndex + 6;
  }

  return parts.join('');
}

type TColumnSpec = {
  className: string;
  widthPx: number;
};

function getColumnSpecs(html: string): TColumnSpec[] {
  const specs: TColumnSpec[] = [];
  const tagRegex = /<div\s+class="([^"]*mj-column-per-[\d.]+[^"]*)"[^>]*>/g;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[0];
    const widthMatch = tag.match(/data-col-width="([\d.]+)"|(?:min-width|max-width|width):\s*([\d.]+)px/);
    if (!widthMatch) {
      continue;
    }
    specs.push({ className: match[1], widthPx: parseFloat(widthMatch[1] ?? widthMatch[2]) });
  }
  return specs;
}

function escapeCssClass(className: string): string {
  return className.replace(/\./g, '\\.');
}

function fixInlineColumnStyles(html: string): string {
  return html.replace(/<div(\s+[^>]*?class="[^"]*mj-column-per-[\d.]+[^"]*"[^>]*?)>/g, (fullMatch) => {
    const styleMatch = fullMatch.match(/style="([^"]*)"/);
    if (!styleMatch) {
      return fullMatch;
    }

    const styleContent = styleMatch[1];
    const fixedStyle = styleContent
      .replace(/display:\s*[^;]*;?\s*/g, '')
      .replace(/max-width:\s*[^;]*;?\s*/g, '')
      .replace(/min-width:\s*[^;]*;?\s*/g, '')
      .replace(/width:\s*[^;]*;?\s*/g, '');

    const widthMatch =
      fullMatch.match(/data-col-width="([\d.]+)"/) ?? styleContent.match(/(?:min-width|max-width|width):\s*([\d.]+)px/);
    if (!widthMatch) {
      return fullMatch;
    }
    const widthPx = parseFloat(widthMatch[1]);
    const percentage = Math.round((widthPx / EMAIL_WIDTH) * 100 * 1e12) / 1e12;
    // Fallback px keeps n * fallbackPx within the real content width so
    // clients without calc() support (e.g. Gmail Inbox, which drops both
    // <style> and calc()) never wrap: 600 - 48px default block padding -
    // client slop (Gmail desktop shown ~548px content). calc() clients
    // ignore these via the later % min-width.
    const fallbackPx = Math.max(1, Math.floor(((EMAIL_WIDTH - 60) * percentage) / 100));
    // Desktop min-width targets (share - 1px) for 3 columns and (share - 1.5px)
    // for 2 columns, expressed against the wrapper's content width (email
    // width minus its 2px margins). This keeps the visible total under the
    // email width (599px) so equal columns NEVER sum to exactly 600 -
    // avoiding the sub-pixel exact-fit wrap in calc() clients (browser,
    // Apple Mail, Gmail Compose) - while leaving only a ~1px-per-column
    // gap. The leftover 2px margins put a 1px breathing gap at each side of
    // the block for a balanced look when columns have background colours.
    const columnCount = parseFloat(fullMatch.match(/data-col-count="([\d.]+)"/)?.[1] ?? '0') || 0;
    const desktopCoreWidth = EMAIL_WIDTH - 2;
    const desktopTarget = widthPx - (columnCount === 2 ? 1.5 : 1);
    const desktopPercentage = Math.round((desktopTarget / desktopCoreWidth) * 100 * 1e12) / 1e12;

    // Fab Four (no media query needed): below 480px the calc() grows past
    // max-width:100% (full-width stacked), above 480px it drops below the
    // min-width (desktop percentages). Pixel declarations first act as the
    // fallback for clients that do not support calc().
    const newStyle = `display:inline-block;min-width:${fallbackPx}px;width:${fallbackPx}px;max-width:100%;min-width:${desktopPercentage}%;width:calc(230400px - 48000%);${fixedStyle}`;
    const cleanedStyle = newStyle
      .replace(/\s{2,}/g, ' ')
      .replace(/;\s*;/g, ';')
      .replace(/^;\s*/, '')
      .replace(/\s*;$/, '');

    return fullMatch.replace(/style="[^"]*"/, `style="${cleanedStyle}"`);
  });
}

function fixColumnWrapperStyle(html: string): string {
  return html.replace(
    /<div class="mj-column-wrapper" style="[^"]*">/g,
    '<div class="mj-column-wrapper" style="display:block;width:100%;font-size:0;text-align:left;padding:0 1px;box-sizing:border-box">'
  );
}

function generateResponsiveStyles(specs: TColumnSpec[]): string {
  if (specs.length === 0) {
    return '';
  }

  const classes = Array.from(new Set(specs.map((spec) => spec.className)));
  const mobileRules = classes
    .map((className) => {
      const escapedClass = escapeCssClass(className);
      return `  .${escapedClass} {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
  }`;
    })
    .join('\n');

  return `<style type="text/css">
@media only screen and (max-width:480px) {
${mobileRules}
}
</style>`;
}

function injectStyles(html: string): string {
  const specs = getColumnSpecs(html);
  if (specs.length === 0) {
    return html;
  }

  const fixedHtml = fixColumnWrapperStyle(fixInlineColumnStyles(html));
  const responsiveStyles = generateResponsiveStyles(specs);
  if (fixedHtml.includes('</head>')) {
    return fixedHtml.replace('</head>', `${responsiveStyles}</head>`);
  }
  return fixedHtml.replace('<body>', `${responsiveStyles}<body>`);
}

export default function renderToStaticMarkup(document: TReaderDocument, { rootBlockId }: TOptions) {
  return (
    '<!DOCTYPE html>' +
    injectStyles(
      addGhostTables(
        baseRenderToStaticMarkup(
          <html>
            <head />
            <body>
              <Reader document={document} rootBlockId={rootBlockId} />
            </body>
          </html>
        )
      )
    )
  );
}
