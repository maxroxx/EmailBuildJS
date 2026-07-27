import React, { CSSProperties } from 'react';
import { z } from 'zod';

import EmailMarkdown from './EmailMarkdown';

// =============================================================================
// Lexical Types
// =============================================================================

export interface LexicalTextFormat {
  detail: number;
  format: number;
  mode: string;
  style: string;
  text: string;
  type: 'text';
  version: number;
}

export interface LexicalNode {
  type: string;
  format: number | string;
  indent: number;
  direction: 'ltr' | 'rtl' | null;
  children: LexicalNode[];
  version: number;
}

export interface LexicalTextNode extends LexicalNode {
  type: 'text';
  detail: number;
  format: number | string;
  mode: string;
  style: string;
  text: string;
  version: number;
}

export interface LexicalLinkNode extends LexicalNode {
  type: 'link';
  url: string;
  title?: string;
}

export interface LexicalEditorState {
  root: LexicalNode;
}

// Format flags
const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_UNDERLINE = 8;
const FORMAT_STRIKETHROUGH = 4;

// =============================================================================
// Utility: Convert legacy text → Lexical JSON
// =============================================================================

function textToLexicalNode(text: string): LexicalTextNode {
  return {
    type: 'text',
    format: '',
    indent: 0,
    direction: 'ltr',
    children: [],
    version: 1,
    detail: 0,
    mode: 'normal',
    style: '',
    text,
  };
}

function textToLexicalJSON(text: string): LexicalEditorState {
  return {
    root: {
      type: 'paragraph',
      format: '',
      indent: 0,
      direction: 'ltr',
      children: [textToLexicalNode(text)],
      version: 1,
    },
  };
}

export function normalizeTextProps(
  props: { text?: string | null; markdown?: boolean | null; lexical?: unknown } | null | undefined
): { text?: string | null; markdown?: boolean | null; lexical?: LexicalEditorState | null } {
  if (!props) {
    return { text: '', lexical: textToLexicalJSON('') };
  }

  // If already has lexical data, return as-is
  if (props.lexical) {
    return {
      text: props.text,
      markdown: props.markdown,
      lexical: props.lexical as LexicalEditorState,
    };
  }

  // Legacy: convert text → lexical
  const text = props.text ?? '';
  return {
    text,
    markdown: props.markdown,
    lexical: textToLexicalJSON(text),
  };
}

// =============================================================================
// Utility: Convert Lexical JSON → inline HTML (email-safe)
// =============================================================================

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseLexicalFormat(formatValue: number | string | undefined): string {
  const styles: string[] = [];
  if (typeof formatValue === 'number') {
    if (formatValue & FORMAT_BOLD) styles.push('font-weight:bold');
    if (formatValue & FORMAT_ITALIC) styles.push('font-style:italic');
    if (formatValue & FORMAT_UNDERLINE) styles.push('text-decoration:underline');
    if (formatValue & FORMAT_STRIKETHROUGH) styles.push('text-decoration:line-through');
  } else if (typeof formatValue === 'string') {
    const formats = formatValue.split(' ');
    if (formats.includes('bold') || formats.includes('Bold')) styles.push('font-weight:bold');
    if (formats.includes('italic') || formats.includes('Italic')) styles.push('font-style:italic');
    if (formats.includes('underline') || formats.includes('Underline')) styles.push('text-decoration:underline');
    if (formats.includes('strikethrough') || formats.includes('Strikethrough')) styles.push('text-decoration:line-through');
  }
  return styles.join(';');
}

function renderLexicalNode(node: LexicalNode, parentStyles?: string): string {
  if (!node) {
    return '';
  }

  const nodeStyles = parseLexicalFormat(node.format);
  const combinedStyles = parentStyles
    ? `${parentStyles};${nodeStyles}`
    : nodeStyles;

  const children = (node as any).children || [];

  switch (node.type) {
    case 'text': {
      const textNode = node as LexicalTextNode;
      const escapedText = escapeHTML(textNode.text || '');
      if (combinedStyles) {
        return `<span style="${combinedStyles}">${escapedText}</span>`;
      }
      return escapedText;
    }

    case 'paragraph': {
      const inner = children.map((child: LexicalNode) => renderLexicalNode(child, combinedStyles)).join('');
      return `<p>${inner}</p>`;
    }

    case 'heading': {
      const tag = (node as any).tag || 'h1';
      const inner = children.map((child: LexicalNode) => renderLexicalNode(child, combinedStyles)).join('');
      const fontSize = tag === 'h1' ? '32px' : '24px';
      return `<${tag} style="margin:0;font-size:${fontSize};font-weight:bold;">${inner}</${tag}>`;
    }

    case 'quote': {
      const inner = children.map((child: LexicalNode) => renderLexicalNode(child, combinedStyles)).join('');
      return `<blockquote style="margin:0;padding-left:16px;border-left:3px solid #ccc;">${inner}</blockquote>`;
    }

    case 'link': {
      const linkNode = node as LexicalLinkNode;
      const inner = children.map((child: LexicalNode) => renderLexicalNode(child, combinedStyles)).join('');
      const url = linkNode.url || '#';
      const title = linkNode.title ? ` title="${escapeHTML(linkNode.title)}"` : '';
      return `<a href="${url}"${title} target="_blank">${inner}</a>`;
    }

    case 'linebreak': {
      return '<br/>';
    }

    default: {
      const inner = children.map((child: LexicalNode) => renderLexicalNode(child, combinedStyles)).join('');
      return inner;
    }
  }
}

