# Phase 1 Research: Advanced Parsing Engine

## Goal
Implement a robust, client-and-server compatible parsing engine for task metadata, supporting tags, projects, priorities, and natural language dates.

## Dependencies
- `chrono-node`: For natural language date parsing.

## Metadata Patterns

### 1. Tags (`#tag`)
- Pattern: `#(\w+)`
- Example: `#work`, `#personal`
- Behavior: Extracted to a list of tags. Removed from clean title.

### 2. Projects (`^project`)
- Pattern: `\^(\w+)`
- Example: `^grovsnotes`, `^house`
- Behavior: Extracted to associate with a project. Removed from clean title. Note: Project name lookup will be needed (either by ID or name). For simplicity in Phase 1, we might use name lookup or first match.

### 3. Priorities (`!!priority`)
- Pattern: `!!([1-4])`
- Example: `!!1` (High), `!!2` (Medium), `!!3` (Low), `!!4` (None/Default)
- Behavior: Extracted to a priority field (number 1-4). Removed from clean title.

### 4. Task Prefixes (`type:`)
- Pattern: `^(feat|fix|chore|idea|bug|research):\s*`
- Example: `feat: New parser`, `bug: Fix crash`
- Behavior: Extracted to set the `type` field. Prefix removed from clean title.

### 5. Natural Language Dates
- Tool: `chrono-node`
- Example: "Buy milk tomorrow", "Meeting next Tuesday at 2pm"
- Behavior: `chrono.parseDate(text)` extracts the first date found. The date-related substring should be removed from the clean title if possible, or we just extract it and keep the title as is (standard practice varies; Todoist removes it, others don't). For PARSER-04, we should aim to remove it.

## Implementation Strategy

### Centralized Parser (`MultiEntityParser`)
A class or set of functions shared (if possible) or duplicated between client and server. Since we are using Convex, we can put this in `convex/lib/parser.ts` and import it in both Convex functions and the React app (if `@grovsnotes/web` can import from `convex/`).

```typescript
export interface ParsedResult {
  title: string;
  tags: string[];
  project?: string;
  priority?: number;
  dueAt?: number;
  type?: string;
}

export function parseItem(input: string): ParsedResult { ... }
```

### Convex Schema Changes
- Add `originalInput: v.string()` to `items` table.
- Ensure `priority` (v.optional(v.number())) is added if not present (it's not in `schema.ts` currently).

### Client-side Preview
- Use `parseItem` in `CaptureInput` to show a preview of extracted metadata.
- This will be visually enhanced in Phase 3 with "chipping".

## Risks & Mitigations
- **Over-parsing**: Regex might match words that aren't intended as tokens (e.g. "I'm !!1" in a sentence).
  - Mitigation: Use specific prefixes and maybe boundary checks.
- **Date parsing ambiguity**: "tomorrow" depends on the user's timezone.
  - Mitigation: Pass reference date/timezone to `chrono-node`.
- **Project lookup**: Users might type `^project` that doesn't exist.
  - Mitigation: In Phase 1, we can either ignore it or create a placeholder. For now, we'll try to match against existing projects.
