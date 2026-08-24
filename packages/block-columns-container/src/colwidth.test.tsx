import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';
import { ColumnsContainer } from '@usewaypoint/block-columns-container';

const cols = [<>a</>, <>b</>, <>c</>];

function readProps(el: Element) {
  const col = el as HTMLElement;
  return {
    minWidth: col.style.minWidth,
    marginLeft: col.style.marginLeft,
    marginRight: col.style.marginRight,
    colWidth: col.getAttribute('data-col-width'),
  };
}

function readGaps(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-col-gap]'))
    .map((el) => el.getAttribute('data-col-gap'))
    .filter((v): v is string => v !== null);
}

describe('colwidth equality', () => {
  it('renders two equal columns with a gap', () => {
    const { container } = render(
      <ColumnsContainer
        props={{ columnsCount: 2, columnsGap: 16, marginBeforeFirst: 12, marginBeforeLast: 20 }}
        columns={cols}
      />
    );
    const els = Array.from(container.querySelectorAll('[class*="mj-column-per-"]'));
    const first = readProps(els[0]);
    const second = readProps(els[1]);

    expect(first.minWidth).toBeTruthy();
    expect(first.minWidth).toBe(second.minWidth);
    expect(first.colWidth).toBe(second.colWidth);

    // Columns stay margin-free; the gap is carried by spacers
    expect(first.marginLeft).toBe('0px');
    expect(second.marginLeft).toBe('0px');
    expect(second.marginRight).toBe('0px');
    expect(readGaps(container)).toEqual(['12', '16', '20']);
  });

  it('renders three equal columns with a gap', () => {
    const { container } = render(
      <ColumnsContainer
        props={{ columnsCount: 3, columnsGap: 16, marginBeforeFirst: 12, marginBeforeLast: 20 }}
        columns={cols}
      />
    );
    const els = Array.from(container.querySelectorAll('[class*="mj-column-per-"]')) as Element[];
    const props = els.map(readProps);

    expect(props).toHaveLength(3);
    expect(props[0].minWidth).toBeTruthy();
    expect(new Set(props.map((p) => p.minWidth)).size).toBe(1);
    expect(new Set(props.map((p) => p.colWidth)).size).toBe(1);

    // Columns stay margin-free; the gap is carried by spacers
    for (const p of props) {
      expect(p.marginLeft).toBe('0px');
      expect(p.marginRight).toBe('0px');
    }
    expect(readGaps(container)).toEqual(['12', '16', '16', '20']);
  });
});
