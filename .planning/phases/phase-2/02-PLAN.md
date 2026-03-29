---
phase: phase-2
plan: "02"
type: execute
wave: 2
depends_on: [01-PLAN.md]
files_modified: [apps/web/src/components/layout/app-shell.tsx, apps/web/src/hooks/use-list-navigation.ts, apps/web/src/components/inbox/inbox-list.tsx, apps/web/src/components/items/item-card.tsx, apps/web/src/components/today/today-section.tsx, apps/web/src/components/projects/project-items.tsx]
autonomous: true
requirements: [KBD-03, KBD-04]
user_setup: []

must_haves:
  truths:
    - "User can navigate between views using G-chords (e.g. G then I for Inbox)"
    - "User can move the focus in item lists (Inbox, Today, Projects) using J/K keys"
    - "Focused item in a list has a visual highlight"
    - "Pressing Enter on a focused item navigates to its details page"
  artifacts:
    - path: "apps/web/src/hooks/use-list-navigation.ts"
      provides: "List navigation logic"
    - path: "apps/web/src/components/items/item-card.tsx"
      provides: "Active state visual feedback"
  key_links:
    - from: "AppShell"
      to: "react-hotkeys-hook"
      via: "G-chord hotkey registration"
    - from: "InboxList"
      to: "useListNavigation"
      via: "hook usage"
---

<objective>
Enable mouse-free navigation through shortcut chords and list control.
Purpose: To speed up context switching and item interaction for power users.
Output: Working G-chord navigation and J/K list control in core views (Inbox, Today, Projects).
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
@apps/web/src/components/inbox/inbox-list.tsx
@apps/web/src/components/items/item-card.tsx
@apps/web/src/components/today/today-section.tsx
@apps/web/src/components/projects/project-items.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Global Shortcut Chords (G-chords)</name>
  <files>apps/web/src/components/layout/app-shell.tsx</files>
  <action>
    - In `app-shell.tsx`, implement G-chord navigation using `useHotkeys` with multi-key sequences.
    - Implement the following chords:
      - `g i` -> Inbox (`/inbox`)
      - `g t` -> Today (`/today`)
      - `g p` -> Projects (`/projects`)
      - `g b` -> Board (`/board`)
      - `g s` -> Search (`/search`)
      - `g c` -> Capture (`/`)
    - Ensure these global hotkeys are registered and work from any view.
  </action>
  <verify>
    <automated>grep -r "g i" apps/web/src/components/layout/app-shell.tsx</automated>
  </verify>
  <done>Global G-chord navigation implemented and functional</done>
</task>

<task type="auto">
  <name>Task 2: List Keyboard Navigation (J/K) for Inbox, Today, and Projects</name>
  <files>apps/web/src/hooks/use-list-navigation.ts, apps/web/src/components/inbox/inbox-list.tsx, apps/web/src/components/items/item-card.tsx, apps/web/src/components/today/today-section.tsx, apps/web/src/components/projects/project-items.tsx</files>
  <action>
    - Create `apps/web/src/hooks/use-list-navigation.ts` to manage active index in a list.
    - The hook should listen for `j` (next), `k` (prev), and `enter` (action).
    - Update `ItemCard.tsx` to accept an `active` prop and show a visual border/ring if true.
    - Integrate `useListNavigation` into:
      - `InboxList.tsx` for navigating the inbox items.
      - `ProjectItems.tsx` for navigating project-specific items.
      - `TodaySection.tsx` (or `TodayView.tsx`) to enable navigation across today's sections.
    - Ensure `enter` on an active item navigates to `/items/:id`.
    - For `TodaySection`, add a visual `active` state to its custom item list if it doesn't use `ItemCard`.
  </action>
  <verify>
    <automated>grep -r "active" apps/web/src/components/items/item-card.tsx && grep -r "useListNavigation" apps/web/src/components/today/today-section.tsx</automated>
  </verify>
  <done>J/K navigation implemented in InboxList, TodayView, and ProjectItems, with visual active state and Enter action (per KBD-03)</done>
</task>

</tasks>

<verification>
- Navigate to `/inbox`, `/today`, or a project page, press `j` or `k` to move focus.
- Press `Enter` on an item and verify it navigates to `/items/:id`.
- Press `g t` from any screen and verify it navigates to Today.
</verification>

<success_criteria>
- `g i`, `g t`, `g p`, `g b`, `g s`, `g c` all correctly navigate to their respective views.
- `j` moves selection down in the list in Inbox, Today, and Project views.
- `k` moves selection up in the list in Inbox, Today, and Project views.
- `enter` opens the selected item.
</success_criteria>

<output>
After completion, create `.planning/phases/phase-2/phase-2-02-SUMMARY.md`
</output>
