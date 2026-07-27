import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Text, lexicalToHTML, normalizeTextProps, LexicalEditorState, createEmptyLexicalState, LexicalTextNode } from '.';

// =============================================================================
// Legacy behavior tests (backward compatibility)
// =============================================================================

describe('block-text', () => {
  it('renders with default values', () => {
    expect(render(<Text />).asFragment()).toMatchSnapshot();
  });

  it('sanitizes HTML', () => {
    expect(
      render(
        <Text
          props={{
            markdown: true,
            text: `
<script>alert(1)</script>
<img src=x onerror=alert(1) />

[a](javascript:prompt(document.cookie))
[Basic](javascript:alert('Basic'))
[Local Storage](javascript:alert(JSON.stringify(localStorage)))
[CaseInsensitive](JaVaScRiPt:alert('CaseInsensitive'))
[URL](javascript://www.google.com%0Aalert('URL'))

[In Quotes]('javascript:alert("InQuotes")')
[a](j a v a s c r i p t:prompt(document.cookie))
[a](data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K)
[a](javascript:window.onerror=alert;throw%201)
![Uh oh...]("onerror="alert('XSS'))
![Uh oh...](https://www.example.com/image.png"onload="alert('XSS'))
![Escape SRC - onload](https://www.example.com/image.png"onload="alert('ImageOnLoad'))
![Escape SRC - onerror]("onerror="alert('ImageOnError'))

<div>
<img src />
<a>link 1</a>
<a href>link 2</a>
<a href="">link 3</a>
<a title>link 4</a>
<a title="">link 5</a>
<a href="ftp://domain.name">link 6</a>
<a href="javascript:alert('hello world')">link 7</a>
</div>
`,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with safe markdown', () => {
    expect(
      render(
        <Text
          props={{
            text: `This <span onClick="alert('!')">text</span> block has the **Markdown** option *turned on*.

- One
- Two
- Three

Powered by [Waypoint](https://usewaypoint.com)`,
            markdown: true,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders without markdown', () => {
    expect(
      render(
        <Text
          props={{
            text: `## This is not <span>markdown</span>`,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  // =============================================================================
  // normalizeTextProps tests
  // =============================================================================

  describe('normalizeTextProps', () => {
    it('returns empty lexical state when props is null', () => {
      const result = normalizeTextProps(null);
      expect(result.lexical).toBeDefined();
      expect(result.lexical?.root.type).toBe('paragraph');
      expect(result.text).toBe('');
    });

    it('returns empty lexical state when props is undefined', () => {
      const result = normalizeTextProps(undefined);
      expect(result.lexical).toBeDefined();
      expect(result.lexical?.root.type).toBe('paragraph');
    });

    it('returns existing lexical data unchanged', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'paragraph',
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: '',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: 'Hello',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      };
      const result = normalizeTextProps({ lexical });
      expect(result.lexical).toBe(lexical);
    });

    it('converts legacy text to lexical', () => {
      const result = normalizeTextProps({ text: 'Hello world' });
      expect(result.lexical).toBeDefined();
      expect(result.lexical?.root.type).toBe('paragraph');
      const textChild = result.lexical?.root.children[0] as LexicalTextNode;
      expect(textChild.type).toBe('text');
      expect(textChild.text).toBe('Hello world');
    });

    it('converts legacy text with markdown flag to lexical', () => {
      const result = normalizeTextProps({ text: 'Hello', markdown: true });
      expect(result.lexical).toBeDefined();
      expect(result.markdown).toBe(true);
      const textChild = result.lexical?.root.children[0] as LexicalTextNode;
      expect(textChild.text).toBe('Hello');
    });
  });

  // =============================================================================
  // lexicalToHTML tests
  // =============================================================================

  describe('lexicalToHTML', () => {
    it('returns empty string for null input', () => {
      expect(lexicalToHTML(null as unknown as LexicalEditorState)).toBe('');
    });

    it('returns empty string for empty root', () => {
      expect(lexicalToHTML({ root: null as unknown as any })).toBe('');
    });

    it('renders plain text', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'paragraph',
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: '',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: 'Hello world',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      };
      const html = lexicalToHTML(lexical);
      expect(html).toBe('<p>Hello world</p>');
    });

    it('renders bold text', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'paragraph',
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: 'bold',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: 'Bold text',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      };
      const html = lexicalToHTML(lexical);
      expect(html).toContain('font-weight:bold');
      expect(html).toContain('Bold text');
    });

    it('renders italic text', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'paragraph',
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: 'italic',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: 'Italic text',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      };
      const html = lexicalToHTML(lexical);
      expect(html).toContain('font-style:italic');
      expect(html).toContain('Italic text');
    });

    it('renders underline text', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'paragraph',
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: 'underline',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: 'Underlined',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      };
      const html = lexicalToHTML(lexical);
      expect(html).toContain('text-decoration:underline');
    });

    it('renders strikethrough text', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'paragraph',
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: 'strikethrough',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: 'Deleted',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      };
      const html = lexicalToHTML(lexical);
      expect(html).toContain('text-decoration:line-through');
    });

    it('renders combined bold and italic', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'paragraph',
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: 'bold italic',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: 'Both',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      };
      const html = lexicalToHTML(lexical);
      expect(html).toContain('font-weight:bold');
      expect(html).toContain('font-style:italic');
    });

    it('renders heading1', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'heading',
          format: '',
          indent: 0,
          direction: 'ltr',
          tag: 'h1',
          children: [
            {
              type: 'text',
              format: '',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: 'Heading 1',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      } as LexicalEditorState;
      const html = lexicalToHTML(lexical);
      expect(html).toContain('<h1');
      expect(html).toContain('Heading 1');
    });

    it('renders heading2', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'heading',
          format: '',
          indent: 0,
          direction: 'ltr',
          tag: 'h2',
          children: [
            {
              type: 'text',
              format: '',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: 'Heading 2',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      } as LexicalEditorState;
      const html = lexicalToHTML(lexical);
      expect(html).toContain('<h2');
      expect(html).toContain('Heading 2');
    });

    it('renders quote', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'quote',
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: '',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: 'Quote text',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      };
      const html = lexicalToHTML(lexical);
      expect(html).toContain('<blockquote');
      expect(html).toContain('Quote text');
    });

    it('renders link', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'paragraph',
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'link',
              format: '',
              indent: 0,
              direction: 'ltr',
              url: 'https://example.com',
              children: [
                {
                  type: 'text',
                  format: '',
                  indent: 0,
                  direction: 'ltr',
                  children: [],
                  version: 1,
                  detail: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Click here',
                } as LexicalTextNode,
              ],
              version: 1,
            },
          ],
          version: 1,
        },
      } as unknown as LexicalEditorState;
      const html = lexicalToHTML(lexical);
      expect(html).toContain('<a href="https://example.com"');
      expect(html).toContain('Click here');
    });

    it('escapes HTML special characters', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'paragraph',
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: '',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: '<script>alert("xss")</script>',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      };
      const html = lexicalToHTML(lexical);
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>');
    });

    it('renders empty text node', () => {
      const lexical: LexicalEditorState = {
        root: {
          type: 'paragraph',
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: '',
              indent: 0,
              direction: 'ltr',
              children: [],
              version: 1,
              detail: 0,
              mode: 'normal',
              style: '',
              text: '',
            } as LexicalTextNode,
          ],
          version: 1,
        },
      };
      const html = lexicalToHTML(lexical);
      expect(html).toBe('<p></p>');
    });
  });

  // =============================================================================
  // Lexical rendering tests
  // =============================================================================

  function createLexicalState(text: string, format = ''): LexicalEditorState {
    return {
      root: {
        type: 'paragraph',
        format: '',
        indent: 0,
        direction: 'ltr',
        children: [
          {
            type: 'text',
            format,
            indent: 0,
            direction: 'ltr',
            children: [],
            version: 1,
            detail: 0,
            mode: 'normal',
            style: '',
            text,
          } as LexicalTextNode,
        ],
        version: 1,
      },
    };
  }

  describe('Text component with Lexical', () => {
    it('renders Lexical JSON', () => {
      const lexical = createLexicalState('Lexical content');
      const { container } = render(<Text props={{ lexical }} />);
      expect(container.querySelector('p')?.textContent).toBe('Lexical content');
    });

    it('renders bold Lexical content', () => {
      const lexical = createLexicalState('Bold', 'bold');
      const { container } = render(<Text props={{ lexical }} />);
      const span = container.querySelector('span');
      expect(span?.style.fontWeight).toBe('bold');
    });

    it('lexicals takes priority over legacy text', () => {
      const lexical = createLexicalState('Lexical');
      const { container } = render(
        <Text props={{ lexical, text: 'Legacy' }} />
      );
      expect(container.querySelector('p')?.textContent).toBe('Lexical');
    });

    it('falls back to legacy text when no lexical', () => {
      const { container } = render(<Text props={{ text: 'Legacy text' }} />);
      expect(container.querySelector('div')?.textContent).toBe('Legacy text');
    });

    it('falls back to legacy markdown when no lexical', () => {
      const { container } = render(
        <Text props={{ text: '**Bold**', markdown: true }} />
      );
      expect(container.querySelector('strong')).toBeTruthy();
    });
  });

  // =============================================================================
  // createEmptyLexicalState tests
  // =============================================================================

  describe('createEmptyLexicalState', () => {
    it('returns valid empty lexical state', () => {
      const state = createEmptyLexicalState();
      expect(state.root.type).toBe('paragraph');
      expect(state.root.children.length).toBe(1);
      expect(state.root.children[0].type).toBe('text');
      expect((state.root.children[0] as LexicalTextNode).text).toBe('');
    });
  });
});
