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

    it('applies margins on desktop', () => {
      const { container } = render(<ColumnsContainer props={{ columnsCount: 3, ...marginProps }} columns={columns} />);
      const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
      expect(colEls).toHaveLength(3);

      // First column: outer-left margin
      expect(colEls[0].style.marginLeft).toBe('12px');
      // Middle columns: between-gap on the left
      expect(colEls[1].style.marginLeft).toBe('16px');
      expect(colEls[2].style.marginLeft).toBe('16px');
      // Last column: outer-right margin
      expect(colEls[2].style.marginRight).toBe('20px');
    });

    it('does not apply margins on mobile', () => {
      const { container } = render(
        <ColumnsContainer props={{ columnsCount: 3, ...marginProps }} columns={columns} mobile />
      );
      const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
      expect(colEls).toHaveLength(3);

      for (const col of colEls) {
        expect(col.style.marginLeft).toBe('0px');
        expect(col.style.marginRight).toBe('0px');
      }
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