export function lexicalToHTML(lexical: LexicalEditorState): string {
  if (!lexical || !lexical.root) return '';
  return renderLexicalNode(lexical.root as LexicalNode);
}

// =============================================================================
// Zod Schema
// =============================================================================

const FONT_FAMILY_SCHEMA = z
  .enum([
    'MODERN_SANS',
    'BOOK_SANS',
    'ORGANIC_SANS',
    'GEOMETRIC_SANS',
    'HEAVY_SANS',
    'ROUNDED_SANS',
    'MODERN_SERIF',
    'BOOK_SERIF',
    'MONOSPACE',
  ])
  .nullable()
  .optional();

function getFontFamily(fontFamily: z.infer<typeof FONT_FAMILY_SCHEMA>) {
  switch (fontFamily) {
    case 'MODERN_SANS':
      return '"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif';
    case 'BOOK_SANS':
      return 'Optima, Candara, "Noto Sans", source-sans-pro, sans-serif';
    case 'ORGANIC_SANS':
      return 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif';
    case 'GEOMETRIC_SANS':
      return 'Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif';
    case 'HEAVY_SANS':
      return 'Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif';
    case 'ROUNDED_SANS':
      return 'ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, Comfortaa, Manjari, "Arial Rounded MT Bold", Calibri, source-sans-pro, sans-serif';
    case 'MODERN_SERIF':
      return 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif';
    case 'BOOK_SERIF':
      return '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif';
    case 'MONOSPACE':
      return '"Nimbus Mono PS", "Courier New", "Cutive Mono", monospace';
  }
  return undefined;
}

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

const LEXICAL_SCHEMA = z.any().optional().nullable();

const PROPS_SCHEMA = z
  .object({
    markdown: z.boolean().optional().nullable(),
    text: z.string().optional().nullable(),
    lexical: LEXICAL_SCHEMA,
  })
  .optional()
  .nullable();

export const TextPropsSchema = z.object({
  style: z
    .object({
      color: COLOR_SCHEMA,
      backgroundColor: COLOR_SCHEMA,
      fontSize: z.number().gte(0).optional().nullable(),
      fontFamily: FONT_FAMILY_SCHEMA,
      fontWeight: z.enum(['bold', 'normal']).optional().nullable(),
      textAlign: z.enum(['left', 'center', 'right']).optional().nullable(),
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: PROPS_SCHEMA,
});

export type TextProps = z.infer<typeof TextPropsSchema>;

export const TextPropsDefaults = {
  text: '',
};

// =============================================================================
// Text Component
// =============================================================================

export function Text({ style, props }: TextProps) {
  const wStyle: CSSProperties = {
    color: style?.color ?? undefined,
    backgroundColor: style?.backgroundColor ?? undefined,
    fontSize: style?.fontSize ?? undefined,
    fontFamily: getFontFamily(style?.fontFamily),
    fontWeight: style?.fontWeight ?? undefined,
    textAlign: style?.textAlign ?? undefined,
    padding: getPadding(style?.padding),
  };

  // New Lexical format
  if (props?.lexical) {
    const html = lexicalToHTML(props.lexical as LexicalEditorState);
    return <div style={wStyle} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Legacy markdown
  const text = props?.text ?? TextPropsDefaults.text;
  if (props?.markdown) {
    return <EmailMarkdown style={wStyle} markdown={text} />;
  }

  // Legacy plain text
  return <div style={wStyle}>{text}</div>;
}

export { LexicalEditor, createEmptyLexicalState } from './LexicalEditor';
export { EditorToolbar } from './EditorToolbar';
