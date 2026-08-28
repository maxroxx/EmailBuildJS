import React from 'react';

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { act, render } from '@testing-library/react';

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

  describe('desktop style has no width-derived stacking calc', () => {
    const columns = [<>bread</>, <>tomato</>, <>lettuce</>];

    it('does not contain calc() in non-mobile column style for any margin value', () => {
      const marginValues = [
        { columnsGap: 0, marginBeforeFirst: 0, marginBeforeLast: 0 },
        { columnsGap: 8, marginBeforeFirst: 8, marginBeforeLast: 8 },
        { columnsGap: 16, marginBeforeFirst: 16, marginBeforeLast: 16 },
        { columnsGap: 32, marginBeforeFirst: 32, marginBeforeLast: 32 },
      ];

      marginValues.forEach(({ columnsGap, marginBeforeFirst, marginBeforeLast }) => {
        const { container } = render(
          <ColumnsContainer
            props={{
              columnsCount: 2,
              columnsGap,
              marginBeforeFirst,
              marginBeforeLast,
            }}
            columns={columns}
          />
        );
        const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
        colEls.forEach((col) => {
          expect(col.style.width).not.toContain('calc(');
          expect(col.style.width).toMatch(/^\d+(\.\d+)?%$/);
        });
      });
    });

    it('mobile prop drives stacking independently of margins', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];

      // Non-mobile: always horizontal (inline-block) regardless of margins
      const desktop = render(
        <ColumnsContainer
          props={{
            columnsCount: 2,
            columnsGap: 16,
            marginBeforeFirst: 16,
            marginBeforeLast: 16,
          }}
          columns={columns}
        />
      );
      const desktopCols = Array.from(desktop.container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
      desktopCols.forEach((col) => {
        expect(col.style.display).toBe('inline-block');
      });

      // Mobile: always stacked (block) regardless of margins
      const mobile = render(
        <ColumnsContainer
          props={{
            columnsCount: 2,
            columnsGap: 16,
            marginBeforeFirst: 16,
            marginBeforeLast: 16,
          }}
          columns={columns}
          mobile
        />
      );
      const mobileCols = Array.from(mobile.container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
      mobileCols.forEach((col) => {
        expect(col.style.display).toBe('block');
        expect(col.style.width).toBe('100%');
      });
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

describe('viewport width responsiveness', () => {
  let savedRO: typeof window.ResizeObserver | undefined;
  let capturedCallback: ((entries: unknown[]) => void) | null = null;
  let capturedEl: HTMLElement | null = null;

  class TestResizeObserver {
    constructor(cb: (entries: unknown[]) => void) {
      capturedCallback = cb;
    }
    observe(el: HTMLElement) {
      capturedEl = el;
    }
    disconnect() {
      capturedCallback = null;
      capturedEl = null;
    }
  }

  beforeEach(() => {
    savedRO = (globalThis as any).ResizeObserver;
    (globalThis as any).ResizeObserver = TestResizeObserver;
  });

  afterEach(() => {
    if (savedRO !== undefined) {
      (globalThis as any).ResizeObserver = savedRO;
    } else {
      delete (globalThis as any).ResizeObserver;
    }
    capturedCallback = null;
    capturedEl = null;
  });

  function fireResize(width: number) {
    if (capturedEl && capturedCallback) {
      (capturedEl as any).getBoundingClientRect = () => ({
        width,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      act(() => {
        capturedCallback!([]);
      });
    }
  }

  function renderWithRoot(jsx: React.ReactElement) {
    return render(
      <div data-email-builder-root style={{ width: 700 }}>
        {jsx}
      </div>
    );
  }

  it('renders horizontal (inline-block) when measured width is 700', () => {
    const { container } = renderWithRoot(
      <ColumnsContainer
        props={{ columnsCount: 2, marginBeforeFirst: 16, marginBeforeLast: 16 }}
        columns={[<>bread</>, <>tomato</>]}
      />
    );
    fireResize(700);
    const wrapper = container.querySelector('.mj-column-wrapper') as HTMLElement;
    expect(wrapper.style.display).toBe('');
    const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
    colEls.forEach((col) => expect(col.style.display).toBe('inline-block'));
    const spacers = container.querySelectorAll('[data-col-gap]');
    expect(spacers).toHaveLength(2);
  });

  it('renders stacked (block) when measured width drops to 599', () => {
    const { container } = renderWithRoot(
      <ColumnsContainer
        props={{ columnsCount: 2, marginBeforeFirst: 16, marginBeforeLast: 16 }}
        columns={[<>bread</>, <>tomato</>]}
      />
    );
    fireResize(599);
    const wrapper = container.querySelector('.mj-column-wrapper') as HTMLElement;
    expect(wrapper.style.display).toBe('block');
    const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
    colEls.forEach((col) => expect(col.style.display).toBe('block'));
    colEls.forEach((col) => expect(col.style.width).toBe('100%'));
    expect(container.querySelectorAll('[data-col-gap]')).toHaveLength(0);
  });

  it('renders horizontal when measured width returns to 600', () => {
    const { container } = renderWithRoot(
      <ColumnsContainer
        props={{ columnsCount: 2, marginBeforeFirst: 16, marginBeforeLast: 16 }}
        columns={[<>bread</>, <>tomato</>]}
      />
    );
    fireResize(599);
    fireResize(600);
    const wrapper = container.querySelector('.mj-column-wrapper') as HTMLElement;
    expect(wrapper.style.display).toBe('');
    const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
    colEls.forEach((col) => expect(col.style.display).toBe('inline-block'));
  });

  it('is margin-independent at 599px', () => {
    const margins = [
      { marginBeforeFirst: 0, marginBeforeLast: 0 },
      { marginBeforeFirst: 16, marginBeforeLast: 16 },
      { marginBeforeFirst: 32, marginBeforeLast: 32 },
    ];
    margins.forEach(({ marginBeforeFirst, marginBeforeLast }) => {
      const { container } = renderWithRoot(
        <ColumnsContainer
          props={{ columnsCount: 2, marginBeforeFirst, marginBeforeLast }}
          columns={[<>bread</>, <>tomato</>]}
        />
      );
      fireResize(599);
      const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
      colEls.forEach((col) => expect(col.style.display).toBe('block'));
      colEls.forEach((col) => expect(col.style.width).toBe('100%'));
      expect(container.querySelectorAll('[data-col-gap]')).toHaveLength(0);
    });
  });

  it('respects the mobile prop even when measured width is 700', () => {
    const { container } = renderWithRoot(
      <ColumnsContainer
        mobile
        props={{ columnsCount: 2, marginBeforeFirst: 16, marginBeforeLast: 16 }}
        columns={[<>bread</>, <>tomato</>]}
      />
    );
    fireResize(700);
    const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
    colEls.forEach((col) => expect(col.style.display).toBe('block'));
    expect(container.querySelectorAll('[data-col-gap]')).toHaveLength(0);
  });

  it('falls back to observing own div when no data-email-builder-root ancestor', () => {
    const { container } = render(
      <ColumnsContainer
        props={{ columnsCount: 2, marginBeforeFirst: 16, marginBeforeLast: 16 }}
        columns={[<>bread</>, <>tomato</>]}
      />
    );
    fireResize(599);
    const colEls = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as HTMLElement[];
    colEls.forEach((col) => expect(col.style.display).toBe('block'));
  });
});
