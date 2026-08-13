import React, { useState } from 'react';
import { ZodError } from 'zod';

import {
  VerticalAlignBottomOutlined,
  VerticalAlignCenterOutlined,
  VerticalAlignTopOutlined,
} from '@mui/icons-material';
import { ToggleButton } from '@mui/material';

import RowsContainerPropsSchema, {
  RowsContainerProps,
} from '../../../../documents/blocks/RowsContainer/RowsContainerPropsSchema';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import RadioGroupInput from './helpers/inputs/RadioGroupInput';
import RowWidthsInput from './helpers/inputs/RowWidthsInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type RowsContainerPanelProps = {
  data: RowsContainerProps;
  setData: (v: RowsContainerProps) => void;
};
export default function RowsContainerPanel({ data, setData }: RowsContainerPanelProps) {
  const [, setErrors] = useState<ZodError | null>(null);

  const rowsCount = data.props?.rowsCount ?? 3;

  const updateData = (partial: Partial<RowsContainerProps>) => {
    const newData: RowsContainerProps = {
      ...data,
      ...partial,
      props: { ...data.props, ...partial.props },
    };
    const res = RowsContainerPropsSchema.safeParse(newData);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  return (
    <BaseSidebarPanel title="Rows block">
      <RadioGroupInput
        label="Number of rows"
        value={String(rowsCount)}
        onChange={(v) => {
          const count = parseInt(v, 10);
          const existingWidths = data.props?.fixedWidths ?? [];
          const newWidths = Array(count).fill(null);
          for (let i = 0; i < Math.min(existingWidths.length, count); i++) {
            newWidths[i] = existingWidths[i];
          }
          updateData({ props: { rowsCount: count, fixedWidths: newWidths } });
        }}
      >
        <ToggleButton value="2">2</ToggleButton>
        <ToggleButton value="3">3</ToggleButton>
        <ToggleButton value="4">4</ToggleButton>
        <ToggleButton value="5">5</ToggleButton>
        <ToggleButton value="6">6</ToggleButton>
      </RadioGroupInput>
      <RowWidthsInput
        value={data.props?.fixedWidths}
        rowsCount={rowsCount}
        onChange={(fixedWidths) => {
          updateData({ props: { fixedWidths } });
        }}
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
