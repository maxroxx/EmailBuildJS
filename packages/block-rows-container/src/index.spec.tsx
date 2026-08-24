import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { RowsContainer } from '.';

describe('block-rows-container', () => {
  it('renders with default values', () => {
    expect(render(<RowsContainer />).asFragment()).toMatchSnapshot();
  });

  it('renders full-width rows with mj-row-per-100 class', () => {
    const rows = [<>bread</>, <>tomato</>];
    const { container } = render(<RowsContainer props={{ rowsCount: 2 }} rows={rows} />);
    const rowEls = Array.from(container.querySelectorAll('[class*="mj-row-per-"]')) as HTMLElement[];
    expect(rowEls).toHaveLength(2);
    for (const row of rowEls) {
      expect(row.className).toBe('mj-row-per-100');
      expect(row.style.width).toBe('100%');
      expect(row.style.maxWidth).toBe('100%');
    }
  });

  it('renders custom widths with percentage classes', () => {
    const rows = [<>wide</>, <>narrow</>, <>medium</>];
    const { container } = render(<RowsContainer props={{ rowsCount: 3, fixedWidths: [400, 200, 300] }} rows={rows} />);
    const rowEls = Array.from(container.querySelectorAll('[class*="mj-row-per-"]')) as HTMLElement[];
    expect(rowEls.map((el) => el.className)).toEqual(['mj-row-per-67', 'mj-row-per-33', 'mj-row-per-50']);
  });

  describe('rowsCount 2', () => {
    it('renders row children', () => {
      const rows = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(render(<RowsContainer props={{ rowsCount: 2 }} rows={rows} />).asFragment()).toMatchSnapshot();
    });
  });

  describe('rowsCount 3', () => {
    it('renders row children', () => {
      const rows = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(render(<RowsContainer props={{ rowsCount: 3 }} rows={rows} />).asFragment()).toMatchSnapshot();
    });
  });

  describe('rowsCount 4', () => {
    it('renders 4 row children', () => {
      const rows = [<>row1</>, <>row2</>, <>row3</>, <>row4</>, <>row5</>, <>row6</>];
      expect(render(<RowsContainer props={{ rowsCount: 4 }} rows={rows} />).asFragment()).toMatchSnapshot();
    });
  });

  describe('rowsCount 5', () => {
    it('renders 5 row children', () => {
      const rows = [<>row1</>, <>row2</>, <>row3</>, <>row4</>, <>row5</>, <>row6</>];
      expect(render(<RowsContainer props={{ rowsCount: 5 }} rows={rows} />).asFragment()).toMatchSnapshot();
    });
  });

  describe('rowsCount 6', () => {
    it('renders 6 row children', () => {
      const rows = [<>row1</>, <>row2</>, <>row3</>, <>row4</>, <>row5</>, <>row6</>];
      expect(render(<RowsContainer props={{ rowsCount: 6 }} rows={rows} />).asFragment()).toMatchSnapshot();
    });
  });

  describe('fixedWidths', () => {
    it('applies custom widths', () => {
      const rows = [<>wide</>, <>narrow</>, <>medium</>];
      expect(
        render(<RowsContainer props={{ rowsCount: 3, fixedWidths: [400, 200, 300] }} rows={rows} />).asFragment()
      ).toMatchSnapshot();
    });
  });

  describe('fixedHeights', () => {
    it('applies custom heights to rows', () => {
      const rows = [<>wide</>, <>narrow</>, <>medium</>];
      const { container } = render(
        <RowsContainer props={{ rowsCount: 3, fixedHeights: [200, null, 100] }} rows={rows} />
      );
      const rowEls = Array.from(container.querySelectorAll('[class*="mj-row-per-"]')) as HTMLElement[];
      expect(rowEls).toHaveLength(3);
      expect(rowEls[0].style.minHeight).toBe('200px');
      expect(rowEls[0].getAttribute('data-row-height')).toBe('200');
      expect(rowEls[1].style.minHeight).toBe('40px');
      expect(rowEls[1].getAttribute('data-row-height')).toBeNull();
      expect(rowEls[2].style.minHeight).toBe('100px');
      expect(rowEls[2].getAttribute('data-row-height')).toBe('100');
    });

    it('applies height to table cell td', () => {
      const rows = [<>row1</>, <>row2</>];
      const { container } = render(<RowsContainer props={{ rowsCount: 2, fixedHeights: [200, null] }} rows={rows} />);
      const tds = Array.from(container.querySelectorAll('td')) as HTMLElement[];
      expect(tds[0].style.height).toBe('200px');
      expect(tds[1].style.height).toBe('');
    });

    it('renders snapshot with fixedHeights', () => {
      const rows = [<>row1</>, <>row2</>, <>row3</>];
      expect(
        render(<RowsContainer props={{ rowsCount: 3, fixedHeights: [150, 100, null] }} rows={rows} />).asFragment()
      ).toMatchSnapshot();
    });
  });

  describe('contentAlignment', () => {
    it('renders with top alignment', () => {
      const rows = [<>top</>, <>middle</>];
      expect(
        render(<RowsContainer props={{ rowsCount: 2, contentAlignment: 'top' }} rows={rows} />).asFragment()
      ).toMatchSnapshot();
    });

    it('renders with bottom alignment', () => {
      const rows = [<>top</>, <>bottom</>];
      expect(
        render(<RowsContainer props={{ rowsCount: 2, contentAlignment: 'bottom' }} rows={rows} />).asFragment()
      ).toMatchSnapshot();
    });
  });

  describe('mobile mode', () => {
    it('renders rows in mobile mode', () => {
      const rows = [<>bread</>, <>tomato</>];
      expect(
        render(<RowsContainer props={{ rowsCount: 2 }} rows={rows} mobile={true} />).asFragment()
      ).toMatchSnapshot();
    });
  });
});
