import React, { useState } from 'react';
import { ZodError } from 'zod';

import { LexicalEditorState, normalizeTextProps,TextProps, TextPropsSchema } from '@usewaypoint/block-text';
import { LexicalEditor } from '@usewaypoint/block-text/LexicalEditor';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type TextSidebarPanelProps = {
  data: TextProps;
  setData: (v: TextProps) => void;
};
export default function TextSidebarPanel({ data, setData }: TextSidebarPanelProps) {
  const [, setErrors] = useState<ZodError | null>(null);

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
  const initialContent = normalized?.lexical;

  return (
    <BaseSidebarPanel title="Text block">
      <LexicalEditor
        initialContent={initialContent}
        onChange={handleLexicalChange}
        placeholder="Type something..."
        showToolbar
        style={{
          minHeight: 60,
          fontSize: 14,
        }}
      />

      <MultiStylePropertyPanel
        names={['color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
