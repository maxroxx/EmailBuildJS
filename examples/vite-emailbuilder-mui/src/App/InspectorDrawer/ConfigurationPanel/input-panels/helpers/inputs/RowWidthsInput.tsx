import React from 'react';

import { Stack } from '@mui/material';

import TextDimensionInput from './TextDimensionInput';

type FixedWidths = Array<number | null | undefined>;
type RowsLayoutInputProps = {
  value: FixedWidths | null | undefined;
  onChange: (v: FixedWidths | null | undefined) => void;
  rowsCount: number;
};
export default function RowWidthsInput({ value, onChange, rowsCount }: RowsLayoutInputProps) {
  const setIndexValue = (index: number, newValue: number | null | undefined) => {
    const currentValue = value || [];
    const nValue = [...currentValue];
    while (nValue.length <= index) {
      nValue.push(null);
    }
    nValue[index] = newValue;
    onChange(nValue);
  };

  const inputsPerRow = 3;
  const totalRows = Math.ceil(rowsCount / inputsPerRow);

  const inputGroups = [];
  for (let row = 0; row < totalRows; row++) {
    const rowInputs = [];
    for (let col = 0; col < inputsPerRow; col++) {
      const index = row * inputsPerRow + col;
      if (index < rowsCount) {
        rowInputs.push(
          <TextDimensionInput
            key={index}
            label={`Row ${index + 1}`}
            value={value?.[index]}
            onChange={(v) => {
              setIndexValue(index, v);
            }}
          />
        );
      }
    }
    inputGroups.push(
      <Stack key={row} direction="row" spacing={1} sx={{ mb: 1 }}>
        {rowInputs}
      </Stack>
    );
  }

  return <Stack>{inputGroups}</Stack>;
}
