import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { ColumnsContainer } from '.';

describe('block-columns-container', () => {
  it('renders with default values', () => {
    expect(render(<ColumnsContainer />).asFragment()).toMatchSnapshot();
  });

  describe('columnsCount 2', () => {
    it('renders column children', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(render(<ColumnsContainer props={{ columnsCount: 2 }} columns={columns} />).asFragment()).toMatchSnapshot();
    });
  });

  describe('columnsCount 3', () => {
    it('renders column children', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(render(<ColumnsContainer props={{ columnsCount: 3 }} columns={columns} />).asFragment()).toMatchSnapshot();
    });
  });

  describe('margins', () => {
    const marginProps = { columnsGap: 16, marginBeforeFirst: 12, marginBeforeLast: 20 };
    const columns = [<>bread</>, <>tomato</>, <>lettuce</>];

    it('applies gap spacers on desktop', () => {
      const { container } = render(<ColumnsContainer props={{ columnsCount: 3, ...marginProps }} columns={columns} />);
      const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
      expect(colEls).toHaveLength(3);

      // Columns themselves carry no margins
      for (const col of colEls) {
        expect(col.style.marginLeft).toBe('0px');
        expect(col.style.marginRight).toBe('0px');
      }

      // The gap is carried by spacer elements: before first, between
      // columns, after last
      const spacers = Array.from(container.querySelectorAll('[data-col-gap]')) as HTMLElement[];
      expect(spacers.map((el) => el.getAttribute('data-col-gap'))).toEqual(['12', '16', '16', '20']);
      for (const spacer of spacers) {
        expect(spacer.style.width).toBe(`${spacer.getAttribute('data-col-gap')}px`);
      }
    });

    it('does not apply gaps on mobile', () => {
      const { container } = render(
        <ColumnsContainer props={{ columnsCount: 3, ...marginProps }} columns={columns} mobile />
      );
      const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
      expect(colEls).toHaveLength(3);

      for (const col of colEls) {
        expect(col.style.marginLeft).toBe('0px');
        expect(col.style.marginRight).toBe('0px');
      }

      // No spacers either: the stacked view must have no horizontal spacing
      expect(container.querySelectorAll('[data-col-gap]')).toHaveLength(0);
    });

    it('keeps all column boxes the same width when a gap is present', () => {
      const { container } = render(<ColumnsContainer props={{ columnsCount: 3, ...marginProps }} columns={columns} />);
      const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
      expect(colEls).toHaveLength(3);

      const widths = colEls.map((col) => col.style.minWidth);
      expect(new Set(widths).size).toBe(1);
    });
  });
});
