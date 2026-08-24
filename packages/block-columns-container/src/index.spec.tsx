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

  describe('fixedHeights', () => {
    it('applies custom heights to columns', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];
      const { container } = render(
        <ColumnsContainer props={{ columnsCount: 3, fixedHeights: [200, null, 100] }} columns={columns} />
      );
      const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
      expect(colEls).toHaveLength(3);
      expect(colEls[0].style.minHeight).toBe('200px');
      expect(colEls[0].getAttribute('data-col-height')).toBe('200');
      expect(colEls[1].style.minHeight).toBe('40px');
      expect(colEls[1].getAttribute('data-col-height')).toBeNull();
      expect(colEls[2].style.minHeight).toBe('100px');
      expect(colEls[2].getAttribute('data-col-height')).toBe('100');
    });

    it('applies height to table cell td', () => {
      const columns = [<>col1</>, <>col2</>];
      const { container } = render(
        <ColumnsContainer props={{ columnsCount: 2, fixedHeights: [200, null, null] }} columns={columns} />
      );
      const tds = Array.from(container.querySelectorAll('td')) as HTMLElement[];
      expect(tds[0].style.height).toBe('200px');
      expect(tds[1].style.height).toBe('');
    });

    it('renders snapshot with fixedHeights', () => {
      const columns = [<>col1</>, <>col2</>, <>col3</>];
      expect(
        render(
          <ColumnsContainer props={{ columnsCount: 3, fixedHeights: [150, 100, null] }} columns={columns} />
        ).asFragment()
      ).toMatchSnapshot();
    });
  });
});
