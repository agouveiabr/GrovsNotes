# Project Roadmap: GrovsNotes Advanced Capture & Navigation

The goal of this project is to implement a high-speed, keyboard-first task management system by focusing on three key delivery boundaries: robust metadata parsing, universal command palette navigation, and real-time visual feedback for captured items.

## Phases

- [ ] **Phase 1: Advanced Parsing Engine (Foundation)** - Implement the core multi-entity parser for tags, projects, and dates.
- [ ] **Phase 2: Keyboard-First Navigation & Command Bar** - Enable mouse-free navigation through `cmdk` and global hotkeys.
- [ ] **Phase 3: Real-time UI Chipping & Feedback** - Provide immediate visual confirmation and "chipping" of metadata in the capture input.

## Phase Details

### Phase 1: Advanced Parsing Engine (Foundation)
**Goal**: Build a reliable extraction engine to handle natural language task metadata.
**Depends on**: Existing GrovsNotes core.
**Requirements**: PARSER-01, PARSER-02, PARSER-03, PARSER-04, PARSER-05.
**Success Criteria** (what must be TRUE):
  1. The parser accurately extracts `#tags`, `^projects`, and `!!priorities` from input text.
  2. `chrono-node` correctly translates relative dates (e.g., "friday") to the correct Unix timestamp.
  3. Task types (`feat:`, `fix:`) are auto-detected via prefixes.
  4. Titles are stored as "clean" (without tokens) while the full original input is preserved in the database.
**Plans**: TBD

### Phase 2: Keyboard-First Navigation & Command Bar
**Goal**: Enable high-speed, mouse-free navigation and task discovery.
**Depends on**: Phase 1.
**Requirements**: KBD-01, KBD-02, KBD-03, KBD-04, KBD-05, KBD-06.
**Success Criteria** (what must be TRUE):
  1. A `cmdk` command palette opens with `Cmd+K` and provides common actions.
  2. Users can navigate between Inbox, Today, and Projects using `G` shortcut chords (e.g., `G` -> `I`).
  3. All list views support `J/K` keyboard navigation with visual focus states.
  4. Shortcut hints are visible in the UI to facilitate learning.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Real-time UI Chipping & Feedback
**Goal**: Provide immediate visual confirmation and trust for the parsing engine.
**Depends on**: Phase 1, Phase 2.
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05.
**Success Criteria** (what must be TRUE):
  1. The capture input provides real-time syntax highlighting for tokens.
  2. Detected entities (e.g., `#work`) are visually transformed into "chips" with `framer-motion` animations.
  3. Users can undo/revert a chip back to text by backspacing into it.
  4. An inline preview displays the interpreted metadata beneath the input.
**Plans**: TBD
**UI hint**: yes

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Advanced Parsing Engine | 0/0 | Not started | - |
| 2. Keyboard-First Navigation & Command Bar | 0/0 | Not started | - |
| 3. Real-time UI Chipping & Feedback | 0/0 | Not started | - |
