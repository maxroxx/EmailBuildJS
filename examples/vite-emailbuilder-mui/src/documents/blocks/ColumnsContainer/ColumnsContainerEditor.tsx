import React from 'react';

import { ColumnsContainer as BaseColumnsContainer } from '@usewaypoint/block-columns-container';

import { useCurrentBlockId } from '../../editor/EditorBlock';
import { setDocument, setSelectedBlockId, useSelectedScreenSize } from '../../editor/EditorContext';
import EditorChildrenIds, { EditorChildrenChange } from '../helpers/EditorChildrenIds';

import ColumnsContainerPropsSchema, { ColumnsContainerProps } from './ColumnsContainerPropsSchema';

const EMPTY_COLUMNS = [{ childrenIds: [] }, { childrenIds: [] }, { childrenIds: [] }];

export default function ColumnsContainerEditor({ style, props }: ColumnsContainerProps) {
  const currentBlockId = useCurrentBlockId();
  const screenSize = useSelectedScreenSize();

  const { columns, ...restProps } = props ?? {};
  const columnsValue = columns ?? EMPTY_COLUMNS;

  const updateColumn = (columnIndex: 0 | 1 | 2, { block, blockId, childrenIds }: EditorChildrenChange) => {
    const nColumns = [...columnsValue];
    nColumns[columnIndex] = { childrenIds };
    setDocument({
      [blockId]: block,
      [currentBlockId]: {
        type: 'ColumnsContainer',
        data: ColumnsContainerPropsSchema.parse({
          style,
          props: {
            ...restProps,
            columns: nColumns,
          },
        }),
      },
    });
    setSelectedBlockId(blockId);
  };

  return (
    <BaseColumnsContainer
      props={restProps}
      style={style}
      mobile={screenSize === 'mobile'}
      columns={[
        <EditorChildrenIds
          showTrailingButton={false}
          showLeadingButton={false}
          childrenIds={columns?.[0]?.childrenIds}
          onChange={(change) => updateColumn(0, change)}
        />,
        <EditorChildrenIds
          showTrailingButton={false}
          showLeadingButton={false}
          childrenIds={columns?.[1]?.childrenIds}
          onChange={(change) => updateColumn(1, change)}
        />,
        <EditorChildrenIds
          showTrailingButton={false}
          showLeadingButton={false}
          childrenIds={columns?.[2]?.childrenIds}
          onChange={(change) => updateColumn(2, change)}
        />,
      ]}
    />
  );
}
