/**
 * @jest-environment node
 */

import { describe, expect, it } from '@jest/globals';

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
        'display:inline-block;min-width:270px;width:270px;max-width:100%;min-width:49.916387959866%;width:calc(230400px - 48000%)'
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
      expect(result).toContain('@media only screen and (max-width:480px)');
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
      expect(result).toContain('min-width:33.277591973244%;width:calc(230400px - 48000%)');
      expect(result).toContain('min-width:179px;width:179px;max-width:100%');
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

      // Gap is applied as external margins on the column divs: first frames the
      // outer-left gap, middle columns the between-gap, last the outer-right gap.
      const zeroAwareMargins = [...result.matchAll(/margin-left:([\d.]+(?:px)?);margin-right:([\d.]+(?:px)?)/g)].map(
        (m) => `${m[1]}/${m[2]}`
      );
      expect(zeroAwareMargins).toEqual(['12px/0', '16px/0', '16px/20px']);
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
      expect(result).toContain('@media only screen and (max-width:480px)');
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
