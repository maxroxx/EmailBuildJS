import React, { useState } from 'react';

import { Stack } from '@mui/material';

import TextDimensionInput from './TextDimensionInput';

export const DEFAULT_2_COLUMNS_HEIGHT = [null] as [number | null];
export const DEFAULT_3_COLUMNS_HEIGHT = [null, null] as [number | null, number | null];

type THeightValue = number | null | undefined;
type FixedHeights = [
  //
  number | null | undefined,
  number | null | undefined,
  number | null | undefined,
];
type ColumnHeightsInputProps = {
  defaultValue: FixedHeights | null | undefined;
  onChange: (v: FixedHeights | null | undefined) => void;
};
export default function ColumnHeightsInput({ defaultValue, onChange }: ColumnHeightsInputProps) {
  const [currentValue, setCurrentValue] = useState<[THeightValue, THeightValue, THeightValue]>(() => {
    if (defaultValue) {
      return defaultValue;
    }
    return [null, null, null];
  });

  const setIndexValue = (index: 0 | 1 | 2, value: number | null | undefined) => {
    const nValue: FixedHeights = [...currentValue];
    nValue[index] = value;
    setCurrentValue(nValue);
    onChange(nValue);
  };

  const columnsCountValue = 3;
  let column3 = null;
  if (columnsCountValue === 3) {
    column3 = (
      <TextDimensionInput
        label="Column 3"
        value={currentValue?.[2]}
        onChange={(v) => {
          setIndexValue(2, v);
        }}
      />
    );
  }
  return (
    <Stack direction="row" spacing={1}>
      <TextDimensionInput
        label="Column 1"
        value={currentValue?.[0]}
        onChange={(v) => {
          setIndexValue(0, v);
        }}
      />
      <TextDimensionInput
        label="Column 2"
        value={currentValue?.[1]}
        onChange={(v) => {
          setIndexValue(1, v);
        }}
      />
      {column3}
    </Stack>
  );
}
