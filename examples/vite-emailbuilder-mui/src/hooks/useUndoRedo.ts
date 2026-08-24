import { useCallback, useEffect, useRef } from 'react';

import { TEditorConfiguration } from '../documents/editor/core';
import {
  editorStateStore,
  setDocumentForUndo,
  setSelectedBlockId,
  undoRedoSkipSnapshotRef,
} from '../documents/editor/EditorContext';

const UNDO_REDO_STORAGE_KEY = 'email-builder-undo-redo';
const MAX_DEPTH = 10;

// Consecutive document changes within this window are coalesced into a single
// undo entry, so dragging a slider or color picker creates one undo step
// instead of flooding the history with per-pixel entries.
const COALESCE_WINDOW_MS = 400;

// Keys that represent rich-text content. Changes to these are handled by the
// text editor's own undo (Lexical HistoryPlugin), so they must NOT create
// document-history entries. They are blanked out when building the signature.
const TEXT_CONTENT_KEYS = new Set(['text', 'lexical']);

type HistoryEntry = {
  document: TEditorConfiguration;
  selectedBlockId: string | null;
};

// Builds a JSON signature of the document with text-content values removed,
// so text-only changes compare as equal and are skipped by the history.
function getDocumentSignature(document: TEditorConfiguration): string {
  return JSON.stringify(document, (key, value) => {
    if (TEXT_CONTENT_KEYS.has(key)) {
      return '<<TEXT>>';
    }
    return value;
  });
}

function loadFromStorage(): HistoryEntry[] | null {
  try {
    const raw = localStorage.getItem(UNDO_REDO_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(history: HistoryEntry[]) {
  try {
    localStorage.setItem(UNDO_REDO_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function useUndoRedo() {
  const undoStackRef = useRef<HistoryEntry[]>(loadFromStorage() ?? []);
  const redoStackRef = useRef<HistoryEntry[]>([]);
  const lastCaptureTimeRef = useRef(0);

  // Subscribe to Zustand store changes
  useEffect(() => {
    const unsubscribe = editorStateStore.subscribe((_state, prevState) => {
      // Skip capturing during undo/redo operations — the state change came from
      // setDocumentForUndo, not from a user mutation.
      if (undoRedoSkipSnapshotRef.current) {
        return;
      }

      const currentDoc = _state.document;
      const previousDoc = prevState.document;

      // Ignore text-only changes (handled by the text editor's own undo) and
      // any non-document state changes (selection, tabs, etc.)
      if (getDocumentSignature(currentDoc) === getDocumentSignature(previousDoc)) {
        return;
      }

      // Coalesce rapid consecutive changes (e.g. a slider drag) into one entry
      const now = Date.now();
      const isRapidFollowUp = now - lastCaptureTimeRef.current < COALESCE_WINDOW_MS;
      if (!isRapidFollowUp) {
        const entry: HistoryEntry = {
          document: previousDoc,
          selectedBlockId: prevState.selectedBlockId,
        };

        const stack = undoStackRef.current;
        stack.push(entry);
        if (stack.length > MAX_DEPTH) {
          stack.shift();
        }
        saveToStorage(stack);

        lastCaptureTimeRef.current = now;
      }

      // Any document change after undo/redo starts a fresh redo branch
      redoStackRef.current = [];
    });

    return unsubscribe;
  }, []);

  const undo = useCallback(() => {
    const undoStack = undoStackRef.current;
    if (undoStack.length === 0) {
      return;
    }

    const lastIndex = undoStack.length - 1;
    const entry = undoStack[lastIndex];
    undoStack.length = lastIndex;

    // Save the current state so redo can restore it later.
    const currentState = editorStateStore.getState();
    const redoStack = redoStackRef.current;
    redoStack.push({
      document: currentState.document,
      selectedBlockId: currentState.selectedBlockId,
    });
    if (redoStack.length > MAX_DEPTH) {
      redoStack.shift();
    }

    setDocumentForUndo(entry.document);
    setSelectedBlockId(entry.selectedBlockId);

    // Ensure the next user change is captured as a fresh action, even if it
    // happens within the coalesce window right after this undo.
    lastCaptureTimeRef.current = 0;
    saveToStorage(undoStack);
  }, []);

  const redo = useCallback(() => {
    const redoStack = redoStackRef.current;
    if (redoStack.length === 0) {
      return;
    }

    const lastIndex = redoStack.length - 1;
    const entry = redoStack[lastIndex];
    redoStack.length = lastIndex;

    // Save the current state so undo can restore it later.
    const currentState = editorStateStore.getState();
    const undoStack = undoStackRef.current;
    undoStack.push({
      document: currentState.document,
      selectedBlockId: currentState.selectedBlockId,
    });
    if (undoStack.length > MAX_DEPTH) {
      undoStack.shift();
    }

    setDocumentForUndo(entry.document);
    setSelectedBlockId(entry.selectedBlockId);

    lastCaptureTimeRef.current = 0;
    saveToStorage(undoStack);
  }, []);

  const clear = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    try {
      localStorage.removeItem(UNDO_REDO_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  return { canUndo, canRedo, undo, redo, clear };
}
