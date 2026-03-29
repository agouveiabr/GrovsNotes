# Codebase Structure

**Analysis Date:** 2024-03-20

## Directory Layout

```
/Users/alvarogouveia/DEV/Projetos/GrovsNotes/
├── apps/               # Applications
│   ├── web/            # Main React + Vite web app
│   └── desktop/        # Tauri + Rust desktop wrapper
├── convex/             # Backend functions, schema, and API
├── packages/
│   └── shared/         # Shared TypeScript types and constants
├── docs/               # Architecture and planning documentation
├── scripts/            # Build and development scripts
└── .planning/          # Internal GSD planning and context
```

## Directory Purposes

**`apps/web/src/components/`:**
- Purpose: Feature-specific React components.
- Contains: UI building blocks like `board`, `capture`, `inbox`.
- Key files: `app-shell.tsx`, `board-view.tsx`.

**`apps/web/src/routes/`:**
- Purpose: Page-level entry components mapping to URLs.
- Contains: Components used by `react-router-dom`.
- Key files: `board-page.tsx`, `capture-page.tsx`.

**`convex/`:**
- Purpose: Serverless backend logic and data model.
- Contains: Table definitions (`schema.ts`), queries, and mutations.
- Key files: `items.ts`, `projects.ts`, `schema.ts`.

**`packages/shared/`:**
- Purpose: Shared logic for type safety across boundaries.
- Contains: Common TypeScript types.
- Key files: `types.ts`, `constants.ts`.

## Key File Locations

**Entry Points:**
- `apps/web/src/main.tsx`: Web application bootstrap.
- `apps/web/src/App.tsx`: React root and routing configuration.
- `apps/desktop/src-tauri/src/main.rs`: Desktop app entry.

**Configuration:**
- `package.json`: Monorepo and workspace configuration.
- `convex.json`: Backend service configuration.
- `vercel.json`: Deployment settings for Vercel.

**Core Logic:**
- `convex/items.ts`: Backend item management.
- `apps/web/src/hooks/use-items-convex.ts`: Frontend item management.

## Naming Conventions

**Files:**
- [kebab-case]: `app-shell.tsx`, `use-items-convex.ts`.

**Directories:**
- [kebab-case]: `src/components/board`.

## Where to Add New Code

**New Feature (e.g., "Goals"):**
1. Define schema in `convex/schema.ts`.
2. Add backend logic in `convex/goals.ts`.
3. Add shared types in `packages/shared/src/types.ts`.
4. Create frontend components in `apps/web/src/components/goals/`.
5. Create a new page in `apps/web/src/routes/goals-page.tsx`.
6. Add route to `apps/web/src/App.tsx`.

**New Utility:**
- Shared helpers: `packages/shared/src/utils.ts` (if any).
- Frontend helpers: `apps/web/src/lib/`.

## Special Directories

**`convex/_generated/`:**
- Purpose: Types and API definitions automatically created by Convex.
- Generated: Yes.
- Committed: Yes (for deployment).

**`apps/desktop/src-tauri/`:**
- Purpose: Rust backend and configuration for Tauri.
- Committed: Yes.

---

*Structure analysis: 2024-03-20*
