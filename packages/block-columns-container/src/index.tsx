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

const FIXED_HEIGHTS_SCHEMA = z
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
      fixedHeights: FIXED_HEIGHTS_SCHEMA,
      columnsCount: z
        .union([z.literal(2), z.literal(3)])
        .optional()
        .nullable(),
      contentAlignment: z.enum(['top', 'middle', 'bottom']).optional().nullable(),
      columnsGap: z.number().optional().nullable(),
      marginBeforeFirst: z.number().optional().nullable(),
      marginBeforeLast: z.number().optional().nullable(),
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
  };

  const blockProps = {
    columnsCount: props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount,
    contentAlignment: props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment,
    fixedWidths: props?.fixedWidths,
    fixedHeights: props?.fixedHeights,
    innerWidth: DEFAULT_CONTAINER_WIDTH,
    columnsGap: props?.columnsGap ?? 0,
    marginBeforeFirst: props?.marginBeforeFirst ?? 0,
    marginBeforeLast: props?.marginBeforeLast ?? 0,
  };

  const columnsCount = blockProps.columnsCount;
  const columnsGap = blockProps.columnsGap;
  const marginBeforeFirst = blockProps.marginBeforeFirst;
  const marginBeforeLast = blockProps.marginBeforeLast;

  return (
    <div style={wStyle}>
      <div
        className="mj-column-wrapper"
        style={{
          fontSize: '0',
          textAlign: 'left',
          display: mobile ? 'block' : undefined,
          paddingLeft: 1,
          paddingRight: 1,
          boxSizing: 'border-box',
        }}
      >
        {[0, 1, 2].map((index) => {
          if (index >= columnsCount) {
            return null;
          }
          const leadingGap = index === 0 ? marginBeforeFirst : columnsGap;
          const trailingGap = index === columnsCount - 1 ? marginBeforeLast : 0;
          return (
            <React.Fragment key={index}>
              {!mobile && leadingGap > 0 && <GapSpacer width={leadingGap} />}
              <ColumnWrapper index={index} props={blockProps} columns={columns} mobile={mobile} />
              {!mobile && trailingGap > 0 && <GapSpacer width={trailingGap} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Gap spacers carry the column margins (before-first / between / after-last)
// instead of the column boxes themselves. They are zero-height inline-blocks,
// so on desktop they create the horizontal gap in the inline flow, while in
// the stacked mobile view they collapse to invisible zero-height line breaks
// and can never indent (stair-step) the stacked columns - even in clients
// that ignore <style> media queries but keep inline styles (Gmail inbox).
function GapSpacer({ width }: { width: number }) {
  return (
    <span
      data-col-gap={width}
      style={{ display: 'inline-block', width, maxWidth: '100%', height: 0, fontSize: 0, lineHeight: 0 }}
    />
  );
}

type ColumnWrapperProps = {
  props: {
    fixedWidths: z.infer<typeof FIXED_WIDTHS_SCHEMA>;
    fixedHeights: z.infer<typeof FIXED_HEIGHTS_SCHEMA>;
    columnsCount: 2 | 3;
    contentAlignment: 'top' | 'middle' | 'bottom';
    innerWidth: number;
    columnsGap: number;
    marginBeforeFirst: number;
    marginBeforeLast: number;
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
  const widthValue = maxWidth ?? props.innerWidth / columnsCount;

  const children = columns?.[index];
  const renderedChildren = Array.isArray(children) ? <>{children}</> : children;

  const columnClass = getColumnClass(columnsCount, maxWidth, props.innerWidth);

  const columnsGap = props?.columnsGap ?? 0;
  const marginBeforeFirst = props?.marginBeforeFirst ?? 0;
  const marginBeforeLast = props?.marginBeforeLast ?? 0;
  const columnHeight = props?.fixedHeights?.[index];

  // The in-between gap must not come out of any single column's content:
  // instead every column gives up an equal share of the total spacing, so all
  // column boxes stay exactly the same width. The spacing itself is applied as
  // external margins (outside the box), so the box AND its content keep equal
  // dimensions across columns - unlike padding, which would carve the gap out
  // of the content of whichever column happened to host it.
  const totalGap = marginBeforeFirst + (columnsCount - 1) * columnsGap + marginBeforeLast;
  const gapAwareWidth = widthValue - totalGap / columnsCount;

  // Fab Four (no media query needed): below 480px the calc() grows past
  // max-width:100% (full-width stacked), above 480px it drops below the
  // min-width (desktop percentages). Matches renderToStaticMarkup output so
  // editor/Reader previews behave exactly like the sent email. The exact px
  // width is carried in data-col-width for the renderer to reconstruct.
  // Desktop min-width targets (share - 1px) for 3 columns and (share - 1.5px)
  // for 2 columns, expressed against the wrapper's content width (email width
  // minus its 2px margins). This keeps the visible total under the email
  // width (599px) so equal columns NEVER sum to exactly 600 - avoiding the
  // sub-pixel exact-fit wrap - while leaving only a ~1px-per-column gap.
  // The leftover 2px margins put a 1px breathing gap at each side of the
  // block for a balanced look when columns have background colours.
  const desktopCoreWidth = props.innerWidth - 2;
  const desktopTarget = gapAwareWidth - (columnsCount === 2 ? 1.5 : 1);
  const desktopPercentage = Math.round((desktopTarget / desktopCoreWidth) * 100 * 1e12) / 1e12;

  const columnStyle: CSSProperties = mobile
    ? {
        display: 'block',
        width: '100%',
        maxWidth: '100%',
        verticalAlign: 'top',
        minHeight: columnHeight ?? 40,
        margin: 0,
        boxSizing: 'border-box',
      }
    : {
        display: 'inline-block',
        verticalAlign: contentAlignment,
        width: 'calc(230400px - 48000%)',
        maxWidth: '100%',
        minWidth: `${desktopPercentage}%`,
        minHeight: columnHeight ?? 40,
        margin: 0,
        boxSizing: 'border-box',
      };

  // The horizontal spacing is NOT applied as margins on the column box:
  // every column has already given up an equal share of the total spacing
  // via gapAwareWidth, and the freed space is placed by GapSpacer elements
  // rendered between (and around) the columns by ColumnsContainer. Keeping
  // the boxes margin-free means the stacked mobile view can never be
  // indented by the gap, in any client.

  return (
    <div
      className={columnClass}
      style={columnStyle}
      data-col-width={gapAwareWidth}
      data-col-height={columnHeight}
      data-col-count={columnsCount}
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
                height: columnHeight ? `${columnHeight}px` : undefined,
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
  const roundedPercentage = Math.round(percentage);
  return `mj-column-per-${roundedPercentage}`;
}
