import React from 'react';
import { renderToStaticMarkup as baseRenderToStaticMarkup } from 'react-dom/server';

import Reader, { TReaderDocument } from '../Reader/core';

type TOptions = {
  rootBlockId: string;
};

function findBlockSpans(innerContent: string, displayType: 'inline-block' | 'block'): { start: number; end: number }[] {
  const spans: { start: number; end: number }[] = [];
  const regex = new RegExp(`<div[^>]*display:${displayType}[^>]*>`, 'g');
  let match;
  let lastEnd = 0;
  while ((match = regex.exec(innerContent)) !== null) {
    if (match.index < lastEnd) {
      continue;
    }
    let depth = 1;
    let i = match.index + match[0].length;
    while (depth > 0 && i < innerContent.length) {
      const nextOpen = innerContent.indexOf('<div', i);
      const nextClose = innerContent.indexOf('</div>', i);
      if (nextClose === -1) {
        break;
      }
      if (nextOpen !== -1 && nextOpen < nextClose) {
        const openTagEnd = innerContent.indexOf('>', nextOpen);
        const openTag = innerContent.substring(nextOpen, openTagEnd + 1);
        if (openTag.includes('mj-column-wrapper') || openTag.includes('mj-row-wrapper')) {
          const wrapperClose = innerContent.indexOf('</div>', nextOpen);
          if (wrapperClose !== -1) {
            i = wrapperClose + 6;
            continue;
          }
        }
        depth++;
        i = nextOpen + 4;
      } else {
        depth--;
        if (depth === 0) {
          spans.push({ start: match.index, end: nextClose + 6 });
          lastEnd = nextClose + 6;
          break;
        }
        i = nextClose + 6;
      }
    }
  }
  return spans;
}

const EMAIL_WIDTH = 600;

type TWrapperType = 'column' | 'row';

function findParentColumnWidth(result: string, rowWrapperPos: number): number | null {
  let searchPos = rowWrapperPos - 1;
  while (searchPos >= 0) {
    const divStart = result.lastIndexOf('<div', searchPos);
    if (divStart === -1) {
      break;
    }
    const divEnd = result.indexOf('>', divStart);
    const divTag = result.substring(divStart, divEnd + 1);
    if (divTag.includes('mj-column-per-')) {
      const colWidthMatch = divTag.match(/data-col-width="([\d.]+)"/);
      if (colWidthMatch) {
        return parseFloat(colWidthMatch[1]);
      }
      const colCountMatch = divTag.match(/data-col-count="([\d.]+)"/);
      if (colCountMatch) {
        const colCount = parseFloat(colCountMatch[1]);
        return Math.round(EMAIL_WIDTH / colCount);
      }
    }
    searchPos = divStart - 1;
  }
  return null;
}

