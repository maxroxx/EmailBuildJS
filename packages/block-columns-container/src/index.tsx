import React, { CSSProperties } from 'react';
import { z } from 'zod';

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable()
  .optional();

const PADDING_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable();

const FIXED_WIDTHS_SCHEMA = z
  .tuple([z.number().nullish(), z.number().nullish(), z.number().nullish()])
  .optional()
  .nullable();

export const ColumnsContainerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      fixedWidths: FIXED_WIDTHS_SCHEMA,
      columnsCount: z
        .union([z.literal(2), z.literal(3)])
        .optional()
        .nullable(),
      contentAlignment: z.enum(['top', 'middle', 'bottom']).optional().nullable(),
    })
    .optional()
    .nullable(),
});

type TColumn = JSX.Element | JSX.Element[] | null;
export type ColumnsContainerProps = z.infer<typeof ColumnsContainerPropsSchema> & {
  columns?: TColumn[];
  mobile?: boolean;
};

const ColumnsContainerPropsDefaults = {
  columnsCount: 2,
  contentAlignment: 'middle',
} as const;

export function ColumnsContainer({ style, columns, props, mobile }: ColumnsContainerProps) {
  const wStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
    paddingTop: 16,
    paddingBottom: 16,
  };

  const blockProps = {
    columnsCount: props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount,
    contentAlignment: props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment,
    fixedWidths: props?.fixedWidths,
    innerWidth: DEFAULT_CONTAINER_WIDTH,
  };

  return (
    <div style={wStyle}>
      <div
        className="mj-column-wrapper"
        style={{
          fontSize: '0',
          textAlign: 'left',
          display: mobile ? 'block' : undefined,
        }}
      >
        {[0, 1, 2].map((index) => (
          <ColumnWrapper key={index} index={index} props={blockProps} columns={columns} mobile={mobile} />
        ))}
      </div>
    </div>
  );
}

type ColumnWrapperProps = {
  props: {
    fixedWidths: z.infer<typeof FIXED_WIDTHS_SCHEMA>;
    columnsCount: 2 | 3;
    contentAlignment: 'top' | 'middle' | 'bottom';
    innerWidth: number;
  };
  index: number;
  columns?: TColumn[];
  mobile?: boolean;
};
function ColumnWrapper({ index, props, columns, mobile }: ColumnWrapperProps) {
  const columnsCount = props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount;

  if (columnsCount === 2 && index === 2) {
    return null;
  }

  const contentAlignment = props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment;
  const maxWidth = props?.fixedWidths?.[index] ?? getEqualMaxWidth(index, props);
  const colWidth = mobile ? '100%' : maxWidth;

  const children = columns?.[index];
  const renderedChildren = Array.isArray(children) ? <>{children}</> : children;

  const columnClass = getColumnClass(columnsCount, maxWidth, props.innerWidth);

  return (
    <div
      className={columnClass}
      style={{
        display: mobile ? 'block' : 'inline-block',
        verticalAlign: mobile ? 'top' : contentAlignment,
        width: colWidth,
        maxWidth: colWidth,
        minHeight: 40,
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <table
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        border={0}
        style={{ borderCollapse: 'collapse', borderSpacing: '0px' }}
        role="presentation"
      >
        <tbody>
          <tr>
            <td
              style={{
                boxSizing: 'content-box',
                verticalAlign: mobile ? 'top' : contentAlignment,
                fontSize: '16px',
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              {renderedChildren}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const DEFAULT_CONTAINER_WIDTH = 600;

function getEqualMaxWidth(
  index: number,
  { columnsCount, fixedWidths, innerWidth }: ColumnWrapperProps['props']
): number | undefined {
  if (fixedWidths && index < columnsCount) {
    const width = fixedWidths[index];
    if (typeof width === 'number') {
      return width;
    }
  }
  return innerWidth / columnsCount;
}

function getColumnClass(columnsCount: number, maxWidth: number | undefined, innerWidth: number): string {
  if (!maxWidth) {
    return '';
  }
  const percentage = (maxWidth / innerWidth) * 100;
  const roundedPercentage = Math.round(percentage * 1e12) / 1e12;
  return `mj-column-per-${roundedPercentage}`;
}
