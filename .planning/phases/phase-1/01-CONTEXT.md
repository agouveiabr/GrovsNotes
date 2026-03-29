# Phase 1 Context: Advanced Parsing Engine

## Phase Goals
Implement a robust, client-and-server compatible parsing engine for task metadata, focusing on a specific structured capture pattern while maintaining "frictionless" speed.

## Core Implementation Decisions

### 1. Capture Pattern: `Type - Project - Title - Date`
The parser will prioritize this four-part structure for high-speed, structured entry:
- **Type**: Must match one of `idea`, `fix`, `log`, or `todo`. (Semantic mapping: `feat:`/`chore:` -> `todo`, `fix:` -> `fix`).
- **Project**: Matches existing project by name or a **4-letter alias**.
  - **Auto-creation**: If no match is found, create a new project.
  - **Auto-alias**: If a project doesn't have an alias, the first 4 letters of its name become its alias.
- **Title**: The core content of the item.
- **Date**: 
  - For `log` types: Automatically set to the current date if omitted.
  - For `todo`/`fix` types: If a date is provided, it becomes the `dueAt` date. If omitted, no `dueAt` is set.

### 2. Timezone & Data Integrity
- **Server-side with Offset**: The client sends its local `now` timestamp and timezone offset to Convex. The `MultiEntityParser` uses this context to accurately interpret relative dates (like "tomorrow") via `chrono-node`.
- **Dual-Field Storage**:
  - `originalInput`: Stores the raw user input (e.g., `todo - grov - Fix header - tomorrow`).
  - `title`: Stores the parsed "Clean Title" (e.g., `Fix header`).

### 3. Schema & Mapping
- **Semantic Mapping (Lean)**: 
  - `feat:`, `chore:`, `todo` -> `task` (in schema).
  - `fix:`, `fix` -> `bug` (in schema).
  - `log` -> `note` (in schema).
  - `idea` -> `idea` (in schema).
- **Project Aliases**: Add `alias: v.optional(v.string())` to the `projects` table in `schema.ts`.

## Technical Patterns to Reuse
- **Convex lib structure**: Put `MultiEntityParser` in `convex/lib/parser.ts`.
- **Project Lookup**: Reuse/Adapt the project finding logic from `convex/search.ts` (case-insensitive `includes` check) but prioritize the 4-letter alias.

## Success Criteria for Phase 1
- `MultiEntityParser` accurately splits the 4-part pattern.
- Projects are automatically created and assigned 4-letter aliases if missing.
- `log` items receive automated current dates.
- Items in the database preserve `originalInput` and store the `cleanTitle`.
