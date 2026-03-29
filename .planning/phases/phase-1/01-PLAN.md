---
phase: 01-advanced-parsing-engine
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [package.json, convex/schema.ts, convex/lib/parser.ts]
autonomous: true
requirements: [PARSER-01, PARSER-02, PARSER-03, PARSER-04]

must_haves:
  truths:
    - "MultiEntityParser correctly splits the 4-part structure: Type - Project - Title - Date (per PARSER-01)"
    - "chrono-node translates natural language dates into valid Unix timestamps using client timezone offset (per PARSER-02)"
    - "'log' types automatically receive the current date if omitted (per PARSER-03)"
    - "Semantic mapping correctly translates feat/chore to 'task' and fix to 'bug' (per 01-CONTEXT.md)"
  artifacts:
    - path: "convex/lib/parser.ts"
      provides: "Centralized parsing logic for the 4-part structure"
    - path: "convex/schema.ts"
      contains: "originalInput and project alias field"
  key_links:
    - from: "convex/lib/parser.ts"
      to: "chrono-node"
      via: "import"
---

<objective>
Implement the core MultiEntityParser using the new 4-part structure (Type - Project - Title - Date) and update the database schema to support project aliases and original input persistence.

Purpose: Enable high-speed, structured capture with automatic project matching and date extraction.
Output: A robust shared parser utility and updated database schema.
</objective>

<execution_context>
@$HOME/.gemini/get-shit-done/workflows/execute-plan.md
@$HOME/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/phase-1/01-CONTEXT.md
@convex/schema.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update Schema and Dependencies</name>
  <files>package.json, convex/schema.ts</files>
  <action>
    - Add "chrono-node": "^2.7.7" to root package.json.
    - Add "tsx": "^4.7.1" and "vitest": "^3.0.0" to root devDependencies.
    - Update convex/schema.ts:
      - items table: Add `originalInput: v.string()` (PARSER-04).
      - projects table: Add `alias: v.optional(v.string())` (PARSER-01).
      - items table: Ensure 'type' field includes mapped literals ('task', 'bug', 'note', 'idea').
  </action>
  <verify>
    <automated>pnpm install && npx convex dev --once</automated>
  </verify>
  <done>Schema updated with alias and originalInput fields; dependencies installed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement MultiEntityParser (4-Part Pattern)</name>
  <files>convex/lib/parser.ts</files>
  <behavior>
    - Pattern: "Type - Project - Title - Date" (split by " - ").
    - Input: "todo - grov - Fix header - tomorrow" (now: T0, offset: 0)
    - Output: { type: "task", project: "grov", cleanTitle: "Fix header", dueAt: T0 + 24h }
    - Input: "log - work - Meeting notes" (now: T0)
    - Output: { type: "note", project: "work", cleanTitle: "Meeting notes", dueAt: T0 } (auto-date for log)
    - Input: "fix - app - Broken link - friday"
    - Output: { type: "bug", project: "app", cleanTitle: "Broken link", dueAt: [friday timestamp] }
    - Mapping: todo/feat/chore -> task, fix -> bug, log -> note, idea -> idea.
  </behavior>
  <action>
    - Create `parseItem(input: string, context: { now: number, timezoneOffset: number })`.
    - Split input by ` - ` and handle missing parts gracefully.
    - Use `chrono.parseDate` with context to interpret relative dates.
    - Implement the "log auto-date" rule: if type is 'log' and date part is empty, use `context.now`.
    - Strip whitespace from all parsed parts.
  </action>
  <verify>
    <automated>npx tsx -e "import { parseItem } from './convex/lib/parser.ts'; console.log(parseItem('todo - grov - Fix - tomorrow', { now: Date.now(), timezoneOffset: 0 }))"</automated>
  </verify>
  <done>MultiEntityParser correctly handles the 4-part structure, semantic mapping, and auto-dating for logs.</done>
</task>

</tasks>

<verification>
Verify that the parser correctly extracts all four components from a variety of inputs, handles the semantic mapping of types, and accurately parses relative dates using the provided context.
</verification>

<success_criteria>
- Schema supports project aliases and stores original user input.
- MultiEntityParser splits the "Type - Project - Title - Date" pattern.
- 'log' items default to today's date if omitted.
- 'feat'/'chore' map to 'task', 'fix' maps to 'bug'.
</success_criteria>

<output>
After completion, create .planning/phases/phase-1/phase-1-01-SUMMARY.md
</output>
