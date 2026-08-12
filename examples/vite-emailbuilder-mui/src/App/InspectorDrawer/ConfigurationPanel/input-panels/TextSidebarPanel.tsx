import React, { useState } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { ZodError } from 'zod';

import { Box, Divider, FormControl, MenuItem, Popover, Select, Typography } from '@mui/material';
import { LexicalEditorState, normalizeTextProps, TextProps, TextPropsSchema } from '@usewaypoint/block-text';
import { LexicalEditor } from '@usewaypoint/block-text/LexicalEditor';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type TextSidebarPanelProps = {
  data: TextProps;
  setData: (v: TextProps) => void;
};
export default function TextSidebarPanel({ data, setData }: TextSidebarPanelProps) {
  const [, setErrors] = useState<ZodError | null>(null);
  const [inlineTextColor, setInlineTextColor] = useState<string | null>(null);
  const [inlineBgColor, setInlineBgColor] = useState<string | null>(null);
  const [inlineFontSize, setInlineFontSize] = useState<string | null>(null);
  const colorApplyRef = React.useRef<{
    applyTextColor: (c: string) => void;
    applyBgColor: (c: string) => void;
    applyFontSize: (size: string) => void;
    clearTextColor: () => void;
    clearBgColor: () => void;
  } | null>(null);

  const handleSelectionChange = (selection: {
    color: string | null;
    bgColor: string | null;
    fontSize: string | null;
  }) => {
    setInlineTextColor(selection.color);
    setInlineBgColor(selection.bgColor);
    setInlineFontSize(selection.fontSize);
  };

  const updateData = (d: unknown) => {
    const res = TextPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const handleLexicalChange = (lexical: LexicalEditorState) => {
    const newData = {
      ...data,
      props: {
        ...data.props,
        lexical,
      },
    };
    updateData(newData);
  };

  const normalized = normalizeTextProps(data.props);
  const initialContent = normalized?.lexical ?? null;

  return (
    <BaseSidebarPanel title="Text block">
      <LexicalEditor
        initialContent={initialContent}
        onChange={handleLexicalChange}
        placeholder="Type something..."
        showToolbar
        onColorApply={(apply) => {
          colorApplyRef.current = apply;
        }}
        onSelectionChange={handleSelectionChange}
        style={{
          minHeight: 60,
          fontSize: 14,
        }}
      />

      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle2" sx={{ display: 'block', color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
          Inline Styles
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <InlineColorControl
            label="Text color"
            color={inlineTextColor}
            onColorSelect={(c) => {
              colorApplyRef.current?.applyTextColor(c);
            }}
            onClear={() => {
              colorApplyRef.current?.clearTextColor();
            }}
            onPickerChange={(c) => {
              colorApplyRef.current?.applyTextColor(c);
            }}
          />
          <InlineColorControl
            label="Background color"
            color={inlineBgColor}
            onColorSelect={(c) => {
              colorApplyRef.current?.applyBgColor(c);
            }}
            onClear={() => {
              colorApplyRef.current?.clearBgColor();
            }}
            onPickerChange={(c) => {
              colorApplyRef.current?.applyBgColor(c);
            }}
          />
          <Box>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
              Font size
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={inlineFontSize || ''}
                onChange={(e) => {
                  const size = e.target.value || null;
                  if (size) {
                    colorApplyRef.current?.applyFontSize(size);
                  }
                }}
                sx={{
                  bgcolor: 'background.paper',
                  fontSize: 12,
                  height: 32,
                  '& .MuiSelect-select': { py: 0.5, px: 0.75 },
                }}
              >
                {[10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48, 56, 64].map((size) => (
                  <MenuItem
                    key={size}
                    value={`${size}px`}
                    sx={{ fontSize: 12 }}
                    onPointerDown={(e) => e.preventDefault()}
                  >
                    {size}px
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ display: 'block', color: 'text.secondary', mb: 1, fontWeight: 500 }}>
        Block Level Controls
      </Typography>
      <MultiStylePropertyPanel
        names={['color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}

function InlineColorControl({
  label,
  color,
  onColorSelect,
  onClear,
  onPickerChange,
}: {
  label: string;
  color: string | null;
  onColorSelect: (c: string) => void;
  onClear: () => void;
  onPickerChange?: (c: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState(color);

  React.useEffect(() => {
    setValue(color);
  }, [color]);

  const presetColors = [
    '#000000',
    '#434343',
    '#666666',
    '#999999',
    '#b7b7b7',
    '#cccccc',
    '#d9d9d9',
    '#efefef',
    '#f3f3f3',
    '#ffffff',
    '#980000',
    '#ff0000',
    '#ff9900',
    '#ffff00',
    '#00ff00',
    '#00ffff',
    '#4a86e8',
    '#0000ff',
    '#9900ff',
    '#ff00ff',
    '#f4cccc',
    '#fce5cd',
    '#fff2cc',
    '#d9ead3',
    '#d0e0e3',
    '#c9daf8',
    '#cfe2f3',
    '#d9d2e9',
    '#ead1dc',
    '#e7e6e6',
    '#e74c3c',
    '#e67e22',
    '#f1c40f',
    '#2ecc71',
    '#1abc9c',
    '#3498db',
    '#9b59b6',
    '#34495e',
    '#16a085',
    '#27ae60',
    '#c0392b',
    '#d35400',
    '#f39c12',
    '#2980b9',
    '#8e44ad',
    '#2c3e50',
    '#bdc3c7',
    '#7f8c8d',
  ];

  const open = Boolean(anchorEl);

  return (
    <>
      <Box>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
          {label}
        </Typography>
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          onPointerDown={(e) => e.preventDefault()}
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            border: '1px solid',
            borderColor: open ? 'primary.main' : 'grey.300',
            bgcolor: value || 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': { borderColor: 'primary.main' },
          }}
        >
          {!value && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              +
            </Typography>
          )}
        </Box>
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { p: 1.5, mt: 0.5, minWidth: 220 },
        }}
      >
        <Box sx={{ mb: 1 }}>
          <HexColorPicker
            color={value || '#000000'}
            onChange={(c) => {
              setValue(c);
              onPickerChange?.(c);
            }}
            style={{ width: '100%', height: 80 }}
          />
        </Box>
        <Box
          sx={{
            width: '100%',
            fontSize: 12,
            py: 0.5,
            px: 1,
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 0.5,
            mb: 1,
            '&:focus-within': { outline: 'none', borderColor: 'primary.main' },
          }}
        >
          <HexColorInput
            color={value || '#000000'}
            onChange={(c) => {
              const hex = c.replace('#', '');
              if (/^[0-9a-fA-F]{6}$/.test(hex)) {
                const fullColor = `#${hex}`;
                setValue(fullColor);
                onPickerChange?.(fullColor);
              }
            }}
            onFocus={(e) => e.currentTarget.select()}
          />
        </Box>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
          Quick Select
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 0.5, mb: 0.5 }}>
          {presetColors.map((c) => (
            <Box
              key={c}
              onClick={() => {
                onColorSelect(c);
                setValue(c);
                setAnchorEl(null);
              }}
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                bgcolor: c,
                border: value === c ? '2px solid #000' : '1px solid #ddd',
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
        <Box
          onClick={() => {
            setValue(null);
            setAnchorEl(null);
            onClear();
          }}
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 0.5,
            bgcolor: 'grey.100',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'grey.200' },
            display: 'inline-block',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Clear
          </Typography>
        </Box>
      </Popover>
    </>
  );
}
