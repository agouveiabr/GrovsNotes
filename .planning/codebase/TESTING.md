# Testing Patterns

**Analysis Date:** 2025-03-29

## Test Framework

**Runner:**
- Not detected. No testing framework (Vitest, Jest, etc.) is currently configured in the project.

**Assertion Library:**
- Not detected.

**Run Commands:**
```bash
pnpm test              # Command exists in root package.json but triggers no tests
```

## Test File Organization

**Location:**
- No test files currently exist in the repository.

**Naming:**
- Recommended: `*.test.ts` or `*.test.tsx` for unit/integration tests.

## Test Structure

**Suite Organization:**
Not applicable as no tests exist.

**Patterns:**
- Recommended: Arrange-Act-Assert (AAA) pattern.

## Mocking

**Framework:** Not detected.

**Recommended Patterns:**
- Mocking Convex hooks (`useQuery`, `useMutation`) for component testing.
- Using `vitest`'s `vi.mock()` for external libraries like `@dnd-kit/core`.

## Fixtures and Factories

**Test Data:**
Not detected.

**Location:**
Recommended: `tests/fixtures/` or `src/utils/test-data.ts`.

## Coverage

**Requirements:** None enforced.

**View Coverage:**
Not configured.

## Test Types

**Unit Tests:**
- Recommended for `packages/shared/src/utils.ts` and complex logic in Convex functions (`convex/lib/hashtags.ts`).

**Integration Tests:**
- Recommended for React components using `React Testing Library`.

**E2E Tests:**
- Not used.

## Common Patterns

**Current Gap:**
- The codebase lacks automated testing. All quality assurance currently relies on manual testing and TypeScript compiler checks.

**Immediate Recommendations:**
1.  **Vitest:** Configure Vitest for unit testing shared logic and Convex-related helpers.
2.  **React Testing Library:** Set up tests for core UI components like `BoardView` and `KanbanCard`.
3.  **Convex Testing:** Use `convex-test` or manual mocking for backend functions in `convex/`.

---

*Testing analysis: 2025-03-29*
