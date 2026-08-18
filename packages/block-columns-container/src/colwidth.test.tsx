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
    expect(first.marginLeft).toBe('12px');
    expect(second.marginLeft).toBe('16px');
    expect(second.marginRight).toBe('20px');
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
    expect(props[0].marginLeft).toBe('12px');
    expect(props[1].marginLeft).toBe('16px');
    expect(props[2].marginLeft).toBe('16px');
    expect(props[2].marginRight).toBe('20px');
  });
});
