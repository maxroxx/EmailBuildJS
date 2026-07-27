import React from 'react';
import { IconButton, Tooltip, Box, TextField, Button } from '@mui/material';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, IS_BOLD, IS_ITALIC, IS_UNDERLINE, IS_STRIKETHROUGH, $createTextNode } from 'lexical';
import { $createHeadingNode } from '@lexical/rich-text';
import { $createQuoteNode } from '@lexical/rich-text';
import { $createLinkNode } from '@lexical/link';
import { $createParagraphNode } from 'lexical';

// =============================================================================
// Toolbar Button Component
// =============================================================================

interface ToolbarButtonProps {
  active: boolean;
  onClick: () => void;
  tooltip: string;
  label: string;
}

function ToolbarButton({ active, onClick, tooltip, label }: ToolbarButtonProps) {
  return (
    <Tooltip title={tooltip} placement="top">
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          color: active ? '#0079cc' : '#333',
          '&:hover': {
            backgroundColor: active ? '#e3f2fd' : '#f5f5f5',
          },
          minWidth: 32,
          width: 32,
          height: 32,
          fontSize: 14,
          fontWeight: active ? 700 : 400,
        }}
      >
        {label}
      </IconButton>
    </Tooltip>
  );
}

// =============================================================================
// Main Toolbar Component
// =============================================================================

