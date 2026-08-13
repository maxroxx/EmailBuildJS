import React from 'react';

import { InputLabel, Stack, ToggleButtonGroup } from '@mui/material';

type Props = {
  label: string | JSX.Element;
  children: JSX.Element | JSX.Element[];
  value: string;
  onChange: (v: string) => void;
};
export default function RadioGroupInput({ label, children, value, onChange }: Props) {
  return (
    <Stack alignItems="flex-start">
      <InputLabel shrink>{label}</InputLabel>
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={value}
        size="small"
        onChange={(_, v: unknown) => {
          if (typeof v !== 'string') {
            throw new Error('RadioGroupInput can only receive string values');
          }
          onChange(v);
        }}
      >
        {children}
      </ToggleButtonGroup>
    </Stack>
  );
}
