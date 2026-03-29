# Codebase Concerns

**Analysis Date:** 2024-03-04

## Tech Debt

**Missing Automated Testing:**
- Issue: There are currently no unit, integration, or E2E tests in the entire codebase. This makes refactoring extremely risky and regressions likely.
- Files: Entire codebase (no `*.test.ts`, `*.spec.ts`, or test runners detected).
- Impact: Decreased confidence in code quality and increased difficulty in adding new features safely.
- Fix approach: Introduce a test runner (Vitest for React/Shared, Convex's testing library for backend) and start with unit tests for business logic in `convex/lib/` and shared packages.

**Lack of Multi-user Isolation:**
- Issue: The schema and backend functions do not incorporate `userId` for data isolation. The app is functionally single-user at the database level.
- Files: `convex/schema.ts`, `convex/items.ts`, `convex/projects.ts`
- Impact: Impossible to scale to multiple users without a major schema migration and logic overhaul.
- Fix approach: Implement authentication (e.g., Clerk with Convex) and add `userId` to all relevant tables and indexes. Update all queries to filter by `userId`.

**Weak Backend Type Safety:**
- Issue: Extensive use of the `any` type in Convex helper functions and queries bypasses TypeScript's benefits.
- Files: `convex/items.ts`, `convex/projects.ts`, `convex/search.ts`
- Impact: Increased risk of runtime errors in backend logic that should be caught at compile time.
- Fix approach: Replace `any` with generated types from `_generated/dataModel.d.ts` and `_generated/server.d.ts`.

**Brute-force Tag Updates:**
- Issue: Updating a note's title deletes and re-inserts all associated `itemTags` regardless of whether they changed.
- Files: `convex/items.ts`
- Impact: Unnecessary database writes and potential issues with tag consistency or history.
- Fix approach: Implement a diff-based tag update mechanism that only adds new tags and removes deleted ones.

## Performance Bottlenecks

**In-memory Filtering:**
- Problem: Several queries fetch a batch using a primary index and then perform secondary filtering in-memory.
- Files: `convex/items.ts`, `convex/search.ts`
- Cause: Lack of compound indexes for all filter combinations.
- Improvement path: Add compound indexes for common filter combinations (e.g., `[status, type]`, `[projectId, status]`) and use them in queries.

**Sequential Database Operations:**
- Problem: Functions like `upsertTags` process database operations sequentially in a `for...of` loop.
- Files: `convex/items.ts`
- Cause: Use of `await` inside loops for database writes.
- Improvement path: Use `Promise.all` for independent database operations when possible, although Convex recommends sequential writes in some transactional contexts.

**Lack of Pagination:**
- Problem: Most list queries use a fixed `.take(N)` limit (50, 100, or 200) without support for fetching subsequent pages.
- Files: `convex/items.ts`, `convex/projects.ts`
- Cause: Basic query implementation without pagination logic.
- Improvement path: Implement cursor-based pagination using Convex's built-in pagination support.

## Security Considerations

**Hardcoded/Hallucinated AI Model:**
- Risk: The code references `gemini-2.5-flash-lite`, which does not exist as of current Gemini releases (possibly intended 1.5 or 2.0).
- Files: `convex/ai.ts`
- Current mitigation: None. It will likely fail at runtime if the API doesn't recognize the model name.
- Recommendations: Update to a stable model name like `gemini-1.5-flash` or use an environment variable for the model identifier.

**Missing CSP in Desktop App:**
- Risk: `csp` is set to `null` in the Tauri configuration.
- Files: `apps/desktop/src-tauri/tauri.conf.json`
- Current mitigation: None.
- Recommendations: Define a strict Content Security Policy to prevent XSS and unauthorized resource loading in the desktop application.

**API Key for Dev Logs:**
- Risk: The `/dev-logs` endpoint uses a simple header-based API key. If leaked, unauthorized logs can be injected.
- Files: `convex/http.ts`
- Current mitigation: `x-api-key` header check against `process.env.API_KEY`.
- Recommendations: Ensure the API key is rotated regularly and consider more robust authentication for internal tools if they become public-facing.

## Fragile Areas

**Offline Queue Storage:**
- Files: `apps/web/src/sw/offline-queue.ts`
- Why fragile: Uses `localStorage` which has limited storage capacity (~5MB) and is synchronous. Large queues or binary data could crash the storage or slow down the main thread.
- Safe modification: Transition to `IndexedDB` (using a library like `idb-keyval` or `Dexie`) for more robust offline storage.
- Test coverage: Zero.

**AI Response Parsing:**
- Files: `convex/ai.ts`
- Why fragile: Uses a regular expression to extract JSON from what might be Markdown-wrapped AI responses. If the AI doesn't follow the format exactly, parsing will fail.
- Safe modification: Use the `responseMimeType: "application/json"` setting (already present) but implement more robust error handling and fallback parsing.
- Test coverage: Zero.

**Search Query Parser:**
- Files: `convex/lib/search_parser.ts`
- Why fragile: Does not handle quoted strings or escaped characters in filters (e.g., `project:"Project Alpha"` will fail).
- Safe modification: Replace the simple regex with a more robust parser or a library for query parsing.
- Test coverage: Zero.

## Dependencies at Risk

**Obsidian Brain API Integration:**
- Risk: Hardcoded dependency on `https://obsidian-brain-api.vercel.app`. If this service is down or its schema changes, the Obsidian integration breaks.
- Impact: Users cannot sync notes to Obsidian.
- Migration plan: Consider making the integration URL configurable or bringing the logic into the main backend if possible.

---

*Concerns audit: 2024-03-04*
