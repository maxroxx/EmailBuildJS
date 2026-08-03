import { LineBreakNode } from 'lexical';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

import { LexicalEditorState, LexicalNode } from '.';
import { EditorToolbar } from './EditorToolbar';

// =============================================================================
// Simple ErrorBoundary for Lexical plugins
// =============================================================================

function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// =============================================================================
// Internal: Sync external content changes into the editor
// =============================================================================

function useLexicalEditorContent(
  initialContent: LexicalEditorState | null,
  isInternalRef: React.MutableRefObject<boolean>
) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (isInternalRef.current) {
      isInternalRef.current = false;
      return;
    }
    if (!initialContent) {
      return;
    }

    const json = JSON.stringify(initialContent);
    const editorState = editor.parseEditorState(json);
    editor.setEditorState(editorState);
  }, [editor, initialContent, isInternalRef]);
}

// =============================================================================
// Internal: Extract Lexical JSON on every change
// =============================================================================

function useLexicalOnChange(
  editor: ReturnType<typeof useLexicalComposerContext>[0],
  onChange: (lexical: LexicalEditorState) => void
) {
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      const serialized = editor.toJSON();
      if (!serialized.editorState?.root) {
        return;
      }
      const lexical: LexicalEditorState = {
        root: serialized.editorState.root as unknown as LexicalNode,
      };
      onChange(lexical);
    });
  }, [editor, onChange]);
}

// =============================================================================
// Main Component
// =============================================================================

type LexicalEditorProps = {
  initialContent: LexicalEditorState | null;
  onChange: (lexical: LexicalEditorState) => void;
  placeholder?: string;
  editable?: boolean;
  style?: React.CSSProperties;
  showToolbar?: boolean;
};

export function LexicalEditor({
  initialContent,
  onChange,
  placeholder = 'Type something...',
  editable = true,
  style,
  showToolbar = false,
}: LexicalEditorProps) {
  const isInternalRef = useRef(false);

  const config = useMemo(
    () => ({
      namespace: 'TextBlockEditor',
      nodes: [HeadingNode, QuoteNode, LineBreakNode, LinkNode],
      onError: (error: Error) => {
        console.error('[LexicalEditor] Unhandled error:', error);
      },
      editable,
      // No editorState — let Lexical create the default empty state.
      // Content is set after mount via useLexicalEditorContent.
    }),
    [editable]
  );

  return (
    <LexicalComposer initialConfig={config}>
      {showToolbar && <EditorToolbar />}
      <LexicalEditorInner
        initialContent={initialContent}
        onChange={onChange}
        placeholder={placeholder}
        editable={editable}
        style={style}
        isInternalRef={isInternalRef}
      />
    </LexicalComposer>
  );
}

// =============================================================================
// Inner: Handles content sync, change detection, and rendering
// =============================================================================

function LexicalEditorInner({
  initialContent,
  onChange,
  placeholder,
  style,
  isInternalRef,
}: LexicalEditorProps & { isInternalRef: React.MutableRefObject<boolean> }) {
  const [editor] = useLexicalComposerContext();
  const prevContentRef = useRef<LexicalEditorState | null>(null);

  useLexicalEditorContent(initialContent, isInternalRef);

  const handleChange = useCallback(
    (lexical: LexicalEditorState) => {
      const currentJson = JSON.stringify(lexical);
      const prevJson = prevContentRef.current ? JSON.stringify(prevContentRef.current) : '';
      if (currentJson !== prevJson) {
        prevContentRef.current = lexical;
        isInternalRef.current = true;
        onChange(lexical);
      }
    },
    [onChange, isInternalRef]
  );

  useLexicalOnChange(editor, handleChange);

  const contentEditableStyle: React.CSSProperties = {
    minHeight: 120,
    padding: '8px 12px',
    outline: 'none',
    fontSize: 14,
    lineHeight: 1.5,
    border: '1px solid #c4c4c4',
    borderRadius: 4,
    backgroundColor: '#fff',
    ...style,
  };

  return (
    <div style={{ position: 'relative' }}>
      <RichTextPlugin
        contentEditable={<ContentEditable style={contentEditableStyle} />}
        placeholder={<div style={{ color: '#999', padding: '8px 12px' }}>{placeholder}</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />

      <LinkPlugin />
      <HistoryPlugin />
    </div>
  );
}

// =============================================================================
// Legacy Text → Lexical JSON helper (for editor initialization)
// =============================================================================

export function createEmptyLexicalState(): LexicalEditorState {
  return {
    root: {
      children: [
        {
          children: [],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
          type: 'paragraph' as const,
          version: 1,
        } as unknown as LexicalNode,
      ],
      direction: 'ltr' as const,
      format: '',
      indent: 0,
      type: 'root' as const,
      version: 1,
    },
  };
}
