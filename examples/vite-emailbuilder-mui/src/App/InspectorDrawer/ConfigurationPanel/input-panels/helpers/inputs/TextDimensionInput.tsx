import React, { useEffect, useState } from 'react';

import { TextField, Typography } from '@mui/material';

type TextDimensionInputProps = {
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
};
export default function TextDimensionInput({ label, value, onChange }: TextDimensionInputProps) {
  const [internalValue, setInternalValue] = useState<string>(value != null ? String(value) : '');

  useEffect(() => {
    setInternalValue(value != null ? String(value) : '');
  }, [value]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    const parsed = parseInt(ev.target.value);
    setInternalValue(ev.target.value);
    onChange(isNaN(parsed) ? null : parsed);
  };

  return (
    <TextField
      fullWidth
      value={internalValue}
      onChange={handleChange}
      label={label}
      variant="standard"
      placeholder="auto"
      size="small"
      InputProps={{
        endAdornment: (
          <Typography variant="body2" color="text.secondary">
            px
          </Typography>
        ),
      }}
    />
  );
}
