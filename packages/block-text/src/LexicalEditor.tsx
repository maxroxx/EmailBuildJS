import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, LineBreakNode } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';

import { LexicalEditorState, LexicalNode, LexicalTextNode } from '.';
import { EditorToolbar } from './EditorToolbar';

// =============================================================================
// Lexical Initial State Converter
// =============================================================================

function createInitialEditorState(lexical: LexicalEditorState | null) {
  if (!lexical) {
    return JSON.stringify({
      root: {
        children: [
          {
            children: [],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    });
  }

  return JSON.stringify({
    root: {
      children: (lexical.root.children || []).map((child: LexicalNode) => ({
        type: child.type || 'paragraph',
        format: child.format?.toString?.() || '',
        indent: child.indent || 0,
        direction: child.direction || 'ltr',
        children: (child.children || []).map((grandchild: LexicalNode) => ({
          type: grandchild.type || 'text',
          format: grandchild.format?.toString?.() || '0',
          mode: (grandchild as LexicalTextNode).mode || 'normal',
          style: (grandchild as LexicalTextNode).style || '',
          text: (grandchild as LexicalTextNode).text || '',
          version: grandchild.version || 1,
        })),
        version: child.version || 1,
      })),
      direction: lexical.root.direction || 'ltr',
      format: lexical.root.format?.toString?.() || '',
      indent: lexical.root.indent || 0,
      type: 'root',
      version: lexical.root.version || 1,
    },
  });
}

// =============================================================================
// Internal: Sync external content changes into the editor
// =============================================================================

function useLexicalEditorContent(
  initialContent: LexicalEditorState | null,
  isInternalRef: React.MutableRefObject<boolean>,
) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (isInternalRef.current) {
      isInternalRef.current = false;
      return;
    }
    if (!initialContent) return;

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
  onChange: (lexical: LexicalEditorState) => void,
) {
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      const serialized = editor.toJSON();
      if (!serialized.editorState?.root) return;
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
    [editable],
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
  editable,
  style,
  isInternalRef,
}: LexicalEditorProps & { isInternalRef: React.MutableRefObject<boolean> }) {
  const [editor] = useLexicalComposerContext();
  const prevContentRef = useRef<LexicalEditorState | null>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

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
    [onChange, isInternalRef],
  );

  useLexicalOnChange(editor, handleChange);

  // Track if editor content is empty to show/hide placeholder
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();
        if (placeholderRef.current) {
          placeholderRef.current.style.display = text.trim() === '' ? 'block' : 'none';
        }
      });
    });
  }, [editor]);

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
      />
      <div
        ref={placeholderRef}
        style={{
          color: '#999',
          pointerEvents: 'none',
          padding: '8px 12px',
          position: 'absolute',
          top: 1,
          left: 1,
          right: 1,
          fontSize: 14,
          lineHeight: 1.5,
          userSelect: 'none',
        }}
      >
        {placeholder}
      </div>
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
