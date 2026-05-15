import { useEffect } from 'react';

import { renderToStaticMarkup } from '@usewaypoint/email-builder';

import {
  getDocument,
  getSelectedBlockId,
  resetDocument,
  setDocument,
  setSelectedMainTab,
  subscribeDocument,
} from '../documents/editor/EditorContext';
import { EditorConfigurationSchema, TEditorConfiguration } from '../documents/editor/core';

const HOST_SOURCE = 'email-builder-host';
const BRIDGE_SOURCE = 'email-builder-js';

type MainTab = 'editor' | 'preview' | 'json' | 'html';

type HostMessage = {
  source?: unknown;
  type?: unknown;
  document?: unknown;
  requestId?: unknown;
  tab?: unknown;
  url?: unknown;
};

function renderDocument(document: TEditorConfiguration) {
  return {
    document,
    html: renderToStaticMarkup(document, { rootBlockId: 'root' }),
  };
}

function postToHost(type: string, payload: Record<string, unknown> = {}) {
  if (window.parent === window) {
    return;
  }

  window.parent.postMessage(
    {
      source: BRIDGE_SOURCE,
      type,
      ...payload,
    },
    '*'
  );
}

function postCurrentState(type = 'emailbuilder:state', requestId?: unknown) {
  try {
    postToHost(type, {
      requestId,
      ...renderDocument(getDocument()),
    });
  } catch (error) {
    postToHost('emailbuilder:error', {
      requestId,
      message: error instanceof Error ? error.message : 'Unable to render current document',
    });
  }
}

function parseMainTab(tab: unknown): MainTab | null {
  switch (tab) {
    case 'editor':
    case 'preview':
    case 'json':
    case 'html':
      return tab;
    default:
      return null;
  }
}

function setSelectedImageUrl(url: string) {
  const selectedBlockId = getSelectedBlockId();
  const document = getDocument();
  const selectedBlock = selectedBlockId === null ? null : document[selectedBlockId];

  if (selectedBlockId === null || selectedBlock === null || selectedBlock?.type !== 'Image') {
    throw new Error('Select an image block before inserting an uploaded image URL.');
  }

  const blockData = (selectedBlock.data ?? {}) as Record<string, unknown>;
  const blockProps = (blockData.props ?? {}) as Record<string, unknown>;

  setDocument({
    [selectedBlockId]: {
      ...selectedBlock,
      data: {
        ...blockData,
        props: {
          ...blockProps,
          url,
        },
      },
    },
  } as TEditorConfiguration);
}

export default function HostBridge() {
  useEffect(() => {
    const unsubscribe = subscribeDocument((document) => {
      try {
        postToHost('emailbuilder:change', renderDocument(document));
      } catch (error) {
        postToHost('emailbuilder:error', {
          message: error instanceof Error ? error.message : 'Unable to render changed document',
        });
      }
    });

    const handleMessage = (event: MessageEvent<HostMessage>) => {
      const message = event.data;
      if (message?.source !== HOST_SOURCE || typeof message.type !== 'string') {
        return;
      }

      try {
        switch (message.type) {
          case 'emailbuilder:load': {
            const parsed = EditorConfigurationSchema.safeParse(message.document);
            if (!parsed.success) {
              throw new Error('Host provided an invalid EmailBuilder document.');
            }
            resetDocument(parsed.data);
            postCurrentState('emailbuilder:loaded', message.requestId);
            return;
          }
          case 'emailbuilder:request-state':
            postCurrentState('emailbuilder:state', message.requestId);
            return;
          case 'emailbuilder:select-tab': {
            const tab = parseMainTab(message.tab);
            if (tab === null) {
              throw new Error('Host requested an unknown editor tab.');
            }
            setSelectedMainTab(tab);
            postCurrentState('emailbuilder:state', message.requestId);
            return;
          }
          case 'emailbuilder:set-selected-image-url': {
            if (typeof message.url !== 'string' || message.url.length === 0) {
              throw new Error('Host image message is missing a URL.');
            }
            setSelectedImageUrl(message.url);
            postCurrentState('emailbuilder:state', message.requestId);
            return;
          }
        }
      } catch (error) {
        postToHost('emailbuilder:error', {
          requestId: message.requestId,
          message: error instanceof Error ? error.message : 'Unable to handle host message',
        });
      }
    };

    window.addEventListener('message', handleMessage);
    postCurrentState('emailbuilder:ready');

    return () => {
      window.removeEventListener('message', handleMessage);
      unsubscribe();
    };
  }, []);

  return null;
}
