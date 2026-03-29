# Requirements: GrovsNotes Advanced Capture & Navigation

The primary goal of this phase is to deliver a high-speed, keyboard-first task management experience by implementing a centralized parsing engine and a real-time command bar interface.

**Core Value:** Frictionless capture—the ability to turn a thought into a structured task with metadata (tags, projects, priority, dates) in seconds without leaving the keyboard.

## Categories

- **PARSER**: Advanced multi-entity parsing engine for metadata extraction.
- **KBD**: Keyboard-first navigation and command palette.
- **UI**: Real-time feedback and visual chipping of recognized entities.

## V1 Requirements

### PARSER: Advanced Parsing Engine
- **PARSER-01**: Centralized `MultiEntityParser` to handle `#tags`, `^projects`, and `!!priority` from task titles.
- **PARSER-02**: Natural language date parsing using `chrono-node` for `dueAt` extraction (e.g., "tomorrow", "next tuesday").
- **PARSER-03**: Support for Conventional Task prefixes (`feat:`, `fix:`, `chore:`, `idea:`, `bug:`) to automatically set the item `type`.
- **PARSER-04**: Metadata stripping from the visible task title while preserving the `originalInput` for future editing.
- **PARSER-05**: Client-side "Preview Parse" to ensure immediate feedback without backend round-trips.

### KBD: Keyboard-First Navigation & Command Bar
- **KBD-01**: Global `Cmd+K` (or `Ctrl+K`) command palette implementation using `cmdk`.
- **KBD-02**: Command palette actions for common workflows: "Create Task", "Go to Inbox", "Go to Today", and "Search".
- **KBD-03**: J/K keyboard navigation for list views (Inbox, Today, Project Details).
- **KBD-04**: Global single-key navigation shortcuts (e.g., `G` then `I` for Inbox, `G` then `T` for Today).
- **KBD-05**: Keyboard shortcut cheat sheet overlay triggered by `?` hotkey.
- **KBD-06**: Display shortcut hints (e.g., `⌘K`) in menus and on interactive UI elements.

### UI: Real-time UI Chipping & Feedback
- **UI-01**: Real-time syntax highlighting in the `CaptureInput` to distinguish plain text from metadata tokens.
- **UI-02**: Visual "chipping" (converting text to visual tags) of recognized entities upon entry or submission.
- **UI-03**: Animated transitions for chipping and feedback using `framer-motion`.
- **UI-04**: "Escape" mechanism for auto-detected entities (e.g., backspacing on a chip reverts it to plain text).
- **UI-05**: Inline "Preview Chip" display beneath the capture bar showing the final interpreted task metadata.

## V2 / Deferred Scope
- **RECURRENCE**: Support for complex recurring tasks (e.g., "every 3rd Tuesday").
- **SYNC**: Advanced conflict resolution for offline edits of metadata.
- **CUSTOM_CMDS**: User-defined custom commands in the `Cmd+K` palette.

## Traceability (Mapping to Phases)

| Requirement | Phase | Status |
|-------------|-------|--------|
| PARSER-01 | Phase 1 | Pending |
| PARSER-02 | Phase 1 | Pending |
| PARSER-03 | Phase 1 | Pending |
| PARSER-04 | Phase 1 | Pending |
| PARSER-05 | Phase 1 | Pending |
| KBD-01 | Phase 2 | Pending |
| KBD-02 | Phase 2 | Pending |
| KBD-03 | Phase 2 | Pending |
| KBD-04 | Phase 2 | Pending |
| KBD-05 | Phase 2 | Pending |
| KBD-06 | Phase 2 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 3 | Pending |
| UI-05 | Phase 3 | Pending |
