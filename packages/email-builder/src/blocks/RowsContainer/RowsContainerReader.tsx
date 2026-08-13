import React from 'react';

import { RowsContainer as BaseRowsContainer } from '@usewaypoint/block-rows-container';

import { ReaderBlock, usePreviewContext } from '../../Reader/core';

import { RowsContainerProps } from './RowsContainerPropsSchema';

export default function RowsContainerReader({ style, props }: RowsContainerProps) {
  const { screenSize } = usePreviewContext();
  const { rows, ...restProps } = props ?? {};
  let renderedRows = undefined;
  if (rows) {
    renderedRows = rows.map((row) => row.childrenIds.map((childId) => <ReaderBlock key={childId} id={childId} />));
  }

  return <BaseRowsContainer props={restProps} rows={renderedRows} style={style} mobile={screenSize === 'mobile'} />;
}
