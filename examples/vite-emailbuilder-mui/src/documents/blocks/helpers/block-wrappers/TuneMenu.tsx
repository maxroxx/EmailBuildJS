import React from 'react';

import {
  ArrowBackOutlined,
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  ContentCopyOutlined,
  DeleteOutlined,
} from '@mui/icons-material';
import { Divider, IconButton, Paper, Stack, SxProps, Tooltip } from '@mui/material';

import { TEditorBlock, TEditorConfiguration } from '../../../editor/core';
import { resetDocument, setSelectedBlockId, useDocument } from '../../../editor/EditorContext';
import { ColumnsContainerProps } from '../../ColumnsContainer/ColumnsContainerPropsSchema';
import { RowsContainerProps } from '../../RowsContainer/RowsContainerPropsSchema';
import cloneDocumentBlock from '../cloneDocumentBlock';

const sx: SxProps = {
  position: 'absolute',
  top: 0,
  left: -56,
  borderRadius: 64,
  paddingX: 0.5,
  paddingY: 1,
  zIndex: 'fab',
};

function findParentBlockId(blockId: string, document: TEditorConfiguration) {
  for (const [id, b] of Object.entries(document)) {
    if (id === blockId) {
      continue;
    }
    const block = b as TEditorBlock;
    switch (block.type) {
      case 'EmailLayout':
        if (block.data.childrenIds?.includes(blockId)) {
          return id;
        }
        break;
      case 'Container':
        if (block.data.props?.childrenIds?.includes(blockId)) {
          return id;
        }
        break;
      case 'ColumnsContainer':
        if (block.data.props?.columns?.some((col) => col.childrenIds?.includes(blockId))) {
          return id;
        }
        break;
      case 'RowsContainer':
        if (block.data.props?.rows?.some((row) => row.childrenIds?.includes(blockId))) {
          return id;
        }
        break;
    }
  }
  return null;
}

function findSiblingIndex(blockId: string, document: TEditorConfiguration) {
  for (const [id, b] of Object.entries(document)) {
    if (id === blockId) {
      continue;
    }
    const block = b as TEditorBlock;
    switch (block.type) {
      case 'EmailLayout': {
        const index = block.data.childrenIds?.indexOf(blockId) ?? -1;
        if (index >= 0) {
          return { parentId: id, childrenIds: block.data.childrenIds, index };
        }
        break;
      }
      case 'Container': {
        const index = block.data.props?.childrenIds?.indexOf(blockId) ?? -1;
        if (index >= 0) {
          return { parentId: id, childrenIds: block.data.props?.childrenIds, index };
        }
        break;
      }
      case 'ColumnsContainer': {
        for (const col of block.data.props?.columns ?? []) {
          const index = col.childrenIds?.indexOf(blockId) ?? -1;
          if (index >= 0) {
            return { parentId: id, childrenIds: col.childrenIds, index };
          }
        }
        break;
      }
      case 'RowsContainer': {
        for (const row of block.data.props?.rows ?? []) {
          const index = row.childrenIds?.indexOf(blockId) ?? -1;
          if (index >= 0) {
            return { parentId: id, childrenIds: row.childrenIds, index };
          }
        }
        break;
      }
    }
  }
  return null;
}