function addGhostTables(html: string): string {
  const wrapperMarkers: { marker: string; type: TWrapperType }[] = [
    { marker: 'class="mj-column-wrapper"', type: 'column' },
    { marker: 'class="mj-row-wrapper"', type: 'row' },
  ];

  let result = html;

  for (const { marker, type } of wrapperMarkers) {
    const parts: string[] = [];
    let cursor = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const markerIndex = result.indexOf(marker, cursor);
      if (markerIndex === -1) {
        parts.push(result.substring(cursor));
        break;
      }

      const openDivStart = result.lastIndexOf('<div', markerIndex);
      const openDivEnd = result.indexOf('>', markerIndex);
      const openTag = result.substring(openDivStart, openDivEnd + 1);

      parts.push(result.substring(cursor, openDivStart));

      let depth = 1;
      let pos = openDivEnd + 1;
      let closeDivIndex = -1;

      while (depth > 0 && pos < result.length) {
        const nextClose = result.indexOf('</div>', pos);

        let nextOpen = -1;
        for (let i = pos; i < result.length; i++) {
          if (result[i] === '<' && result.substring(i, i + 4) === '<div') {
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

      const innerContent = result.substring(openDivEnd + 1, closeDivIndex);
      const displayType = type === 'column' ? 'inline-block' : 'block';
      const blockSpans = findBlockSpans(innerContent, displayType);
      const blockCount = blockSpans.length;

      if (blockCount === 0) {
        parts.push(openTag + innerContent + '</div>');
        cursor = closeDivIndex + 6;
        continue;
      }

      let tdWidth = Math.round(EMAIL_WIDTH / blockCount);
      if (type === 'row') {
        const rowWrapperFullTag = result.substring(openDivStart, openDivEnd + 1);
        const isInsideColumn = rowWrapperFullTag.includes('mj-column-per-');
        if (!isInsideColumn) {
          const parentColWidth = findParentColumnWidth(result, openDivStart);
          if (parentColWidth !== null && parentColWidth < EMAIL_WIDTH) {
            tdWidth = Math.round(parentColWidth / blockCount);
          }
        }
      }

      const ghostOpen = `<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center"><tr><td valign="top" width="${tdWidth}"><![endif]-->`;
      const tdSeparator = `<!--[if mso | IE]></td><td valign="top" width="${tdWidth}"><![endif]-->`;
      const ghostClose = `<!--[if mso | IE]></td></tr></table><![endif]-->`;

      let rebuilt = '';
      let contentCursor = 0;
      for (let i = 0; i < blockSpans.length; i++) {
        const span = blockSpans[i];
        rebuilt += innerContent.substring(contentCursor, span.start);
        rebuilt += innerContent.substring(span.start, span.end);
        contentCursor = span.end;
        if (i < blockSpans.length - 1) {
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

    result = parts.join('');
  }

  return result;
}

type TColumnSpec = {
  className: string;
  widthPx: number;
  type: TWrapperType;
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
    specs.push({ className: match[1], widthPx: parseFloat(widthMatch[1] ?? widthMatch[2]), type: 'column' });
  }
  return specs;
}

function getRowSpecs(html: string): TColumnSpec[] {
  const specs: TColumnSpec[] = [];
  const tagRegex = /<div\s+class="([^"]*mj-row-per-[\d.]+[^"]*)"[^>]*>/g;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[0];
    const widthMatch = tag.match(/data-row-width="([\d.]+)"|(?:min-width|max-width|width):\s*([\d.]+)px/);
    if (!widthMatch) {
      continue;
    }
    specs.push({ className: match[1], widthPx: parseFloat(widthMatch[1] ?? widthMatch[2]), type: 'row' });
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
    // Per-column desktop share (px): the gap-aware column width minus a small
    // safety margin so N equal columns never sum to exactly the email width
    // (avoids the sub-pixel exact-fit wrap in percentage clients - browser,
    // Apple Mail, Gmail Compose) while leaving a ~1px-per-column gap. The
    // leftover 2px wrapper margins give a 1px breathing gap at each edge when
    // columns have background colours.
    const columnCount = parseFloat(fullMatch.match(/data-col-count="([\d.]+)"/)?.[1] ?? '0') || 0;
    const desktopCoreWidth = EMAIL_WIDTH - 2;
    const desktopTarget = widthPx - (columnCount === 2 ? 1.5 : 1);
    const desktopPercentage = Math.round((desktopTarget / desktopCoreWidth) * 100 * 1e12) / 1e12;

    // Hybrid (MJML/Cerberus) inline: width:100% so the column fills the
    // container, clamped by max-width to the desktop share. Desktop stays
    // N-across (share is small enough that N x share < email width). In
    // Gmail the @media below is stripped, so this clamp is what caps the
    // stacked column (~83% of a 358px container); the MQ still gives true
    // 100% to clients that honour it.
    const sharePx = Math.max(1, Math.floor(desktopTarget));
    const newStyle = `display:inline-block;width:100%;max-width:${sharePx}px;min-width:${desktopPercentage}%;${fixedStyle}`;
    const cleanedStyle = newStyle
      .replace(/\s{2,}/g, ' ')
      .replace(/;\s*;/g, ';')
      .replace(/^;\s*/, '')
      .replace(/\s*;$/, '');

    return fullMatch.replace(/style="[^"]*"/, `style="${cleanedStyle}"`);
  });
}

function fixInlineRowStyles(html: string): string {
  return html.replace(/<div(\s+[^>]*?class="[^"]*mj-row-per-[\d.]+[^"]*"[^>]*?)>/g, (fullMatch) => {
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

    // Rows are always full-width block elements - no calc() trick needed
    const newStyle = `display:block;width:100%;max-width:100%;${fixedStyle}`;
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

function fixRowWrapperStyle(html: string): string {
  return html.replace(
    /<div class="mj-row-wrapper" style="[^"]*">/g,
    '<div class="mj-row-wrapper" style="display:block;width:100%;box-sizing:border-box">'
  );
}

function generateResponsiveStyles(specs: TColumnSpec[]): string {
  const columnSpecs = specs.filter((spec) => spec.type === 'column');
  if (columnSpecs.length === 0) {
    return '';
  }

  const classes = Array.from(new Set(columnSpecs.map((spec) => spec.className)));
  const mobileRules = classes
    .map((className) => {
      const escapedClass = escapeCssClass(className);
      return `  .${escapedClass} {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }`;
    })
    .join('\n');

  return `<style type="text/css">
@media only screen and (max-width:599px) {
${mobileRules}
  .mj-column-wrapper [data-col-gap] {
    display: none !important;
  }
}
</style>`;
}

function injectStyles(html: string): string {
  const columnSpecs = getColumnSpecs(html);
  const rowSpecs = getRowSpecs(html);
  const allSpecs = [...columnSpecs, ...rowSpecs];

  if (allSpecs.length === 0) {
    return html;
  }

  const fixedHtml = fixColumnWrapperStyle(fixRowWrapperStyle(fixInlineColumnStyles(fixInlineRowStyles(html))));
  const responsiveStyles = generateResponsiveStyles(columnSpecs);
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
