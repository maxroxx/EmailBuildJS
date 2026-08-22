# AGENTS.md

npm-workspaces monorepo: `packages/*` (13 library packages) + `examples/vite-emailbuilder-mui` (demo app).

## Commands (run from repo root unless noted)

```bash
npm install                    # root only; workspaces hoist into root node_modules
npm run build                  # tsup build of 13 library packages → each package's dist/
npm run build --workspaces     # CI: builds all packages AND runs `vite build` in the example
npm test                       # jest (ts-jest, jsdom), all suites
npx jest packages/block-text/src/index.spec.tsx   # single suite
npx jest -t "test name"        # single test by name
```

Verification order (matches CI, `.github/workflows/ci.yaml`): `npx eslint .` → `npx prettier . --check` → `npx tsc --noEmit` → `npm test`.

Run the demo (after root install + library build):

```bash
npm run dev   # in examples/vite-emailbuilder-mui
# http://localhost:5173/email-builder-js/  (base path is NOT "/" — vite.config.ts sets base: '/email-builder-js/')
```

## Critical gotchas

**Example consumes `dist/`, not `src/`** — workspace symlinks resolve `@usewaypoint/*` to each package's `dist/`. There are no vite aliases to source. **After editing any `packages/*/src` file, run `npm run build` before the dev server will pick it up.**

**Undo/redo history persists in browser localStorage** — the demo stores up to 10 undo states under the key `email-builder-undo-redo` (`examples/vite-emailbuilder-mui/src/hooks/useUndoRedo.ts`). This is client-side only and does NOT travel with the repo. To clear: open DevTools → Application → Local Storage → delete `email-builder-undo-redo`. To version/invalidate old history, bump `STORAGE_VERSION` in that file.

## Architecture

- `packages/document-core` — shared document model: zod schemas, builder utilities (`src/builders`), core types. Everything else builds on this.
- `packages/email-builder` — the runtime: `Reader` (`src/Reader/core.tsx`), `renderToStaticMarkup` (`src/renderers`), built-in layout blocks (`src/blocks`: EmailLayout, Container, Columns, Rows). Depends on 10 block packages (not `block-rows-container`).
- `packages/block-*` — one package per block type (text, button, image, heading, divider, spacer, html, avatar, container, columns, rows); each exports its block component + settings schema.
- `packages/block-text` — wraps a Lexical rich-text editor (`LexicalEditor.tsx`, `EditorToolbar.tsx`); exports three entry points (`.` , `./LexicalEditor`, `./EditorToolbar`). Lexical packages are deduped in the example's vite config (`vite.config.ts` resolve.dedupe).
- `examples/vite-emailbuilder-mui/src/App` — builder UI (InspectorDrawer, TemplatePanel, SamplesDrawer); `src/getConfiguration` / `src/documents` wire block packages into the builder. Editor state managed by Zustand (`editorStateStore`). Undo/redo uses `undoRedoSkipSnapshotRef` to skip capturing snapshots during undo/redo operations.

## Conventions

- Prettier: single quotes, semis, 120 printWidth, 2-space indent, ES5 trailing commas.
- ESLint: `@typescript-eslint/no-explicit-any` is an error (disabled in `*.spec.*` files); `simple-import-sort` import ordering is enforced; `curly: all`.
- Jest specs are co-located as `src/*.spec.tsx` (document-core uses `tests/`); snapshot files live in `__snapshots__/` — update with `npx jest -u` only when output changes are intended.
