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

const FIXED_WIDTHS_SCHEMA = z.array(z.number().nullish()).optional().nullable();

export const RowsContainerPropsSchema = z.object({
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
      rowsCount: z
        .union([z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)])
        .optional()
        .nullable(),
      contentAlignment: z.enum(['top', 'middle', 'bottom']).optional().nullable(),
      rowsGap: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
});

type TRow = JSX.Element | JSX.Element[] | null;
export type RowsContainerProps = z.infer<typeof RowsContainerPropsSchema> & {
  rows?: TRow[];
  mobile?: boolean;
};

const RowsContainerPropsDefaults = {
  rowsCount: 2,
  contentAlignment: 'middle',
} as const;

export function RowsContainer({ style, rows, props }: RowsContainerProps) {
  const wStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
  };

  const blockProps = {
    rowsCount: props?.rowsCount ?? RowsContainerPropsDefaults.rowsCount,
    contentAlignment: props?.contentAlignment ?? RowsContainerPropsDefaults.contentAlignment,
    fixedWidths: props?.fixedWidths,
    innerWidth: DEFAULT_CONTAINER_WIDTH,
  };

  const rowsCount = blockProps.rowsCount;
  const rowIndices = Array.from({ length: rowsCount }, (_, i) => i);

  return (
    <div style={wStyle}>
      <div
        className="mj-row-wrapper"
        style={{
          display: 'block',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {rowIndices.map((index) => (
          <RowWrapper key={index} index={index} props={blockProps} rows={rows} />
        ))}
      </div>
    </div>
  );
}

type RowWrapperProps = {
  props: {
    fixedWidths: z.infer<typeof FIXED_WIDTHS_SCHEMA>;
    rowsCount: number;
    contentAlignment: 'top' | 'middle' | 'bottom';
    innerWidth: number;
  };
  index: number;
  rows?: TRow[];
};
function RowWrapper({ index, props, rows }: RowWrapperProps) {
  const rowsCount = props?.rowsCount ?? RowsContainerPropsDefaults.rowsCount;
  const contentAlignment = props?.contentAlignment ?? RowsContainerPropsDefaults.contentAlignment;
  const maxWidth = props?.fixedWidths?.[index] ?? getEqualMaxWidth(index, props);
  const widthValue = maxWidth ?? props.innerWidth;

  const children = rows?.[index];
  const renderedChildren = Array.isArray(children) ? <>{children}</> : children;

  const rowClass = getRowClass(rowsCount, maxWidth, props.innerWidth);

  const rowStyle: CSSProperties = {
    display: 'block',
    width: maxWidth ? `${maxWidth}px` : '100%',
    maxWidth: maxWidth ? `${maxWidth}px` : '100%',
    verticalAlign: 'top',
    minHeight: 40,
    margin: 0,
    boxSizing: 'border-box',
  };

  return (
    <div className={rowClass} style={rowStyle} data-row-width={widthValue} data-row-count={rowsCount}>
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
                verticalAlign: contentAlignment,
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

function getEqualMaxWidth(index: number, { rowsCount, fixedWidths }: RowWrapperProps['props']): number | undefined {
  if (fixedWidths && index < rowsCount) {
    const width = fixedWidths[index];
    if (typeof width === 'number') {
      return width;
    }
  }
  return undefined;
}

function getRowClass(rowsCount: number, maxWidth: number | undefined, innerWidth: number): string {
  if (maxWidth === undefined) {
    // A row without a fixed width spans the full width of its container
    // (100%), which may be narrower than the email when nested inside a column.
    return 'mj-row-per-100';
  }
  const percentage = (maxWidth / innerWidth) * 100;
  const roundedPercentage = Math.round(percentage);
  return `mj-row-per-${roundedPercentage}`;
}
