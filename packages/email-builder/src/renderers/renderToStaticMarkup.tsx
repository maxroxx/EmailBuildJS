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
      if (nextClose === -1) break;
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

function addGhostTables(html: string): string {
  const marker = 'class="mj-column-wrapper"';
  const parts: string[] = [];
  let cursor = 0;

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

      if (nextClose === -1) break;

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

    const tdWidth = Math.round(600 / columnCount);
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
      if (i < columnSpans.length - 1) rebuilt += tdSeparator;
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

function getColumnClasses(html: string): Set<string> {
  const classes = new Set<string>();
  const classRegex = /mj-column-per-([\d.]+)/g;
  let match;
  while ((match = classRegex.exec(html)) !== null) {
    classes.add(`mj-column-per-${match[1]}`);
  }
  return classes;
}

function generateMediaQueries(classes: Set<string>): string {
  if (classes.size === 0) return '';

  const rules = Array.from(classes).map((className) => {
    const match = className.match(/mj-column-per-([\d.]+)/);
    if (!match) return '';
    const percentage = match[1];
    return `  .${className} {\n    width: ${percentage}% !important;\n    max-width: ${percentage}% !important;\n  }`;
  }).filter(Boolean);

  return `<style type="text/css">
@media only screen and (min-width:480px) {
${rules.join('\n')}
}
</style>`;
}

function injectStyles(html: string): string {
  const classes = getColumnClasses(html);
  if (classes.size === 0) return html;

  const mediaQueries = generateMediaQueries(classes);
  return html.replace('</body>', `${mediaQueries}</body>`);
}

export default function renderToStaticMarkup(document: TReaderDocument, { rootBlockId }: TOptions) {
  return (
    '<!DOCTYPE html>' +
    injectStyles(
      addGhostTables(
        baseRenderToStaticMarkup(
          <html>
            <body>
              <Reader document={document} rootBlockId={rootBlockId} />
            </body>
          </html>
        )
      )
    )
  );
}
