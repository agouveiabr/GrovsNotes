# Architecture Patterns: Task Management

**Domain:** Task Management / Note-taking
**Researched:** 2025-05-18

## Recommended Architecture: Decoupled Parsing Engine

To avoid "Parsing Latency" and ensure real-time visual feedback, the parsing logic should be centralized and available to both the frontend (for UI chipping) and backend (for validation and persistence).

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **`MultiEntityParser`** | Core logic for extracting tags (`#`), projects (`^`), priorities (`!`), and dates (via `chrono-node`). | Frontend & Backend |
| **`CaptureInput`** | Handles user typing, triggers real-time parsing, and renders "Chips". | `MultiEntityParser`, API |
| **`ChipRenderer`** | Visual overlay or replacement for parsed text in the input field. | `CaptureInput` |
| **`MetadataManager`** | Persists parsed items and maintains the junction tables for tags/projects. | `MultiEntityParser`, Database |

### Data Flow (Capture)

1. **User Types:** `onChange` in `CaptureInput` sends raw text to `MultiEntityParser`.
2. **Real-time Chip Update:** `MultiEntityParser` returns an array of tokens (text vs. entity). `ChipRenderer` updates the UI to highlight recognized entities.
3. **Commit (Enter):** `CaptureInput` sends the final `OriginalInput` and `CleanedTitle` (plus metadata objects) to the backend.
4. **Backend Validation:** Backend re-runs `MultiEntityParser` to ensure metadata matches the text before saving.

## Patterns to Follow

### Pattern 1: Token-based Text Processing
Instead of simple regex stripping, treat the input as a stream of tokens. This allows for more complex parsing (e.g., dates with multiple words).

**Example:**
```typescript
interface Token {
  type: 'text' | 'tag' | 'project' | 'priority' | 'date';
  value: string;
  startIndex: number;
  endIndex: number;
}
```

### Pattern 2: Single-Key Navigation Hub
Implement a global state to handle "Go To" navigation without modifier keys (e.g., `G` → `I` for Inbox).

**Example:**
```typescript
const [navPrefix, setNavPrefix] = useState<string | null>(null);

useHotkeys('g', () => setNavPrefix('g'));
useHotkeys('i', () => {
  if (navPrefix === 'g') navigate('/inbox');
  setNavPrefix(null);
});
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Server-Side Only Parsing
**Why bad:** Creates lag in the UI. The user doesn't know if their `#urgent` tag was recognized until after they save and the list reloads.
**Instead:** Always do a "Preview Parse" on the client.

### Anti-Pattern 2: Hard-coding NLP Rules
**Why bad:** Dates are incredibly hard to parse (e.g., "every other fri at 2").
**Instead:** Use a battle-tested library like `chrono-node`.

## Sources

- [Architecting a Command Bar in React](https://cmdk.paco.me/)
- [Tokenizing Text in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [Todoist API: Task Metadata Schema](https://developer.todoist.com/rest/v2/#tasks)
