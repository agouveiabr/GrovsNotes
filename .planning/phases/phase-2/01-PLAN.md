---
phase: phase-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [apps/web/package.json, apps/web/src/components/layout/command-menu.tsx, apps/web/src/components/layout/app-shell.tsx]
autonomous: true
requirements: [KBD-01, KBD-02]
user_setup: []

must_haves:
  truths:
    - "User can open the Command Palette with Cmd+K (or Ctrl+K) from any screen"
    - "User can navigate to Inbox, Today, and Search from the Command Palette"
  artifacts:
    - path: "apps/web/src/components/layout/command-menu.tsx"
      provides: "Global command palette"
    - path: "apps/web/src/components/layout/app-shell.tsx"
      provides: "Global hotkey registration"
  key_links:
    - from: "apps/web/src/components/layout/app-shell.tsx"
      to: "apps/web/src/components/layout/command-menu.tsx"
      via: "React component inclusion"
    - from: "CommandMenu"
      to: "react-router-dom"
      via: "useNavigate"
---

<objective>
Implement the foundational Command Palette infrastructure for GrovsNotes.
Purpose: To centralize navigation and discovery into a single keyboard-accessible hub.
Output: A working cmdk-based command menu that opens with Cmd+K and provides core navigation actions.
</objective>

<execution_context>
@$HOME/.gemini/get-shit-done/workflows/execute-plan.md
@$HOME/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@apps/web/package.json
@apps/web/src/components/layout/app-shell.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add dependencies & Implement foundational CommandMenu</name>
  <files>apps/web/package.json, apps/web/src/components/layout/command-menu.tsx</files>
  <action>
    - Add `cmdk` and `react-hotkeys-hook` to `apps/web/package.json`.
    - Create `apps/web/src/components/layout/command-menu.tsx` using `cmdk`.
    - Implement the modal layout with a search input and groups for "Navigation" and "Actions".
    - Use `lucide-react` icons for each action (Inbox, Today, Search, Board).
    - Ensure it is styled to match the GrovsNotes theme (Zinc).
  </action>
  <verify>
    <automated>cd apps/web && pnpm install && grep -E "cmdk|react-hotkeys-hook" package.json</automated>
  </verify>
  <done>Dependencies installed, CommandMenu component created with basic structure</done>
</task>

<task type="auto">
  <name>Task 2: Wire Cmd+K and Navigation Actions</name>
  <files>apps/web/src/components/layout/app-shell.tsx, apps/web/src/components/layout/command-menu.tsx</files>
  <action>
    - In `app-shell.tsx`, use `useHotkeys` from `react-hotkeys-hook` to toggle the command menu on `mod+k`.
    - In `command-menu.tsx`, implement navigation using `useNavigate` from `react-router-dom`.
    - Add the following navigation actions:
      - "Go to Board" -> `/board`
      - "Go to Today" -> `/today`
      - "Go to Inbox" -> `/inbox`
      - "Go to Projects" -> `/projects`
      - "Search" -> `/search`
    - Ensure the menu closes after an action is selected.
  </action>
  <verify>
    <automated>grep -r "useHotkeys" apps/web/src/components/layout/app-shell.tsx</automated>
  </verify>
  <done>Cmd+K opens the menu, and selecting an item navigates to the correct route and closes the menu</done>
</task>

</tasks>

<verification>
- Check if `Cmd+K` opens the dialog.
- Verify navigating to "Inbox" changes the URL to `/inbox` and closes the dialog.
- Verify navigating to "Search" changes the URL to `/search` and closes the dialog.
</verification>

<success_criteria>
- Command palette opens with `Cmd+K`.
- Menu provides at least 4 core navigation actions.
- Selecting an action updates the URL and closes the menu.
</success_criteria>

<output>
After completion, create `.planning/phases/phase-2/phase-2-01-SUMMARY.md`
</output>
