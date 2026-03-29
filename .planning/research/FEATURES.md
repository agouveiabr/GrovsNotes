# Feature Landscape: Task Management

**Domain:** Task Management / Note-taking
**Researched:** 2025-05-18

## Table Stakes

Features users expect in a modern productivity app. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Single-Input Quick Capture** | Minimizes cognitive load, allows capturing without context switching. | Low | Already partially implemented. |
| **Inline Hashtags** | Standard for organization, zero-friction categorization. | Low | Implemented. |
| **NLP Date Parsing** | Typing "tomorrow" is 10x faster than picking from a calendar. | Medium | Requires `chrono-node` integration. |
| **Keyboard Navigation** | `J`/`K` for movement, `Space` for completion, `/` for search. | Low | Standard in developer tools. |

## Differentiators

Features that set GrovsNotes apart, especially for developers.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Conventional Task Prefixes** | Allows developers to use familiar `feat:`, `fix:`, `chore:` syntax to automatically type tasks. | Low | Can map prefixes to existing `type` field. |
| **Real-time Chipping** | UI feedback that "shows" what the system parsed (e.g., turning "tomorrow" into a blue chip) to build trust. | Medium | Requires complex UI state synchronized with the parser. |
| **Command-First Palette** | One global shortcut (`Cmd+K`) to search, create, or perform actions (e.g., "Archive all done"). | Medium | Implement with `cmdk`. |
| **Project/Context Mapping** | Using `@context` and `^project` for high-speed multi-dimensional organization. | Low | Extending the existing hashtag parser. |

## Anti-Features

Features to explicitly NOT build to maintain speed and simplicity.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Complex Modal Forms** | Breaking flow to fill in 5 fields (due date, priority, project, etc.) kills speed. | Force everything through the single capture input. |
| **Drag-and-Drop ONLY** | Slow and mouse-dependent. | Provide keyboard shortcuts for moving items between projects or priorities. |
| **Mandatory Categorization** | Friction during capture leads to no capture. | Always allow capture into an "Inbox" without metadata. |

## Feature Dependencies

```
Hashtag Parser → Multi-Entity Parser (Tags, Projects, Priority) → NLP Date Parser → Real-time UI Chipping
```

## MVP Recommendation

Prioritize:
1. **Multi-Entity Parser:** Expand current `#tag` logic to handle `^project`, `!!priority`, and `feat:` type prefixes.
2. **NLP Date Parsing:** Integrate `chrono-node` to handle "tomorrow", "next fri", etc.
3. **Keyboard Focus:** Ensure the capture input is always focused on load and reachable via a global hotkey.

Defer: **Real-time UI Chipping**. While high-value, it can be added once the underlying parsing logic is robust. Start with standard text display and confirmation toast.

## Sources

- [Linear UX Review](https://www.growth.design/case-studies/linear-ux)
- [Things 3 Design Philosophy](https://culturedcode.com/things/blog/)
- [Raycast Design Best Practices](https://www.raycast.com/blog/design-at-raycast)
