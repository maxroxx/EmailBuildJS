import React from 'react';

import { RowsContainer as BaseRowsContainer } from '@usewaypoint/block-rows-container';

import { useCurrentBlockId } from '../../editor/EditorBlock';
import { setDocument, setSelectedBlockId, useSelectedScreenSize } from '../../editor/EditorContext';
import EditorChildrenIds, { EditorChildrenChange } from '../helpers/EditorChildrenIds';

import RowsContainerPropsSchema, { RowsContainerProps } from './RowsContainerPropsSchema';

const EMPTY_ROWS = [
  { childrenIds: [] },
  { childrenIds: [] },
  { childrenIds: [] },
  { childrenIds: [] },
  { childrenIds: [] },
  { childrenIds: [] },
];

export default function RowsContainerEditor({ style, props }: RowsContainerProps) {
  const currentBlockId = useCurrentBlockId();
  const screenSize = useSelectedScreenSize();

  const rowsValue = props?.rows ?? EMPTY_ROWS;
  const rowsCount = props?.rowsCount ?? 3;
  const { ...restProps } = props ?? {};

  const updateRow = (rowIndex: number, { block, blockId, childrenIds }: EditorChildrenChange) => {
    const nRows = [...rowsValue];
    nRows[rowIndex] = { childrenIds };
    setDocument({
      [blockId]: block,
      [currentBlockId]: {
        type: 'RowsContainer',
        data: RowsContainerPropsSchema.parse({
          style,
          props: {
            ...restProps,
            rows: nRows,
          },
        }),
      },
    });
    setSelectedBlockId(blockId);
  };

  const rowIndices = Array.from({ length: rowsCount }, (_, i) => i);

  return (
    <BaseRowsContainer
      props={restProps}
      style={style}
      mobile={screenSize === 'mobile'}
      rows={rowIndices.map((i) => (
        <EditorChildrenIds
          key={i}
          showTrailingButton={false}
          showLeadingButton={false}
          childrenIds={rowsValue?.[i]?.childrenIds}
          onChange={(change) => updateRow(i, change)}
        />
      ))}
    />
  );
}
