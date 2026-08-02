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
                columns: [
                  { childrenIds: ['block_col1'] },
                  { childrenIds: ['block_col2'] },
                  { childrenIds: [] },
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
        },
        { rootBlockId: 'root' }
      );
      expect(result).toMatchSnapshot();
    });

    it('includes mj-column-wrapper with inline-block column divs', () => {
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
                columns: [
                  { childrenIds: ['block_col1'] },
                  { childrenIds: ['block_col2'] },
                  { childrenIds: [] },
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
        },
        { rootBlockId: 'root' }
      );
      expect(result).toContain('class="mj-column-wrapper"');
      expect(result).toContain('style="display:table;width:100%;table-layout:fixed;text-align:left"');
      expect(result).toContain('mj-column-per-50');
      expect(result).toContain('display:table-cell');
      expect(result).toContain('width:50%;max-width:50%');
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
                columns: [
                  { childrenIds: ['block_col1'] },
                  { childrenIds: ['block_col2'] },
                  { childrenIds: [] },
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
                columns: [
                  { childrenIds: ['block_col1'] },
                  { childrenIds: ['block_col2'] },
                  { childrenIds: [] },
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
      expect(result).toContain('width:33.333333333333%;max-width:33.333333333333%');
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
});
