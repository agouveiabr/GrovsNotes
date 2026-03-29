# Technology Stack for Task Management

**Project:** GrovsNotes
**Researched:** 2025-05-18

## Recommended Stack

### Command Palette & Navigation
| Technology | Purpose | Why |
|------------|---------|-----|
| `cmdk` | Command Bar / Palette | The industry standard for React-based command palettes (used by Raycast, Linear). Accessible, keyboard-first, and highly customizable. |
| `hotkeys-js` | Global Keyboard Shortcuts | Reliable and lightweight library for capturing complex key combinations across the whole app. |

### Natural Language Processing (NLP)
| Technology | Purpose | Why |
|------------|---------|-----|
| `chrono-node` | Date/Time Parsing | The most robust JS/TS library for natural language date/time parsing (e.g., "next Friday at 2pm"). Handles relative dates and complex patterns. |
| `zod` | Validation & Typing | Ensures that parsed metadata (priority, projects, tags) matches the expected schema before saving. |

### UI & Visual Feedback
| Technology | Purpose | Why |
|------------|---------|-----|
| `lucide-react` | Icons | Already in use. Provides a wide range of status and category icons (e.g., `CircleCheck`, `Tag`, `Calendar`). |
| `framer-motion` | Micro-interactions | Already in use. Essential for "chipping" animations (visual feedback when an entity is recognized in the capture input). |

## Recommended CLI-Like Syntax

For developers, a text-based syntax is often faster than clicking:

| Pattern | Symbol | Example | Rationale |
|---------|--------|---------|-----------|
| **Tags** | `#` | `#urgent` | Common, low-friction tagging. |
| **Projects** | `^` or `+` | `^frontend` | Distinguished from tags, used by TickTick and Taskwarrior. |
| **Priority** | `!` | `!!` (High), `!` (Medium) | Quick to type, visually impactful. Or `p1`, `p2` (Todoist style). |
| **Date** | (NLP) | `tomorrow 5pm` | No symbol needed for dates with robust NLP. |
| **Status/Type** | `prefix:` | `feat: ...` | Conventional Commits style for developer tasks. |

## Installation Recommendations

```bash
# Core NLP and Command Palette
npm install cmdk chrono-node hotkeys-js

# Dev dependencies (types)
npm install -D @types/chrono-node
```

## Sources

- [Todoist NLP Syntax](https://todoist.com/help/articles/introduction-to-natural-language-input)
- [cmdk Documentation](https://cmdk.paco.me/)
- [Chrono Node GitHub](https://github.com/wanasit/chrono)
- [Linear.app Keyboard Shortcuts](https://linear.app/shortcuts)
