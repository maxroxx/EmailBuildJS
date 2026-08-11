import { $getSelection, $isRangeSelection, $isTextNode, LineBreakNode, RangeSelection, TextNode } from 'lexical';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

import { EditorToolbar } from './EditorToolbar';

// =============================================================================
// Minimal type definitions (to avoid circular dependency with index.tsx)
// =============================================================================

function patchTextNodeStyle(node: TextNode, prop: 'color' | 'background-color' | 'font-size', value: string) {
  const re = new RegExp(`${prop}:[^;]*;?`, 'g');
  const existingStyle = (node.getStyle() || '').replace(re, '').replace(/^;+|;+$/g, '');
  if (value) {
    node.setStyle(existingStyle ? `${existingStyle};${prop}:${value}` : `${prop}:${value}`);
  } else {
    node.setStyle(existingStyle || '');
  }
}

function applyStyleToSelection(
  selection: RangeSelection,
  prop: 'color' | 'background-color' | 'font-size',
  value: string
) {
  const nodes = selection.getNodes();
  const selectedTextNodes = nodes.filter((node): node is TextNode => $isTextNode(node));
  const selectedTextNodesLength = selectedTextNodes.length;
  if (selectedTextNodesLength === 0) {
    return;
  }

  const isBackward = selection.isBackward();
  const startPoint = isBackward ? selection.focus : selection.anchor;
  const endPoint = isBackward ? selection.anchor : selection.focus;

  let firstIndex = 0;
  let firstNode: TextNode | undefined = selectedTextNodes[0];
  let startOffset = startPoint.type === 'element' ? 0 : startPoint.offset;

  // In case selection started at the end of text node use next text node
  if (startPoint.type === 'text' && startOffset === firstNode.getTextContentSize()) {
    firstIndex = 1;
    firstNode = selectedTextNodes[1];
    startOffset = 0;
  }
  if (firstNode == null) {
    return;
  }

  const lastIndex = selectedTextNodesLength - 1;
  let lastNode: TextNode | undefined = selectedTextNodes[lastIndex];
  const endOffset = endPoint.type === 'text' ? endPoint.offset : lastNode.getTextContentSize();

  // Single node selected
  if (firstNode.is(lastNode)) {
    // No actual text is selected, so do nothing.
    if (startOffset === endOffset) {
      return;
    }
    // The entire node is selected, so just style it
    if (startOffset === 0 && endOffset === firstNode.getTextContentSize()) {
      patchTextNodeStyle(firstNode, prop, value);
    } else {
      // Node is partially selected, so split it into parts and style the selected one
      const splitNodes = firstNode.splitText(startOffset, endOffset);
      const replacement = startOffset === 0 ? splitNodes[0] : splitNodes[1];
      patchTextNodeStyle(replacement, prop, value);

      // Update selection only if starts/ends on text node
      if (startPoint.type === 'text') {
        startPoint.set(replacement.__key, 0, 'text');
      }
      if (endPoint.type === 'text') {
        endPoint.set(replacement.__key, endOffset - startOffset, 'text');
      }
    }
    return;
  }

  // Multiple nodes selected
  // Collect nodes to style BEFORE splitting
  const nodesToStyle: TextNode[] = [];

  // First node portion
  if (startOffset !== 0) {
    [, firstNode] = firstNode.splitText(startOffset);
    startOffset = 0;
  }
  nodesToStyle.push(firstNode);

  // Last node portion
  if (endOffset > 0) {
    if (endOffset !== lastNode!.getTextContentSize()) {
      [lastNode] = lastNode!.splitText(endOffset);
    }
    nodesToStyle.push(lastNode);
  }

  // Middle nodes
  for (let i = firstIndex + 1; i < lastIndex; i++) {
    const node = selectedTextNodes[i];
    if ($isTextNode(node)) {
      nodesToStyle.push(node);
    }
  }

  // Apply style to all collected nodes
  nodesToStyle.forEach((node) => {
    patchTextNodeStyle(node, prop, value);
  });
}