export function EditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const editable = useLexicalEditable();
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState('https://');
  const linkInputRef = React.useRef<HTMLInputElement>(null);

  const [formats, setFormats] = React.useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    heading: false,
    heading2: false,
    quote: false,
    paragraph: false,
  });

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        const isRange = $isRangeSelection(selection);

        if (!isRange) {
          setFormats({ bold: false, italic: false, underline: false, strikethrough: false, heading: false, heading2: false, quote: false, paragraph: false });
          return;
        }

        const anchor = selection.anchor;
        const node = anchor.getNode();

        const textNode = node;
        const hasBold = Boolean((textNode as any).__format & IS_BOLD);
        const hasItalic = Boolean((textNode as any).__format & IS_ITALIC);
        const hasUnderline = Boolean((textNode as any).__format & IS_UNDERLINE);
        const hasStrikethrough = Boolean((textNode as any).__format & IS_STRIKETHROUGH);

        const parentElement = (textNode as any).__parent;
        let parentType: string | null = null;
        if (parentElement) {
          let currentParent: any = parentElement;
          while (currentParent) {
            if (currentParent.__type === 'heading') {
              const tag = (currentParent as any).__tag;
              parentType = tag === 'h2' ? 'heading2' : 'heading';
              break;
            }
            if (currentParent.__type === 'quote') {
              parentType = 'quote';
              break;
            }
            currentParent = currentParent.__parent;
          }
        }

        setFormats({
          bold: hasBold,
          italic: hasItalic,
          underline: hasUnderline,
          strikethrough: hasStrikethrough,
          heading: parentType === 'heading',
          heading2: parentType === 'heading2',
          quote: parentType === 'quote',
          paragraph: parentType === 'paragraph',
        });
      });
    });
  }, [editor]);

  const toggleBold = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
      }
    });
  };

  const toggleItalic = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
      }
    });
  };

  const toggleUnderline = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
      }
    });
  };

  const toggleStrikethrough = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
      }
    });
  };

  const toggleHeading = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const node = anchor.getNode();
        const parentElement = node.getParent();

        if (parentElement && parentElement.getType() === 'heading') {
          const tag = (parentElement as any).__tag;
          if (tag === 'h1') {
            // h1 → paragraph
            const paragraph = $createParagraphNode();
            parentElement.getChildren().forEach((child: any) => {
              paragraph.append(child);
            });
            parentElement.replace(paragraph);
            paragraph.select(0, 0);
          } else {
            // h2 → h1
            const headingNode = $createHeadingNode('h1');
            parentElement.getChildren().forEach((child: any) => {
              headingNode.append(child);
            });
            parentElement.replace(headingNode);
            headingNode.select(0, 0);
          }
        } else {
          // paragraph → h1
          const headingNode = $createHeadingNode('h1');
          parentElement?.getChildren().forEach((child: any) => {
            headingNode.append(child);
          });
          parentElement?.replace(headingNode);
          headingNode.select(0, 0);
        }
      }
    });
  };

  const toggleHeading2 = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const node = anchor.getNode();
        const parentElement = node.getParent();

        if (parentElement && parentElement.getType() === 'heading') {
          const tag = (parentElement as any).__tag;
          if (tag === 'h2') {
            // h2 → paragraph
            const paragraph = $createParagraphNode();
            parentElement.getChildren().forEach((child: any) => {
              paragraph.append(child);
            });
            parentElement.replace(paragraph);
            paragraph.select(0, 0);
          } else {
            // h1 → h2
            const headingNode = $createHeadingNode('h2');
            parentElement.getChildren().forEach((child: any) => {
              headingNode.append(child);
            });
            parentElement.replace(headingNode);
            headingNode.select(0, 0);
          }
        } else {
          // paragraph → h2
          const headingNode = $createHeadingNode('h2');
          parentElement?.getChildren().forEach((child: any) => {
            headingNode.append(child);
          });
          parentElement?.replace(headingNode);
          headingNode.select(0, 0);
        }
      }
    });
  };

  const toggleQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const node = anchor.getNode();
        const parentElement = node.getParent();

        if (parentElement && parentElement.getType() === 'quote') {
          const paragraph = $createParagraphNode();
          parentElement.getChildren().forEach((child: any) => {
            paragraph.append(child);
          });
          parentElement.replace(paragraph);
          paragraph.select(0, 0);
        } else {
          const quoteNode = $createQuoteNode();
          parentElement?.getChildren().forEach((child: any) => {
            quoteNode.append(child);
          });
          parentElement?.replace(quoteNode);
          quoteNode.select(0, 0);
        }
      }
    });
  };

  const toggleParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const node = anchor.getNode();
        const parentElement = node.getParent();

        if (parentElement && (parentElement.getType() === 'heading' || parentElement.getType() === 'quote')) {
          const paragraph = $createParagraphNode();
          parentElement.getChildren().forEach((child: any) => {
            paragraph.append(child);
          });
          parentElement.replace(paragraph);
          paragraph.select(0, 0);
        } else if (parentElement && parentElement.getType() === 'paragraph') {
          // Already a paragraph, no-op but select it
          parentElement.select(0, 0);
        }
      }
    });
  };

  const handleInsertLink = (url: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const linkNode = $createLinkNode(url);
        const selectedText = selection.getTextContent();
        if (selectedText) {
          const textNode = $createTextNode(selectedText);
          linkNode.append(textNode);
        }
        selection.insertNodes([linkNode]);
        linkNode.select();
      }
    });
    setShowLinkInput(false);
    setLinkUrl('https://');
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInsertLink(linkUrl);
    } else if (e.key === 'Escape') {
      setShowLinkInput(false);
      setLinkUrl('https://');
    }
  };

  const openLinkInput = () => {
    setShowLinkInput(true);
    setLinkUrl('https://');
    setTimeout(() => linkInputRef.current?.focus(), 0);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          padding: '4px 8px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          width: '100%',
        }}
      >
        {/* Line 1: Bold, Italic, Underline, Strikethrough, H1, H2, Quote */}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <ToolbarButton
            active={formats.bold}
            onClick={toggleBold}
            tooltip="Bold (Ctrl+B)"
            label="B"
          />
          <ToolbarButton
            active={formats.italic}
            onClick={toggleItalic}
            tooltip="Italic (Ctrl+I)"
            label="I"
          />
          <ToolbarButton
            active={formats.underline}
            onClick={toggleUnderline}
            tooltip="Underline (Ctrl+U)"
            label="U"
          />
          <ToolbarButton
            active={formats.strikethrough}
            onClick={toggleStrikethrough}
            tooltip="Strikethrough"
            label="S"
          />
          <ToolbarButton
            active={formats.heading}
            onClick={toggleHeading}
            tooltip="Heading 1"
            label="H1"
          />
          <ToolbarButton
            active={formats.heading2}
            onClick={toggleHeading2}
            tooltip="Heading 2"
            label="H2"
          />
          <ToolbarButton
            active={formats.quote}
            onClick={toggleQuote}
            tooltip="Quote"
            label="Q"
          />
        </Box>

        {/* Line 2: Paragraph (toggle), Link */}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <ToolbarButton
            active={formats.paragraph}
            onClick={toggleParagraph}
            tooltip="Paragraph"
            label="P"
          />
          <Tooltip title="Insert Link" placement="top">
            <span>
              <IconButton
                size="small"
                onClick={openLinkInput}
                disabled={!editable}
                sx={{
                  color: '#333',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  minWidth: 32,
                  width: 32,
                  height: 32,
                  fontSize: 14,
                }}
              >
                🔗
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Inline link input */}
        {showLinkInput && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <TextField
              inputRef={linkInputRef}
              size="small"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              placeholder="https://example.com"
              sx={{ width: 220 }}
            />
            <Button size="small" variant="contained" onClick={() => handleInsertLink(linkUrl)}>
              Insert
            </Button>
            <Button size="small" onClick={() => { setShowLinkInput(false); setLinkUrl('https://'); }}>
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}