type Props = {
  blockId: string;
};
export default function TuneMenu({ blockId }: Props) {
  const document = useDocument();

  const handleSelectParentClick = () => {
    const parentId = findParentBlockId(blockId, document);
    if (parentId) {
      setSelectedBlockId(parentId);
    }
  };

  const handleSelectPreviousSiblingClick = () => {
    const info = findSiblingIndex(blockId, document);
    if (info && info.index > 0) {
      setSelectedBlockId(info.childrenIds![info.index - 1]);
    }
  };

  const handleSelectNextSiblingClick = () => {
    const info = findSiblingIndex(blockId, document);
    if (info && info.index < (info.childrenIds?.length ?? 0) - 1) {
      setSelectedBlockId(info.childrenIds![info.index + 1]);
    }
  };

  const handleDuplicateClick = () => {
    const parentBlockId = findParentBlockId(blockId, document);

    const { document: newDocument, blockId: newBlockId } = cloneDocumentBlock(document, blockId);

    if (parentBlockId) {
      const parentBlock = newDocument[parentBlockId];
      switch (parentBlock.type) {
        case 'EmailLayout': {
          if (!parentBlock.data.childrenIds) {
            parentBlock.data.childrenIds = [];
          }
          const index = parentBlock.data.childrenIds.indexOf(blockId);
          parentBlock.data.childrenIds.splice(index + 1, 0, newBlockId);
          break;
        }
        case 'Container': {
          if (!parentBlock.data.props) {
            parentBlock.data.props = {};
          }
          if (!parentBlock.data.props.childrenIds) {
            parentBlock.data.props.childrenIds = [];
          }
          const index = parentBlock.data.props.childrenIds.indexOf(blockId);
          parentBlock.data.props.childrenIds.splice(index + 1, 0, newBlockId);
          break;
        }
        case 'ColumnsContainer':
          if (!parentBlock.data.props) {
            parentBlock.data.props = { columns: [{ childrenIds: [] }, { childrenIds: [] }, { childrenIds: [] }] };
          }

          for (const column of parentBlock.data.props.columns) {
            if (column.childrenIds.includes(blockId)) {
              const index = column.childrenIds.indexOf(blockId);
              column.childrenIds.splice(index + 1, 0, newBlockId);
            }
          }
          break;
        case 'RowsContainer':
          if (!parentBlock.data.props) {
            parentBlock.data.props = { rows: [{ childrenIds: [] }, { childrenIds: [] }, { childrenIds: [] }] };
          }

          for (const row of parentBlock.data.props.rows) {
            if (row.childrenIds.includes(blockId)) {
              const index = row.childrenIds.indexOf(blockId);
              row.childrenIds.splice(index + 1, 0, newBlockId);
            }
          }
          break;
      }

      resetDocument(newDocument);
      setSelectedBlockId(newBlockId);
    }
  };

  const handleDeleteClick = () => {
    const filterChildrenIds = (childrenIds: string[] | null | undefined) => {
      if (!childrenIds) {
        return childrenIds;
      }
      return childrenIds.filter((f) => f !== blockId);
    };
    const nDocument: typeof document = { ...document };
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock;
      if (id === blockId) {
        continue;
      }

      switch (block.type) {
        case 'EmailLayout':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: filterChildrenIds(block.data.childrenIds),
            },
          };
          break;
        case 'Container':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...block.data.props,
                childrenIds: filterChildrenIds(block.data.props?.childrenIds),
              },
            },
          };
          break;
        case 'ColumnsContainer':
          nDocument[id] = {
            type: 'ColumnsContainer',
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                columns: block.data.props?.columns?.map((c) => ({
                  childrenIds: filterChildrenIds(c.childrenIds),
                })),
              },
            } as ColumnsContainerProps,
          };
          break;
        case 'RowsContainer':
          nDocument[id] = {
            type: 'RowsContainer',
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                rows: block.data.props?.rows?.map((r) => ({
                  childrenIds: filterChildrenIds(r.childrenIds),
                })),
              },
            } as RowsContainerProps,
          };
          break;
        default:
          nDocument[id] = block;
      }
    }
    delete nDocument[blockId];
    resetDocument(nDocument);
  };

  const handleMoveClick = (direction: 'up' | 'down') => {
    const moveChildrenIds = (ids: string[] | null | undefined) => {
      if (!ids) {
        return ids;
      }
      const index = ids.indexOf(blockId);
      if (index < 0) {
        return ids;
      }

      const childrenIds = [...ids];
      if (direction === 'up' && index > 0) {
        [childrenIds[index], childrenIds[index - 1]] = [childrenIds[index - 1], childrenIds[index]];
      } else if (direction === 'down' && index < childrenIds.length - 1) {
        [childrenIds[index], childrenIds[index + 1]] = [childrenIds[index + 1], childrenIds[index]];
      }
      return childrenIds;
    };

    const nDocument: typeof document = { ...document };
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock;
      if (id === blockId) {
        continue;
      }

      switch (block.type) {
        case 'EmailLayout':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: moveChildrenIds(block.data.childrenIds),
            },
          };
          break;
        case 'Container':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...block.data.props,
                childrenIds: moveChildrenIds(block.data.props?.childrenIds),
              },
            },
          };
          break;
        case 'ColumnsContainer':
          nDocument[id] = {
            type: 'ColumnsContainer',
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                columns: block.data.props?.columns?.map((c) => ({
                  childrenIds: moveChildrenIds(c.childrenIds),
                })),
              },
            } as ColumnsContainerProps,
          };
          break;
        case 'RowsContainer':
          nDocument[id] = {
            type: 'RowsContainer',
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                rows: block.data.props?.rows?.map((r) => ({
                  childrenIds: moveChildrenIds(r.childrenIds),
                })),
              },
            } as RowsContainerProps,
          };
          break;
        default:
          nDocument[id] = block;
      }
    }

    resetDocument(nDocument);
    setSelectedBlockId(blockId);
  };

  return (
    <Paper sx={sx} onClick={(ev) => ev.stopPropagation()}>
      <Stack>
        <Tooltip title="Select parent" placement="left-start">
          <span style={{ display: 'flex' }}>
            <IconButton
              onClick={handleSelectParentClick}
              disabled={findParentBlockId(blockId, document) === null}
              sx={{ color: 'text.primary' }}
            >
              <ArrowBackOutlined fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Select previous sibling" placement="left-start">
          <span style={{ display: 'flex' }}>
            <IconButton
              onClick={handleSelectPreviousSiblingClick}
              disabled={findSiblingIndex(blockId, document) === null || findSiblingIndex(blockId, document)!.index <= 0}
              sx={{ color: 'text.primary' }}
            >
              <ArrowUpwardOutlined fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Select next sibling" placement="left-start">
          <span style={{ display: 'flex' }}>
            <IconButton
              onClick={handleSelectNextSiblingClick}
              disabled={
                findSiblingIndex(blockId, document) === null ||
                findSiblingIndex(blockId, document)!.index >=
                  (findSiblingIndex(blockId, document)!.childrenIds?.length ?? 0) - 1
              }
              sx={{ color: 'text.primary' }}
            >
              <ArrowDownwardOutlined fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Divider sx={{ borderColor: 'divider', my: 0.5 }} />
        <Tooltip title="Move up" placement="left-start">
          <IconButton onClick={() => handleMoveClick('up')} sx={{ color: 'text.primary' }}>
            <ArrowUpwardOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move down" placement="left-start">
          <IconButton onClick={() => handleMoveClick('down')} sx={{ color: 'text.primary' }}>
            <ArrowDownwardOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Duplicate" placement="left-start">
          <IconButton onClick={handleDuplicateClick} sx={{ color: 'text.primary' }}>
            <ContentCopyOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" placement="left-start">
          <IconButton onClick={handleDeleteClick} sx={{ color: 'text.primary' }}>
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
