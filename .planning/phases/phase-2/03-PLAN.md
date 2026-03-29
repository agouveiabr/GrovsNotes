---
phase: phase-2
plan: 03
type: execute
wave: 3
depends_on: [02-PLAN.md]
files_modified: [apps/web/src/components/layout/shortcut-cheat-sheet.tsx, apps/web/src/components/layout/app-shell.tsx, apps/web/src/components/capture/capture-input.tsx, apps/web/src/components/layout/bottom-nav.tsx]
autonomous: true
requirements: [KBD-05, KBD-06]
user_setup: []

must_haves:
  truths:
    - "User can open a Shortcut Cheat Sheet with the ? key"
    - "UI elements display keyboard hints (e.g. Cmd+K next to search or G+I near inbox)"
  artifacts:
    - path: "apps/web/src/components/layout/shortcut-cheat-sheet.tsx"
      provides: "Helpful overlay"
  key_links:
    - from: "AppShell"
      to: "ShortcutCheatSheet"
      via: "React component inclusion"
---

<objective>
Provide discoverability and guidance for keyboard-first navigation.
Purpose: To bridge the gap for new users to become power users by making shortcuts visible.
Output: Working shortcut cheat sheet and persistent UI hints.
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
@apps/web/src/components/layout/app-shell.tsx
@apps/web/src/components/capture/capture-input.tsx
@apps/web/src/components/layout/bottom-nav.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Shortcut Cheat Sheet Overlay</name>
  <files>apps/web/src/components/layout/shortcut-cheat-sheet.tsx, apps/web/src/components/layout/app-shell.tsx</files>
  <action>
    - Create `apps/web/src/components/layout/shortcut-cheat-sheet.tsx` as a dialog or popover overlay.
    - Organize shortcuts by category: "Navigation", "Lists", "Global".
    - In `app-shell.tsx`, register a global `?` hotkey to toggle the cheat sheet.
    - Ensure it is accessible and styled consistently with the application.
  </action>
  <verify>
    <automated>grep -r "?" apps/web/src/components/layout/app-shell.tsx</automated>
  </verify>
  <done>Shortcut cheat sheet implemented and toggled by ? key</done>
</task>

<task type="auto">
  <name>Task 2: UI Shortcut Hints</name>
  <files>apps/web/src/components/capture/capture-input.tsx, apps/web/src/components/layout/bottom-nav.tsx</files>
  <action>
    - Add subtle keyboard hints to primary UI elements.
    - In `capture-input.tsx`, add `(⌘K)` or similar to the search/capture area.
    - In `bottom-nav.tsx`, add hints like `(G+I)` next to the Inbox icon, `(G+T)` next to Today, etc.
    - Ensure hints are non-intrusive and visually distinct (e.g., smaller, muted text).
  </action>
  <verify>
    <automated>grep -r "G+I" apps/web/src/components/layout/bottom-nav.tsx</automated>
  </verify>
  <done>Visual shortcut hints added to UI elements</done>
</task>

</tasks>

<verification>
- Press `?` and verify the cheat sheet overlay appears.
- Verify `(G I)` is visible in the bottom navigation for Inbox.
- Verify a hint for the Command Palette is visible in the capture input or header.
</verification>

<success_criteria>
- All documented shortcuts are listed in the cheat sheet.
- At least 3 primary navigation shortcuts have visual hints in the UI.
</success_criteria>

<output>
After completion, create `.planning/phases/phase-2/phase-2-03-SUMMARY.md`
</output>
