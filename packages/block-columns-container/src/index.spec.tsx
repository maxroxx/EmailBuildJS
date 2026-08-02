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
});
