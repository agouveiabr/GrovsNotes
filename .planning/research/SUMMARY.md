# Research Summary: GrovsNotes Advanced Capture & Navigation

## Executive Summary

GrovsNotes is a developer-focused task management and note-taking application designed for high-speed, keyboard-first interaction. Research into industry leaders like Linear, Todoist, and Raycast reveals that experts prioritize minimizing cognitive load through single-input capture, natural language processing (NLP), and robust command palettes. The core value proposition is "frictionless capture"—the ability to turn a thought into a structured task with metadata (tags, projects, priority, dates) in seconds without leaving the keyboard.

The recommended approach centers on a decoupled, token-based parsing engine that provides real-time visual feedback ("chipping") to the user. This builds trust by showing the system's understanding immediately. A keyboard-first navigation system using `cmdk` and global hotkeys ensures the app remains as fast as a CLI while maintaining the visual clarity of a modern web app. Key risks include "parsing latency" and "NLP over-recognition," which will be mitigated by performing preview parses on the client and providing "escape" mechanisms for users to revert auto-detected entities.

## Key Findings

### From STACK.md (Technologies)
- **Command Palette:** `cmdk` for an accessible, keyboard-first command bar.
- **NLP Date Parsing:** `chrono-node` for robust natural language date/time extraction.
- **Keyboard Shortcuts:** `hotkeys-js` for managing complex global key combinations.
- **UI/Visuals:** `framer-motion` for "chipping" animations and `lucide-react` for status icons.
- **Syntax:** Adopt `#tag`, `^project`, `!priority`, and `type:` (Conventional Commits style) prefixes.

### From FEATURES.md (Capabilities)
- **Table Stakes:** Single-input capture, inline hashtags, NLP dates, and J/K keyboard navigation.
- **Differentiators:** Conventional task prefixes (`feat:`, `fix:`), real-time UI chipping, and a command-first palette (`Cmd+K`).
- **Anti-Features:** Explicitly avoid complex modal forms, mouse-only drag-and-drop, and mandatory categorization.

### From ARCHITECTURE.md (Patterns)
- **Decoupled Parser:** A centralized `MultiEntityParser` shared between frontend (for UI feedback) and backend (for validation).
- **Token-based Processing:** Treat input as a stream of tokens to handle complex entities (multi-word dates) instead of simple regex.
- **Single-Key Navigation Hub:** Implement a global state for "Go To" navigation patterns (e.g., `G` then `I` for Inbox).
- **Client-Side Preview:** Always perform a "Preview Parse" on the client to avoid UI lag.

### From PITFALLS.md (Risks)
- **Parsing Latency:** Perform a final synchronous parse before submission to ensure no metadata is missed.
- **Over-Stripping:** Store the "Original Input" alongside the "Cleaned Title" to preserve user context and allow editing.
- **Discoverability:** Use a `?` hotkey for a cheat sheet and display shortcut hints in all UI elements.
- **False Positives:** Implement an "Escape" mechanism (e.g., Backspace on a chip) to revert auto-detected entities to plain text.

## Implications for Roadmap

### Suggested Phase Structure

1. **Phase 1: Advanced Parsing Engine (Foundation)**
   - **Rationale:** All high-speed features depend on a reliable parser. Building this first ensures consistency.
   - **Deliverables:** Centralized `MultiEntityParser` handling `#tags`, `^projects`, `!!priorities`, and `chrono-node` dates.
   - **Pitfall Mitigation:** Store original input to prevent data loss from incorrect stripping.

2. **Phase 2: Keyboard-First Navigation & Command Bar**
   - **Rationale:** Navigation speed is core to the "developer-first" promise.
   - **Deliverables:** `Cmd+K` palette using `cmdk`, global navigation hotkeys, and a shortcut cheat sheet (`?`).
   - **Pitfall Mitigation:** Display shortcut hints in menus to solve the "Hidden Shortcut" problem.

3. **Phase 3: Real-time UI Chipping & Feedback**
   - **Rationale:** High-value UX that builds trust by showing the system's understanding in real-time.
   - **Deliverables:** `CaptureInput` with real-time highlighting and "chipping" animations.
   - **Pitfall Mitigation:** Ensure chipping is high-performance and allows user "Escape" for false positives.

### Research Flags
- **Needs Research:** Phase 1 (Parsing) needs specific research on `chrono-node` edge cases and Phase 3 (Chipping) needs research on handling cursor position/selection within chipped inputs.
- **Standard Patterns:** Phase 2 (Navigation/Command Bar) follows well-documented patterns; standard implementation is sufficient.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based on industry standards (cmdk, chrono-node) used by top-tier tools. |
| Features | HIGH | Clear alignment between developer needs and established productivity patterns. |
| Architecture | MEDIUM | Token-based parsing is sound but needs careful implementation for performance. |
| Pitfalls | HIGH | Common failure points in NLP apps are well-documented and avoidable. |

### Gaps to Address
- **Timezone Management:** Ensuring consistent behavior between client-side `chrono-node` parsing and server-side storage.
- **Complex Recurrence:** Determining the scope for recurring tasks (e.g., "every 3rd Tuesday") which may exceed basic library capabilities.

## Sources

- [Todoist NLP Syntax](https://todoist.com/help/articles/introduction-to-natural-language-input)
- [Linear UX Review & Design Patterns](https://www.growth.design/case-studies/linear-ux)
- [cmdk Documentation](https://cmdk.paco.me/)
- [Chrono Node GitHub](https://github.com/wanasit/chrono)
- [Things 3 Design Philosophy](https://culturedcode.com/things/blog/)
- [Raycast Design Best Practices](https://www.raycast.com/blog/design-at-raycast)