export interface LexicalNode {
  type: string;
  format: number | string;
  indent: number;
  direction: 'ltr' | 'rtl' | null;
  children: LexicalNode[];
  version: number;
}

export interface LexicalEditorState {
  root: LexicalNode;
}

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
// Color Context - manages color state and applies to editor selection
// =============================================================================

export interface LexicalColorContextValue {
  textColor: string | null;
  bgColor: string | null;
  fontSize: string | null;
  applyTextColor: (color: string) => void;
  applyBgColor: (color: string) => void;
  applyFontSize: (size: string) => void;
  clearTextColor: () => void;
  clearBgColor: () => void;
}

export const LexicalColorContext = createContext<LexicalColorContextValue>({
  textColor: null,
  bgColor: null,
  fontSize: null,
  applyTextColor: () => {},
  applyBgColor: () => {},
  applyFontSize: () => {},
  clearTextColor: () => {},
  clearBgColor: () => {},
});

export const useLexicalColor = () => useContext(LexicalColorContext);

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
  onTextColorChange?: (color: string | null) => void;
  onBgColorChange?: (color: string | null) => void;
  onFontSizeChange?: (size: string | null) => void;
  onTextColorSelect?: (color: string) => void;
  onBgColorSelect?: (color: string) => void;
  onColorApply?: (colorApply: {
    applyTextColor: (c: string) => void;
    applyBgColor: (c: string) => void;
    applyFontSize: (size: string) => void;
    clearTextColor: () => void;
    clearBgColor: () => void;
  }) => void;
  onSelectionChange?: (selection: { color: string | null; bgColor: string | null; fontSize: string | null }) => void;
};

export function LexicalEditor({
  initialContent,
  onChange,
  placeholder = 'Type something...',
  editable = true,
  style,
  showToolbar = false,
  onTextColorChange,
  onBgColorChange,
  onFontSizeChange,
  onTextColorSelect,
  onBgColorSelect,
  onColorApply,
  onSelectionChange,
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
    }),
    [editable]
  );

  return (
    <LexicalComposer initialConfig={config}>
      <LexicalColorProvider
        onTextColorChange={onTextColorChange}
        onBgColorChange={onBgColorChange}
        onFontSizeChange={onFontSizeChange}
        onTextColorSelect={onTextColorSelect}
        onBgColorSelect={onBgColorSelect}
        onColorApply={onColorApply}
        onSelectionChange={onSelectionChange}
      >
        {showToolbar && <EditorToolbar />}
        <LexicalEditorInner
          initialContent={initialContent}
          onChange={onChange}
          placeholder={placeholder}
          editable={editable}
          style={style}
          isInternalRef={isInternalRef}
        />
      </LexicalColorProvider>
    </LexicalComposer>
  );
}

// =============================================================================
// Color Provider - wraps LexicalComposer to provide color context
// =============================================================================

