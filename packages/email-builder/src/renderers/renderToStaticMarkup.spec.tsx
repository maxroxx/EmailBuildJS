/**
 * @jest-environment node
 */

import { describe, expect, it } from '@jest/globals';

import { TReaderDocument } from '../Reader/core';

import renderToStaticMarkup from './renderToStaticMarkup';

describe('renderToStaticMarkup', () => {
  it('renders into a string', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: {
              childrenIds: [],
            },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toEqual('<!DOCTYPE html><html><head></head><body><div></div></body></html>');
  });

  describe('2-column layout', () => {
    it('renders ColumnsContainer with correct structure', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_cols'],
            },
          },
          block_cols: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                columnsCount: 2,
                columns: [{ childrenIds: ['block_col1'] }, { childrenIds: ['block_col2'] }, { childrenIds: [] }],
              },
            },
          },
          block_col1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toMatchSnapshot();
    });

    it('includes mj-column-wrapper with fab-four inline styles on column divs', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_cols'],
            },
          },
          block_cols: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                columnsCount: 2,
                columns: [{ childrenIds: ['block_col1'] }, { childrenIds: ['block_col2'] }, { childrenIds: [] }],
              },
            },
          },
          block_col1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toContain('class="mj-column-wrapper"');
      expect(result).toContain(
        'style="display:block;width:100%;font-size:0;text-align:left;padding:0 1px;box-sizing:border-box"'
      );
      expect(result).toContain('mj-column-per-50');
      expect(result).toContain(
        'display:inline-block;width:270px;max-width:100%;min-width:49.916387959866%;vertical-align:middle;min-height:40px;margin:0;box-sizing:border-box'
      );
    });

    it('includes ghost tables with mso conditional comments', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_cols'],
            },
          },
          block_cols: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                columnsCount: 2,
                columns: [{ childrenIds: ['block_col1'] }, { childrenIds: ['block_col2'] }, { childrenIds: [] }],
              },
            },
          },
          block_col1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toContain('<!--[if mso | IE]><table role="presentation"');
      expect(result).toContain('<![endif]-->');
      expect(result).toContain('</td><td valign="top"');
      expect(result).toContain('</td></tr></table><![endif]-->');
    });

    it('includes media queries for responsive columns', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_cols'],
            },
          },
          block_cols: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                columnsCount: 2,
                columns: [{ childrenIds: ['block_col1'] }, { childrenIds: ['block_col2'] }, { childrenIds: [] }],
              },
            },
          },
          block_col1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toContain('@media only screen and (max-width:599px)');
      expect(result).toContain('display: block !important');
      expect(result).toContain('width: 100% !important');
      expect(result).toContain('max-width: 100% !important');
    });
  });

  describe('3-column layout', () => {
    it('renders ColumnsContainer with correct structure', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_cols'],
            },
          },
          block_cols: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                columnsCount: 3,
                columns: [
                  { childrenIds: ['block_col1'] },
                  { childrenIds: ['block_col2'] },
                  { childrenIds: ['block_col3'] },
                ],
              },
            },
          },
          block_col1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col3: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toMatchSnapshot();
    });

    it('includes ghost tables with 3 td separators', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_cols'],
            },
          },
          block_cols: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                columnsCount: 3,
                columns: [
                  { childrenIds: ['block_col1'] },
                  { childrenIds: ['block_col2'] },
                  { childrenIds: ['block_col3'] },
                ],
              },
            },
          },
          block_col1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col3: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toContain('<!--[if mso | IE]><table role="presentation"');
      expect(result).toContain('</td><td valign="top"');
      // 3 columns = 2 separators between them
      const separatorCount = (result.match(/<\/td><td valign="top"/g) || []).length;
      expect(separatorCount).toBe(2);
      expect(result).toContain('min-width:33.277591973244%');
      expect(result).toContain('width:179px;max-width:100%;min-width:33.277591973244%');
    });
  });

  describe('columns with gap', () => {
    it('keeps every column width equal and applies the gap as external margins', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_cols'],
            },
          },
          block_cols: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                columnsCount: 3,
                columnsGap: 16,
                marginBeforeFirst: 12,
                marginBeforeLast: 20,
                columns: [
                  { childrenIds: ['block_col1'] },
                  { childrenIds: ['block_col2'] },
                  { childrenIds: ['block_col3'] },
                ],
              },
            },
          },
          block_col1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col3: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );

      const colTags = result.match(/<div class="mj-column-per-33" style="[^"]*"[^>]*>/g) ?? [];
      expect(colTags).toHaveLength(3);

      // Every column reports the same gap-aware width and min-width percentage
      const minWidths = colTags.map((tag) => tag.match(/min-width:([\d.]+)%/)?.[1]);
      expect(new Set(minWidths).size).toBe(1);

      // Column divs are margin-free: no inline margin-left/right with a
      // non-zero value anywhere on a column.
      for (const tag of colTags) {
        expect(tag).not.toMatch(/margin-left:\d+px/);
        expect(tag).not.toMatch(/margin-right:\d+px/);
      }

      // The gap is carried by spacer elements: before first, between
      // columns, after last.
      const gaps = [...result.matchAll(/data-col-gap="(\d+)"/g)].map((m) => m[1]);
      expect(gaps).toEqual(['12', '16', '16', '20']);
    });

    it('removes all margins in the mobile media query', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_cols'],
            },
          },
          block_cols: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                columnsCount: 2,
                columnsGap: 16,
                marginBeforeFirst: 12,
                marginBeforeLast: 20,
                columns: [{ childrenIds: [] }, { childrenIds: [] }, { childrenIds: [] }],
              },
            },
          },
        },
        { rootBlockId: 'root' }
      );

      // Desktop keeps the gap as inline spacers, and column divs carry no
      // horizontal margins (so nothing can stair-step in stacked view)
      expect(result).toContain('data-col-gap="12"');
      expect(result).toContain('data-col-gap="16"');
      expect(result).toContain('data-col-gap="20"');
      expect(result).not.toContain('margin-left:12px');
      expect(result).not.toContain('margin-right:20px');

      // Mobile media query strips every horizontal margin so stacked columns
      // never stair-step in clients that honor <style>
      const mediaQuery = result.match(/@media only screen and \(max-width:599px\) \{([\s\S]*)\}/)?.[1] ?? '';
      expect(mediaQuery).toContain('margin-left: 0 !important;');
      expect(mediaQuery).toContain('margin-right: 0 !important;');
      expect(mediaQuery).toContain('display: none !important');
    });
  });

  describe('viewport breakpoint is fixed at 600px regardless of margins', () => {
    const breakpoint = 599;

    function buildDoc(columnsCount: 2 | 3, columnsGap = 0, marginBeforeFirst = 0, marginBeforeLast = 0) {
      const columns = Array.from({ length: columnsCount }, (_, i) => ({
        childrenIds: [`block_col${i + 1}`],
      }));
      const colBlocks: Record<string, unknown> = {};
      for (let i = 1; i <= columnsCount; i++) {
        colBlocks[`block_col${i}`] = {
          type: 'Container',
          data: {
            style: {
              backgroundColor: null,
              borderColor: null,
              borderRadius: null,
              padding: { top: 0, bottom: 0, left: 0, right: 0 },
            },
            props: { childrenIds: [] },
          },
        };
      }
      return {
        root: {
          type: 'EmailLayout',
          data: {
            backdropColor: '#F5F5F5',
            canvasColor: '#FFFFFF',
            textColor: '#262626',
            fontFamily: 'MODERN_SANS',
            childrenIds: ['block_cols'],
          },
        },
        block_cols: {
          type: 'ColumnsContainer',
          data: {
            style: {
              backgroundColor: null,
              padding: { top: 24, bottom: 24, left: 24, right: 24 },
            },
            props: {
              columnsCount,
              columnsGap,
              marginBeforeFirst,
              marginBeforeLast,
              columns,
            },
          },
        },
        ...colBlocks,
      };
    }

    const marginValues: { label: string; gap: number; first: number; last: number }[] = [
      { label: '0px', gap: 0, first: 0, last: 0 },
      { label: '8px', gap: 8, first: 8, last: 8 },
      { label: '16px', gap: 16, first: 16, last: 16 },
      { label: '32px', gap: 32, first: 32, last: 32 },
    ];

    marginValues.forEach(({ label, gap, first, last }) => {
      it(`stacking breakpoint does not shift with ${label} margins (2-col)`, () => {
        const doc = buildDoc(2, gap, first, last) as TReaderDocument;
        const result = renderToStaticMarkup(doc, { rootBlockId: 'root' });

        // No width-derived stacking: the calc trick is gone
        expect(result).not.toContain('calc(');

        // The media query breakpoint is always 599px regardless of margin
        const match = result.match(/@media only screen and \(max-width:(\d+)px\)/);
        expect(match).not.toBeNull();
        expect(Number(match![1])).toBe(breakpoint);

        // The media query body contains stacking + margin removal rules
        const mq = result.match(/@media only screen and \(max-width:599px\) \{([\s\S]*)\}/)?.[1] ?? '';
        expect(mq).toContain('display: block !important');
        expect(mq).toContain('width: 100% !important');
        expect(mq).toContain('margin-left: 0 !important;');
        expect(mq).toContain('margin-right: 0 !important;');
        expect(mq).toContain('display: none !important');

        // Desktop HTML keeps the gap spacers (margins preserved at >= 600)
        // GapSpacer is only rendered when the gap value is > 0
        if (first > 0) {
          expect(result).toContain(`data-col-gap="${first}"`);
        }
        if (gap > 0) {
          expect(result).toContain(`data-col-gap="${gap}"`);
        }
        if (last > 0) {
          expect(result).toContain(`data-col-gap="${last}"`);
        }
      });
    });

    marginValues.forEach(({ label, gap, first, last }) => {
      it(`stacking breakpoint does not shift with ${label} margins (3-col)`, () => {
        const doc = buildDoc(3, gap, first, last) as TReaderDocument;
        const result = renderToStaticMarkup(doc, { rootBlockId: 'root' });

        expect(result).not.toContain('calc(');

        const match = result.match(/@media only screen and \(max-width:(\d+)px\)/);
        expect(match).not.toBeNull();
        expect(Number(match![1])).toBe(breakpoint);

        const mq = result.match(/@media only screen and \(max-width:599px\) \{([\s\S]*)\}/)?.[1] ?? '';
        expect(mq).toContain('display: block !important');
        expect(mq).toContain('width: 100% !important');
      });
    });

    it('evaluates the viewport table: >=600 horizontal, <600 stacked (2-col, 16px margins)', () => {
      const doc = buildDoc(2, 16, 16, 16) as TReaderDocument;
      const result = renderToStaticMarkup(doc, { rootBlockId: 'root' });

      const match = result.match(/@media only screen and \(max-width:(\d+)px\)/);
      const bp = Number(match![1]);

      // Viewport 700: above breakpoint → media query inactive → horizontal
      expect(700 > bp).toBe(true);
      // Viewport 600: at breakpoint → media query inactive → horizontal
      expect(600 > bp).toBe(true);
      // Viewport 599: below breakpoint → media query active → stacked + margins removed
      expect(599 <= bp).toBe(true);
      // Viewport 480: below breakpoint → media query active → stacked + margins removed
      expect(480 <= bp).toBe(true);
    });

    it('evaluates the viewport table: >=600 horizontal, <600 stacked (3-col, 0px margins)', () => {
      const doc = buildDoc(3, 0, 0, 0) as TReaderDocument;
      const result = renderToStaticMarkup(doc, { rootBlockId: 'root' });

      const match = result.match(/@media only screen and \(max-width:(\d+)px\)/);
      const bp = Number(match![1]);

      expect(700 > bp).toBe(true);
      expect(600 > bp).toBe(true);
      expect(599 <= bp).toBe(true);
      expect(480 <= bp).toBe(true);
    });
  });

  describe('no columns', () => {
    it('renders without ghost tables or media queries for empty container', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).not.toContain('<!--[if mso | IE]');
      expect(result).not.toContain('@media only screen');
      expect(result).not.toContain('mj-column-wrapper');
    });
  });

  describe('nested columns', () => {
    it('renders nested ColumnsContainer with correct ghost table structure', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_cols'],
            },
          },
          block_cols: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                columnsCount: 3,
                columns: [
                  { childrenIds: ['block_col1'] },
                  { childrenIds: ['block_col2'] },
                  { childrenIds: ['block_col3'] },
                ],
              },
            },
          },
          block_col1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col2: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: {
                columnsCount: 3,
                columns: [
                  { childrenIds: ['block_inner_col1'] },
                  { childrenIds: ['block_inner_col2'] },
                  { childrenIds: ['block_inner_col3'] },
                ],
              },
            },
          },
          block_inner_col1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_inner_col2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_inner_col3: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col3: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toContain('class="mj-column-wrapper"');
      expect(result).toContain('<!--[if mso | IE]><table role="presentation"');
      expect(result).toContain('</td></tr></table><![endif]-->');
      const separatorCount = (result.match(/<\/td><td valign="top"/g) || []).length;
      expect(separatorCount).toBeGreaterThan(0);
      const wrapperCount = (result.match(/class="mj-column-wrapper"/g) || []).length;
      expect(wrapperCount).toBe(2);
    });

    it('includes responsive media queries for nested column classes', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_cols'],
            },
          },
          block_cols: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                columnsCount: 3,
                columns: [
                  { childrenIds: ['block_col1'] },
                  { childrenIds: ['block_col2'] },
                  { childrenIds: ['block_col3'] },
                ],
              },
            },
          },
          block_col1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col2: {
            type: 'ColumnsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: {
                columnsCount: 3,
                columns: [
                  { childrenIds: ['block_inner_col1'] },
                  { childrenIds: ['block_inner_col2'] },
                  { childrenIds: ['block_inner_col3'] },
                ],
              },
            },
          },
          block_inner_col1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_inner_col2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_inner_col3: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_col3: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toContain('@media only screen and (max-width:599px)');
      expect(result).toContain('display: block !important');
      expect(result).toContain('width: 100% !important');
    });
  });

  describe('2-row layout', () => {
    it('renders RowsContainer with correct structure', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_rows'],
            },
          },
          block_rows: {
            type: 'RowsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                rowsCount: 2,
                rows: [{ childrenIds: ['block_row1'] }, { childrenIds: ['block_row2'] }, { childrenIds: [] }],
              },
            },
          },
          block_row1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_row2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toMatchSnapshot();
    });

    it('includes mj-row-wrapper with block styles on row divs', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_rows'],
            },
          },
          block_rows: {
            type: 'RowsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                rowsCount: 2,
                rows: [{ childrenIds: ['block_row1'] }, { childrenIds: ['block_row2'] }, { childrenIds: [] }],
              },
            },
          },
          block_row1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_row2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toContain('class="mj-row-wrapper"');
      expect(result).toContain('style="display:block;width:100%;box-sizing:border-box"');
      expect(result).toContain('mj-row-per-100');
      expect(result).toContain('display:block;width:100%;max-width:100%');
    });

    it('includes ghost tables for rows', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_rows'],
            },
          },
          block_rows: {
            type: 'RowsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                rowsCount: 2,
                rows: [{ childrenIds: ['block_row1'] }, { childrenIds: ['block_row2'] }, { childrenIds: [] }],
              },
            },
          },
          block_row1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_row2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toContain('<!--[if mso | IE]><table role="presentation"');
      expect(result).toContain('<![endif]-->');
      expect(result).toContain('</td><td valign="top"');
      expect(result).toContain('</td></tr></table><![endif]-->');
    });

    it('does NOT include media queries for rows', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_rows'],
            },
          },
          block_rows: {
            type: 'RowsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                rowsCount: 2,
                rows: [{ childrenIds: ['block_row1'] }, { childrenIds: ['block_row2'] }, { childrenIds: [] }],
              },
            },
          },
          block_row1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_row2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).not.toContain('@media only screen');
      expect(result).not.toContain('display: block !important');
    });
  });

  describe('3-row layout', () => {
    it('renders RowsContainer with 3 rows', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_rows'],
            },
          },
          block_rows: {
            type: 'RowsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                rowsCount: 3,
                rows: [
                  { childrenIds: ['block_row1'] },
                  { childrenIds: ['block_row2'] },
                  { childrenIds: ['block_row3'] },
                ],
              },
            },
          },
          block_row1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_row2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_row3: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toMatchSnapshot();
    });

    it('includes ghost tables with 3 td separators for 3 rows', () => {
      const result = renderToStaticMarkup(
        {
          root: {
            type: 'EmailLayout',
            data: {
              backdropColor: '#F5F5F5',
              canvasColor: '#FFFFFF',
              textColor: '#262626',
              fontFamily: 'MODERN_SANS',
              childrenIds: ['block_rows'],
            },
          },
          block_rows: {
            type: 'RowsContainer',
            data: {
              style: {
                backgroundColor: null,
                padding: { top: 24, bottom: 24, left: 24, right: 24 },
              },
              props: {
                rowsCount: 3,
                rows: [
                  { childrenIds: ['block_row1'] },
                  { childrenIds: ['block_row2'] },
                  { childrenIds: ['block_row3'] },
                ],
              },
            },
          },
          block_row1: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_row2: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
          block_row3: {
            type: 'Container',
            data: {
              style: {
                backgroundColor: null,
                borderColor: null,
                borderRadius: null,
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
              },
              props: { childrenIds: [] },
            },
          },
        },
        { rootBlockId: 'root' }
      );
      expect(result).toContain('<!--[if mso | IE]><table role="presentation"');
      expect(result).toContain('</td><td valign="top"');
      // 3 rows = 2 separators between them
      const separatorCount = (result.match(/<\/td><td valign="top"/g) || []).length;
      expect(separatorCount).toBe(2);
    });
  });
});
