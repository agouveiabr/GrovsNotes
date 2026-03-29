---
phase: 01-advanced-parsing-engine
plan: 02
type: execute
wave: 2
depends_on: [01-advanced-parsing-engine-01]
files_modified: [convex/items.ts, convex/projects.ts, apps/web/src/components/capture/capture-input.tsx]
autonomous: true
requirements: [PARSER-01, PARSER-04, PARSER-05]

must_haves:
  truths:
    - "Convex item creation handles auto-project lookup and creation using 4-letter alias (per PARSER-01)"
    - "New projects without an alias automatically receive a 4-letter alias from their name (per 01-CONTEXT.md)"
    - "CaptureInput provides immediate feedback for the 4-part structure (per PARSER-05)"
  artifacts:
    - path: "convex/projects.ts"
      provides: "Project lookup and auto-alias logic"
    - path: "apps/web/src/components/capture/capture-input.tsx"
      provides: "Structured 4-part preview UI"
  key_links:
    - from: "convex/items.ts"
      to: "convex/lib/parser.ts"
      via: "import and use parser with client context"
---

<objective>
Integrate the 4-part parser into Convex mutations with auto-project matching logic and update the UI to provide real-time feedback with client-side timezone context.

Purpose: Complete the capture loop with automated project organization and immediate feedback.
Output: Intelligent item creation and a structured capture preview.
</objective>

<execution_context>
@$HOME/.gemini/get-shit-done/workflows/execute-plan.md
@$HOME/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/phase-1/01-CONTEXT.md
@.planning/phases/phase-1/phase-1-01-SUMMARY.md
@convex/items.ts
@apps/web/src/components/capture/capture-input.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Mutation Integration with Project Auto-Matching</name>
  <files>convex/items.ts, convex/projects.ts</files>
  <action>
    - Update `createItem` to accept `title`, `now`, and `timezoneOffset`.
    - Call `parseItem(title, { now, timezoneOffset })` to get metadata.
    - Implement project matching logic in convex/projects.ts:
      1. Search for a project where `name` matches or `alias` matches the parsed project.
      2. If found: If project has no alias, update it with `name.slice(0, 4).toLowerCase()`.
      3. If not found: Create a new project with the parsed name and set its alias to `name.slice(0, 4).toLowerCase()`.
    - Persist the item with its `cleanTitle`, `originalInput`, mapped `type`, and looked-up `projectId`.
  </action>
  <verify>
    <automated>npx convex run items:create '{"title": "todo - grov - New Task - tomorrow", "now": Date.now(), "timezoneOffset": 0}'</automated>
  </verify>
  <done>Items created with correct project association and originalInput; projects auto-created/auto-aliased as needed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: UI Preview with Client Context</name>
  <files>apps/web/src/components/capture/capture-input.tsx</files>
  <action>
    - Update `CaptureInput` to use `MultiEntityParser` for real-time preview (PARSER-05).
    - Pass current timestamp (`Date.now()`) and local timezone offset (`new Date().getTimezoneOffset()`) to the parser.
    - Update the preview UI to clearly show the 4 interpreted parts (Type, Project, Title, Date).
    - Ensure submitting the input sends the raw title along with current time/offset to the backend.
  </action>
  <verify>
    <automated>npx vitest run apps/web/src/components/capture/capture-input.test.tsx</automated>
  </verify>
  <done>CaptureInput provides real-time, structured feedback for the 4-part pattern and passes context to Convex.</done>
</task>

</tasks>

<verification>
Verify that typing 'log - grov - My work' in the UI shows a preview for 'note' in 'grov' project with today's date, and that submitting it creates the correctly structured item in Convex.
</verification>

<success_criteria>
- Projects are automatically looked up by 4-letter alias.
- Missing projects are auto-created with 4-letter aliases.
- CaptureInput correctly passes timezone context for date parsing.
- Preview displays the 4 parts clearly.
</success_criteria>

<output>
After completion, create .planning/phases/phase-1/phase-1-02-SUMMARY.md
</output>
