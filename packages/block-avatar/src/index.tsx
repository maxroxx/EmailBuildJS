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

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : undefined;

export const AvatarPropsSchema = z.object({
  style: z
    .object({
      textAlign: z.enum(['left', 'center', 'right']).optional().nullable(),
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      size: z.number().gt(0).optional().nullable(),
      shape: z.enum(['circle', 'square', 'rounded']).optional().nullable(),
      imageUrl: z.string().optional().nullable(),
      alt: z.string().optional().nullable(),
      text: z.string().optional().nullable(),
      borderColor: COLOR_SCHEMA,
      backgroundColor: COLOR_SCHEMA,
    })
    .optional()
    .nullable(),
});

export type AvatarProps = z.infer<typeof AvatarPropsSchema>;

function getBorderRadius(shape: 'circle' | 'square' | 'rounded', size: number): number | undefined {
  switch (shape) {
    case 'rounded':
      return size * 0.125;
    case 'circle':
      return size;
    case 'square':
    default:
      return undefined;
  }
}

function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luma = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return luma > 0.5 ? '000000' : 'ffffff';
}

export function buildAvatarUrl(text: string | null | undefined, backgroundColor: string | null | undefined): string {
  let url = 'https://ui-avatars.com/api/?size=128';
  if (text) url += `&name=${encodeURIComponent(text)}`;
  if (backgroundColor) {
    url += `&background=${backgroundColor.slice(1)}`;
    url += `&color=${getTextColor(backgroundColor)}`;
  }
  return url;
}

export const AvatarPropsDefaults = {
  size: 64,
  imageUrl: '',
  alt: '',
  text: '',
  shape: 'square',
} as const;

export function Avatar({ style, props }: AvatarProps) {
  const size = props?.size ?? AvatarPropsDefaults.size;
  const imageUrl = props?.imageUrl ?? AvatarPropsDefaults.imageUrl;
  const alt = props?.alt ?? AvatarPropsDefaults.alt;
  const shape = props?.shape ?? AvatarPropsDefaults.shape;
  const borderColor = props?.borderColor ?? undefined;

  const sectionStyle: CSSProperties = {
    textAlign: style?.textAlign ?? undefined,
    padding: getPadding(style?.padding),
  };

  return (
    <div style={sectionStyle}>
      <img
        alt={alt}
        src={imageUrl || 'https://ui-avatars.com/api/?size=128'}
        height={size}
        width={size}
        style={{
          outline: 'none',
          border: borderColor ? `2px solid ${borderColor}` : 'none',
          textDecoration: 'none',
          objectFit: 'cover',
          height: size,
          width: size,
          maxWidth: '100%',
          display: 'inline-block',
          verticalAlign: 'middle',
          textAlign: 'center',
          borderRadius: getBorderRadius(shape, size),
        }}
      />
    </div>
  );
}