function LexicalColorProvider({
  children,
  onTextColorChange,
  onBgColorChange,
  onFontSizeChange,
  onTextColorSelect,
  onBgColorSelect,
  onColorApply,
  onSelectionChange,
}: {
  children: React.ReactNode;
  onTextColorChange?: (color: string | null) => void;
  onBgColorChange?: (color: string | null) => void;
  onFontSizeChange?: (size: string | null) => void;
  onTextColorSelect?: (color: string) => void;
  onBgColorSelect?: (color: string) => void;
  onColorApply?: (colorApply: {
    applyTextColor: (c: string) => void;
    applyBgColor: (c: string) => void;
    applyFontSize: (size: string) => void;
    clearTextColor: () => void;
    clearBgColor: () => void;
  }) => void;
  onSelectionChange?: (selection: { color: string | null; bgColor: string | null; fontSize: string | null }) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [textColor, setTextColor] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<string | null>(null);

  const applyTextColor = useCallback(
    (color: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          applyStyleToSelection(selection, 'color', color);
        }
      });
      setTextColor(color);
      onTextColorChange?.(color);
      onTextColorSelect?.(color);
    },
    [editor, onTextColorChange, onTextColorSelect]
  );

  const applyBgColor = useCallback(
    (color: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          applyStyleToSelection(selection, 'background-color', color);
        }
      });
      setBgColor(color);
      onBgColorChange?.(color);
      onBgColorSelect?.(color);
    },
    [editor, onBgColorChange, onBgColorSelect]
  );

  const applyFontSize = useCallback(
    (size: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          applyStyleToSelection(selection, 'font-size', size);
        }
      });
      setFontSize(size);
      onFontSizeChange?.(size);
    },
    [editor, onFontSizeChange]
  );

  const clearTextColor = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        applyStyleToSelection(selection, 'color', '');
      }
    });
    setTextColor(null);
    prevTextColorRef.current = null;
  }, [editor]);

  const clearBgColor = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        applyStyleToSelection(selection, 'background-color', '');
      }
    });
    setBgColor(null);
    prevBgColorRef.current = null;
  }, [editor]);

  React.useEffect(() => {
    onColorApply?.({ applyTextColor, applyBgColor, applyFontSize, clearTextColor, clearBgColor });
  }, [onColorApply, applyTextColor, applyBgColor, applyFontSize, clearTextColor, clearBgColor]);

  const prevTextColorRef = useRef<string | null>(null);
  const prevBgColorRef = useRef<string | null>(null);
  const prevFontSizeRef = useRef<string | null>(null);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          let targetNode: TextNode | null = null;

          if (selection.isCollapsed()) {
            const focusNode = selection.focus.getNode();
            if ($isTextNode(focusNode)) {
              targetNode = focusNode;
            }
          } else {
            const nodes = selection.getNodes();
            for (const node of nodes) {
              if ($isTextNode(node)) {
                targetNode = node;
                break;
              }
            }
          }

          if (targetNode) {
            const style = targetNode.getStyle() || '';
            const colorMatch = style.match(/(?:^|;)color:([^;]*)/);
            const bgMatch = style.match(/background-color:([^;]*)/);
            const fsMatch = style.match(/font-size:([^;]*)/);
            const newColor = colorMatch && colorMatch[1] ? colorMatch[1] : null;
            const newBg = bgMatch && bgMatch[1] ? bgMatch[1] : null;
            const newFs = fsMatch && fsMatch[1] ? fsMatch[1] : null;

            if (newColor !== prevTextColorRef.current) {
              prevTextColorRef.current = newColor;
              setTextColor(newColor);
            }
            if (newBg !== prevBgColorRef.current) {
              prevBgColorRef.current = newBg;
              setBgColor(newBg);
            }
            if (newFs !== prevFontSizeRef.current) {
              prevFontSizeRef.current = newFs;
              setFontSize(newFs);
            }

            // Notify parent of selection change
            onSelectionChange?.({ color: newColor, bgColor: newBg, fontSize: newFs });
          } else {
            if (prevTextColorRef.current !== null) {
              prevTextColorRef.current = null;
              setTextColor(null);
            }
            if (prevBgColorRef.current !== null) {
              prevBgColorRef.current = null;
              setBgColor(null);
            }
            if (prevFontSizeRef.current !== null) {
              prevFontSizeRef.current = null;
              setFontSize(null);
            }
          }
        } else {
          prevTextColorRef.current = null;
          prevBgColorRef.current = null;
          prevFontSizeRef.current = null;
          setTextColor(null);
          setBgColor(null);
          setFontSize(null);
        }
      });
    });
  }, [editor, onSelectionChange]);

  return (
    <LexicalColorContext.Provider
      value={{
        textColor,
        bgColor,
        fontSize,
        applyTextColor,
        applyBgColor,
        applyFontSize,
        clearTextColor,
        clearBgColor,
      }}
    >
      {children}
    </LexicalColorContext.Provider>
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
    minHeight: 160,
    maxHeight: 240,
    overflowY: 'auto',
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
        placeholder={
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: '8px 12px',
              color: '#999',
              pointerEvents: 'none',
              userSelect: 'none',
              fontSize: 14,
              lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
          >
            {placeholder}
          </div>
        }
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
