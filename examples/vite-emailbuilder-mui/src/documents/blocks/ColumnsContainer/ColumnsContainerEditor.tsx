import React from 'react';

import { ColumnsContainer as BaseColumnsContainer } from '@usewaypoint/block-columns-container';

import { useCurrentBlockId } from '../../editor/EditorBlock';
import { setDocument, setSelectedBlockId, useSelectedScreenSize } from '../../editor/EditorContext';
import EditorChildrenIds, { EditorChildrenChange } from '../helpers/EditorChildrenIds';

import ColumnsContainerPropsSchema, { ColumnsContainerProps } from './ColumnsContainerPropsSchema';

const EMPTY_COLUMNS = [{ childrenIds: [] }, { childrenIds: [] }, { childrenIds: [] }];

export default function ColumnsContainerEditor({ style, props }: ColumnsContainerProps) {
  const currentBlockId = useCurrentBlockId();
  const selectedScreenSize = useSelectedScreenSize();

  const { columns, ...restProps } = props ?? {};
  const forceStack = selectedScreenSize === 'mobile' && props?.stackOnMobile === true;
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
    <>
      {forceStack && (
        <style>{`
          .columns-container-stack td.column-cell {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        `}</style>
      )}
      <BaseColumnsContainer
        props={restProps}
        style={style}
        columns={[
          <EditorChildrenIds childrenIds={columns?.[0]?.childrenIds} onChange={(change) => updateColumn(0, change)} />,
          <EditorChildrenIds childrenIds={columns?.[1]?.childrenIds} onChange={(change) => updateColumn(1, change)} />,
          <EditorChildrenIds childrenIds={columns?.[2]?.childrenIds} onChange={(change) => updateColumn(2, change)} />,
        ]}
      />
    </>
  );
}
