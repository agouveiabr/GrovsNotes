# Coding Conventions

**Analysis Date:** 2025-03-29

## Naming Patterns

**Files:**
- Kebab-case for all source files: `board-view.tsx`, `use-items-convex.ts`, `types.ts`.

**Functions:**
- PascalCase for React components: `BoardView`, `KanbanCard`.
- camelCase for React hooks: `useProjects`, `useBoardItems`.
- camelCase for helper functions and Convex function exports: `createItem`, `parseHashtags`.

**Variables:**
- camelCase for most variables and constants: `allItems`, `now`, `itemsByStatus`.
- UPPER_CASE_SNAKE_CASE for constant arrays or objects: `ITEM_TYPES`, `ITEM_STATUSES` in `packages/shared/src/types.ts`.

**Types and Interfaces:**
- PascalCase for all types and interfaces: `BoardViewProps`, `Item`, `ItemWithTags`.

## Code Style

**Formatting:**
- 2-space indentation.
- No semicolons (some files use them, some don't, but `eslint.config.js` doesn't explicitly enforce it; Vite/ESLint default is common).
- Single quotes preferred for strings.

**Linting:**
- ESLint with `typescript-eslint` and `eslint-plugin-react-hooks`.
- Configured in `apps/web/eslint.config.js`.
- Base configuration includes:
  - `js.configs.recommended`
  - `tseslint.configs.recommended`
  - `reactHooks.configs.flat.recommended`

## Import Organization

**Order:**
1.  **External React Libraries:** `react`, `@dnd-kit/core`, `framer-motion`.
2.  **External Types:** `type { DragEndEvent }`.
3.  **Shared Packages:** `@grovsnotes/shared`.
4.  **Local Hooks:** `@/hooks/use-projects-convex`.
5.  **Local UI Components:** `@/components/ui/select`.
6.  **Local Feature Components:** `./kanban-column`.
7.  **Utilities/Styles:** `sonner`, `@/lib/utils`.

**Path Aliases:**
- `@/` maps to `src/` in `apps/web`.

## Error Handling

**UI Patterns:**
- Try/catch blocks around async operations (e.g., in event handlers).
- User feedback via `toast` from `sonner`.
- Example in `apps/web/src/components/board/board-view.tsx`:
  ```typescript
  try {
    await updateItem({ id: item.id, status: targetStatus });
  } catch (err) {
    toast.error('Failed to update item status');
  }
  ```

**Backend (Convex) Patterns:**
- `throw new Error("...")` for business logic errors.
- Automatic validation via Convex `v` schema.

## Logging

**Framework:** `console` for debugging; `toast` for user-facing errors.

**Patterns:**
- No structured logging framework detected.
- `console.error` is common for catching unexpected failures.

## Comments

**When to Comment:**
- Structural comments in long files: `{/* Header with project filter */}` in JSX.
- Logic explanation for complex data transformations (e.g., grouping items in `board-view.tsx`).

**JSDoc/TSDoc:**
- Minimally used. Patterns rely on TypeScript types for documentation.

## Function Design

**Size:** Preference for small, focused components and hooks.

**Parameters:** Prefer destructured objects for props in React components (`{ projectId }: BoardViewProps`).

**Return Values:** React components return JSX elements. Hooks often return data directly or objects containing data and mutation functions.

## Module Design

**Exports:**
- Named exports preferred over default exports for components and utility functions.
- Barrel files used for shared packages: `packages/shared/src/index.ts`.

**Convex:**
- Exported constants `createItem`, `listItems` represent API endpoints.

---

*Convention analysis: 2025-03-29*
