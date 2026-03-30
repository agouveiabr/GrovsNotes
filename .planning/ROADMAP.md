# Project Roadmap: GrovsNotes Advanced Capture & Navigation

The goal of this project is to implement a high-speed, keyboard-first task management system by focusing on three key delivery boundaries: robust metadata parsing, universal command palette navigation, and real-time visual feedback for captured items.

## Phases

- [x] **Phase 1: Advanced Parsing Engine (Foundation)** - Implement the core multi-entity parser for tags, projects, and dates.
- [x] **Phase 2: Keyboard-First Navigation & Command Bar** - Enable mouse-free navigation through `cmdk` and global hotkeys.
- [ ] **Phase 3: Real-time UI Chipping & Feedback** - Provide immediate visual confirmation and "chipping" of metadata in the capture input.

## Phase Details

### Phase 1: Advanced Parsing Engine (Foundation)
**Goal**: Build a reliable extraction engine to handle the `Type - Project - Title - Date` structure.
**Depends on**: Existing GrovsNotes core.
**Requirements**: PARSER-01, PARSER-02, PARSER-03, PARSER-04, PARSER-05.
**Success Criteria** (what must be TRUE):
  1. The parser accurately splits the `Type - Project - Title - Date` structure.
  2. Projects are auto-matched by name or 4-letter alias, and auto-created if missing.
  3. `log` items automatically get the current date if no date is provided.
  4. Titles are stored as "clean" while the original raw input is preserved as `originalInput`.

Plans:
- [x] phase-1-01-PLAN.md — MultiEntityParser & Schema Update
- [x] phase-1-02-PLAN.md — Mutation Integration & Preview UI

### Phase 2: Keyboard-First Navigation & Command Bar
**Goal**: Enable high-speed, mouse-free navigation and task discovery.
**Depends on**: Phase 1.
**Requirements**: KBD-01, KBD-02, KBD-03, KBD-04, KBD-05, KBD-06.
**Success Criteria** (what must be TRUE):
  1. A `cmdk` command palette opens with `Cmd+K` and provides common actions.
  2. Users can navigate between Inbox, Today, and Projects using `G` shortcut chords (e.g., `G` -> `I`).
  3. All list views support `J/K` keyboard navigation with visual focus states.
  4. Shortcut hints are visible in the UI to facilitate learning.

Plans:
- [x] phase-2-01-PLAN.md — Core Command Bar foundation
- [x] phase-2-02-PLAN.md — Shortcut Chords & Navigation
- [x] phase-2-03-PLAN.md — Cheat Sheet & UI hints

### Phase 3: Real-time UI Chipping & Feedback
**Goal**: Provide immediate visual confirmation and trust for the parsing engine.
**Depends on**: Phase 1, Phase 2.
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05.
**Success Criteria** (what must be TRUE):
  1. The capture input provides real-time syntax highlighting for tokens.
  2. Detected entities (e.g., `#work`) are visually transformed into "chips" with `framer-motion` animations.
  3. Users can undo/revert a chip back to text by backspacing into it.
  4. An inline preview displays the interpreted metadata beneath the input.

Plans:
- [ ] phase-3-01-PLAN.md — Lexical Foundation & Type Chipping
- [ ] phase-3-02-PLAN.md — Advanced Chipping & Escape Mechanism
- [ ] phase-3-03-PLAN.md — Animations & Metadata Preview

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Advanced Parsing Engine | 2/2 | Completed | 2025-03-29 |
| 2. Keyboard-First Navigation & Command Bar | 3/3 | Completed | 2025-03-29 |
| 3. Real-time UI Chipping & Feedback | 0/3 | Not started | - |
