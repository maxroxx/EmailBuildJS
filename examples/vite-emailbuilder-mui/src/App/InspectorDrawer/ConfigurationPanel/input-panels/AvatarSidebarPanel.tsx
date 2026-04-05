import React, { useState } from 'react';
import { ZodError } from 'zod';

import { AspectRatioOutlined } from '@mui/icons-material';
import { ToggleButton } from '@mui/material';
import { AvatarProps, AvatarPropsDefaults, AvatarPropsSchema } from '@usewaypoint/block-avatar';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import { NullableColorInput } from './helpers/inputs/ColorInput';
import RadioGroupInput from './helpers/inputs/RadioGroupInput';
import SliderInput from './helpers/inputs/SliderInput';
import TextInput from './helpers/inputs/TextInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type AvatarSidebarPanelProps = {
  data: AvatarProps;
  setData: (v: AvatarProps) => void;
};
export default function AvatarSidebarPanel({ data, setData }: AvatarSidebarPanelProps) {
  const [, setErrors] = useState<ZodError | null>(null);
  const updateData = (d: unknown) => {
    const res = AvatarPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const size = data.props?.size ?? AvatarPropsDefaults.size;
  const imageUrl = data.props?.imageUrl ?? AvatarPropsDefaults.imageUrl;
  const alt = data.props?.alt ?? AvatarPropsDefaults.alt;
  const text = data.props?.text ?? AvatarPropsDefaults.text;
  const shape = data.props?.shape ?? AvatarPropsDefaults.shape;
  const borderColor = data.props?.borderColor ?? null;
  const backgroundColor = data.props?.backgroundColor ?? null;

  return (
    <BaseSidebarPanel title="Avatar block">
      <SliderInput
        label="Size"
        iconLabel={<AspectRatioOutlined sx={{ color: 'text.secondary' }} />}
        units="px"
        step={3}
        min={32}
        max={256}
        defaultValue={size}
        onChange={(size) => {
          updateData({ ...data, props: { ...data.props, size } });
        }}
      />
      <RadioGroupInput
        label="Shape"
        defaultValue={shape}
        onChange={(shape) => {
          updateData({ ...data, props: { ...data.props, shape } });
        }}
      >
        <ToggleButton value="circle">Circle</ToggleButton>
        <ToggleButton value="square">Square</ToggleButton>
        <ToggleButton value="rounded">Rounded</ToggleButton>
      </RadioGroupInput>
      <TextInput
        label="Image URL"
        defaultValue={imageUrl}
        onChange={(imageUrl) => {
          updateData({ ...data, props: { ...data.props, imageUrl } });
        }}
      />
      <TextInput
        label="Alt text"
        defaultValue={alt}
        onChange={(alt) => {
          updateData({ ...data, props: { ...data.props, alt } });
        }}
      />
      <TextInput
        label="Avatar text"
        defaultValue={text}
        onChange={(text) => {
          updateData({ ...data, props: { ...data.props, text } });
        }}
      />

      <NullableColorInput
        label="Border color"
        defaultValue={borderColor}
        onChange={(borderColor) => updateData({ ...data, props: { ...data.props, borderColor } })}
      />
      <NullableColorInput
        label="Background color"
        defaultValue={backgroundColor}
        onChange={(backgroundColor) => updateData({ ...data, props: { ...data.props, backgroundColor } })}
      />
      <MultiStylePropertyPanel
        names={['textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
