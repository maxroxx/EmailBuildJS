# AGENTS.md

npm-workspaces monorepo: `packages/*` (13 libraries) + `examples/vite-emailbuilder-mui` (the demo app).

## Commands (run from repo root unless noted)

```bash
npm install                    # root only; workspaces hoist into root node_modules
npm run build                  # tsup build of ALL packages -> each package's dist/
npm test                       # jest (ts-jest, jsdom), all suites
npx jest packages/block-text/src/index.spec.tsx   # single suite
npx jest -t "test name"        # single test by name
```

Verification order (matches CI, `.github/workflows/ci.yaml`): `npx eslint .` → `npx prettier . --check` → `npx tsc --noEmit` → `npm test`.

Run the demo (after root install + build):

```bash
npm run dev   # in examples/vite-emailbuilder-mui
# http://localhost:5173/email-builder-js/  (base path is NOT "/" — vite.config.ts sets base: '/email-builder-js/')
```

## Critical gotcha: example consumes dist/, not src/

The example resolves `@usewaypoint/*` via workspace symlinks whose `main`/`module` point at each package's `dist/`. There are no vite aliases to source. **After editing any `packages/*/src` file, run `npm run build` before the dev server will pick it up.**

## Architecture

- `packages/document-core` — shared document model: zod schemas, builder utilities (`src/builders`), core types. Everything else builds on this.
- `packages/email-builder` — the runtime: `Reader` (`src/Reader/core.tsx`), `renderToStaticMarkup` (`src/renderers`), built-in layout blocks (`src/blocks`: EmailLayout, Container, Columns, Rows).
- `packages/block-*` — one package per block type (text, button, image, heading, divider, spacer, html, avatar, container, columns, rows); each exports its block component + settings schema.
- `packages/block-text` — wraps a Lexical rich-text editor (`LexicalEditor.tsx`, `EditorToolbar.tsx`); lexical packages are deduped in the example's vite config.
- `examples/vite-emailbuilder-mui/src/App` — builder UI (InspectorDrawer, TemplatePanel, SamplesDrawer); `src/getConfiguration` / `src/documents` wire block packages into the builder.

## Conventions

- Prettier: single quotes, semis, 120 printWidth, 2-space indent, ES5 trailing commas.
- ESLint: `@typescript-eslint/no-explicit-any` is an error (disabled in `*.spec.*` files); `simple-import-sort` import ordering is enforced; `curly: all`.
- Jest specs are co-located as `src/*.spec.tsx` (document-core uses `tests/`); snapshot files live in `__snapshots__/` — update with `npx jest -u` only when output changes are intended.
