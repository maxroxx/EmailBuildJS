import React, { useState } from 'react';
import { ZodError } from 'zod';

import {
  AlignHorizontalLeftOutlined,
  AlignHorizontalRightOutlined,
  SwapHorizOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignCenterOutlined,
  VerticalAlignTopOutlined,
} from '@mui/icons-material';
import { ToggleButton } from '@mui/material';

import ColumnsContainerPropsSchema, {
  ColumnsContainerProps,
} from '../../../../documents/blocks/ColumnsContainer/ColumnsContainerPropsSchema';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import ColumnWidthsInput from './helpers/inputs/ColumnWidthsInput';
import RadioGroupInput from './helpers/inputs/RadioGroupInput';
import SliderInput from './helpers/inputs/SliderInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type ColumnsContainerPanelProps = {
  data: ColumnsContainerProps;
  setData: (v: ColumnsContainerProps) => void;
};
export default function ColumnsContainerPanel({ data, setData }: ColumnsContainerPanelProps) {
  const [, setErrors] = useState<ZodError | null>(null);

  const columnsCount = data.props?.columnsCount ?? 2;

  const updateData = (partial: Partial<ColumnsContainerProps>) => {
    const newData: ColumnsContainerProps = {
      ...data,
      ...partial,
      props: { ...data.props, ...partial.props },
    };
    const res = ColumnsContainerPropsSchema.safeParse(newData);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  return (
    <BaseSidebarPanel title="Columns block">
      <RadioGroupInput
        label="Number of columns"
        value={String(columnsCount)}
        onChange={(v) => {
          const count = v === '2' ? 2 : 3;
          updateData({ props: { columnsCount: count, fixedWidths: [null, null, null] } });
        }}
      >
        <ToggleButton value="2">2</ToggleButton>
        <ToggleButton value="3">3</ToggleButton>
      </RadioGroupInput>
      <ColumnWidthsInput
        defaultValue={data.props?.fixedWidths}
        onChange={(fixedWidths) => {
          updateData({ props: { fixedWidths } });
        }}
      />
      <SliderInput
        label="Margin before first"
        iconLabel={<AlignHorizontalLeftOutlined sx={{ fontSize: 16 }} />}
        defaultValue={data.props?.marginBeforeFirst ?? 0}
        onChange={(marginBeforeFirst) => updateData({ props: { marginBeforeFirst } })}
        units="px"
        step={4}
        min={0}
        max={80}
        marks
      />
      <SliderInput
        label="Margin between columns"
        iconLabel={<SwapHorizOutlined sx={{ fontSize: 16 }} />}
        defaultValue={data.props?.columnsGap ?? 0}
        onChange={(columnsGap) => updateData({ props: { columnsGap } })}
        units="px"
        step={4}
        min={0}
        max={80}
        marks
      />
      <SliderInput
        label="Margin before last"
        iconLabel={<AlignHorizontalRightOutlined sx={{ fontSize: 16 }} />}
        defaultValue={data.props?.marginBeforeLast ?? 0}
        onChange={(marginBeforeLast) => updateData({ props: { marginBeforeLast } })}
        units="px"
        step={4}
        min={0}
        max={80}
        marks
      />
      <RadioGroupInput
        label="Alignment"
        value={data.props?.contentAlignment ?? 'middle'}
        onChange={(contentAlignment) => {
          updateData({ props: { contentAlignment } });
        }}
      >
        <ToggleButton value="top">
          <VerticalAlignTopOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="middle">
          <VerticalAlignCenterOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="bottom">
          <VerticalAlignBottomOutlined fontSize="small" />
        </ToggleButton>
      </RadioGroupInput>

      <MultiStylePropertyPanel
        names={['backgroundColor']}
        value={data.style}
        onChange={(style) => updateData({ style })}
      />
    </BaseSidebarPanel>
  );
}
