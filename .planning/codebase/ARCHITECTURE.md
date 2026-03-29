# Architecture

**Analysis Date:** 2024-03-20

## Pattern Overview

**Overall:** Monorepo with Serverless Backend (Convex) and Modern Frontend (React + Vite).

**Key Characteristics:**
- **Real-time Synchronization**: Convex provides automatic real-time updates across clients.
- **Unified Domain Models**: Shared TypeScript types between frontend and backend.
- **Feature-Based Frontend**: Components and routes organized by domain focus (e.g., board, inbox, projects).

## Layers

**Backend (Convex):**
- Purpose: Database, API (Queries, Mutations, Actions), and background processing.
- Location: `/Users/alvarogouveia/DEV/Projetos/GrovsNotes/convex/`
- Contains: Schema definition, database functions, AI integrations, and external API connectors.
- Depends on: `@grovsnotes/shared` (types)
- Used by: `apps/web/`, `apps/desktop/`

**Shared Logic/Types:**
- Purpose: Maintain consistency across the monorepo.
- Location: `/Users/alvarogouveia/DEV/Projetos/GrovsNotes/packages/shared/`
- Contains: Common types (`Item`, `Project`, `ItemStatus`), constants, and API interfaces.
- Used by: `convex/`, `apps/web/`

**Frontend (Web):**
- Purpose: Primary user interface for the web and potentially desktop wrapper.
- Location: `/Users/alvarogouveia/DEV/Projetos/GrovsNotes/apps/web/`
- Contains: React components, feature-specific routes, and Convex hooks.
- Depends on: `convex/`, `@grovsnotes/shared`

## Data Flow

**Standard Item Creation:**

1. User enters data in `CaptureInput` (`apps/web/src/components/capture/capture-input.tsx`).
2. Frontend calls `useCreateItem` hook (`apps/web/src/hooks/use-items-convex.ts`).
3. Hook invokes `api.items.createItem` mutation on Convex (`convex/items.ts`).
4. Convex updates the `items` table and notifies all active clients.

**State Management:**
- **Server State**: Managed entirely by Convex. The frontend uses `useQuery` to reactively bind to database state.
- **Local UI State**: Managed via React `useState` within individual components.

## Key Abstractions

**Items:**
- Purpose: The fundamental unit of content in GrovsNotes (tasks, ideas, notes).
- Examples: Defined in `convex/schema.ts` and `packages/shared/src/types.ts`.
- Pattern: Polymorphic record type with `type` and `status` fields.

**Projects:**
- Purpose: Logical grouping of items.
- Examples: `convex/projects.ts`.

## Entry Points

**Web Frontend:**
- Location: `apps/web/src/main.tsx`
- Triggers: Browser page load.
- Responsibilities: Initialize Convex client, set up routing (`App.tsx`), and render the React tree.

**Convex Backend:**
- Location: `convex/schema.ts` and `convex/http.ts`
- Triggers: Client requests or external webhooks.
- Responsibilities: Data validation, storage, and cross-service coordination (e.g., AI).

## Error Handling

**Strategy:** Fail fast on backend, graceful feedback on frontend.

**Patterns:**
- **Validation**: Convex schema and `v` validator for argument checking.
- **UI Notifications**: `Toaster` component from `sonner` (`apps/web/src/components/ui/sonner.tsx`) displays success/error feedback.

## Cross-Cutting Concerns

**Logging:** Backend logs are handled via Convex's built-in logging; a `devLogs` table exists for capturing specific development/commit metadata (`convex/devLogs.ts`).
**AI Refinement:** External AI actions for content enhancement (`convex/ai.ts`).
**Offline Support:** Simple localStorage-based queue for buffering item creation while offline (`apps/web/src/sw/offline-queue.ts`).

---

*Architecture analysis: 2024-03-20*
