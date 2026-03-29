---
phase: 01-advanced-parsing-engine
plan: 02
type: execute
wave: 2
depends_on: [01-advanced-parsing-engine-01]
files_modified: [convex/items.ts, apps/web/src/components/capture/capture-input.tsx]
autonomous: true
requirements: [PARSER-01, PARSER-02, PARSER-03, PARSER-04, PARSER-05]

must_haves:
  truths:
    - "Convex items:create mutation persists originalInput and extracted metadata"
    - "Capture input shows a real-time preview of parsed tokens below the text"
    - "Project lookup in mutation handles ^project name correctly"
  artifacts:
    - path: "apps/web/src/components/capture/capture-input.tsx"
      provides: "Real-time parsing feedback UI"
  key_links:
    - from: "convex/items.ts"
      to: "convex/lib/parser.ts"
      via: "import and call parseItem"
    - from: "apps/web/src/components/capture/capture-input.tsx"
      to: "convex/lib/parser.ts"
      via: "import for client-side preview"
---

<objective>
Integrate the MultiEntityParser into the persistence layer (Convex mutations) and provide immediate user feedback via a preview UI in the capture input.

Purpose: Complete the capture loop by ensuring interpreted metadata is persisted and displayed.
Output: Integrated mutations and a functional capture preview.
</objective>

<execution_context>
@$HOME/.gemini/get-shit-done/workflows/execute-plan.md
@$HOME/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/phase-1/01-01-SUMMARY.md
@convex/items.ts
@apps/web/src/components/capture/capture-input.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update Convex Mutations with Parser</name>
  <files>convex/items.ts</files>
  <action>
    - Update the createItem mutation:
      - Accept args.title and use parseItem(args.title) to extract metadata.
      - Save the original title as "originalInput".
      - Use the parsed "cleanTitle" as the "title" field.
      - Map parsed tags, priority, type, and dueAt to the item's fields.
      - Implement project lookup: Search for a project by name matching the parsed "project". If found, assign its ID.
    - Update updateItem similarly for when the title is changed.
  </action>
  <verify>
    <automated>npx convex run items:create '{"title": "feat: ^grovsnotes Fix bug #ui !!1 tomorrow"}'</automated>
  </verify>
  <done>Convex mutations correctly use the parser to populate structured fields from raw input strings.</done>
</task>

<task type="auto">
  <name>Task 2: Add Real-time Metadata Preview</name>
  <files>apps/web/src/components/capture/capture-input.tsx</files>
  <action>
    - Integrate the MultiEntityParser into the CaptureInput's onChange handler.
    - Render a preview section beneath the textarea.
    - Show detected metadata visually (e.g., using small badges or text indicators for tags, project, priority, and date).
    - Ensure the preview updates instantly as the user types (PARSER-05).
  </action>
  <verify>
    <automated>pnpm --filter @grovsnotes/web build</automated>
  </verify>
  <done>Capture input provides immediate visual confirmation of how the parser interprets user input.</done>
</task>

</tasks>

<verification>
Verify that creating an item via the UI correctly reflects all parsed metadata in the resulting item record and that the preview accurately displays what will be captured.
</verification>

<success_criteria>
- New items in the database have correct priority, tags, project, and dueAt.
- originalInput is stored in the database.
- UI preview displays recognized tokens correctly.
</success_criteria>

<output>
After completion, create .planning/phases/phase-1/phase-1-02-SUMMARY.md
</output>
