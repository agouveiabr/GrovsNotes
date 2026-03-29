# Domain Pitfalls: Task Management & Capture

**Domain:** Task Management / Note-taking
**Researched:** 2025-05-18

## Critical Pitfalls

### Pitfall 1: Parsing Latency & Feedback
**What goes wrong:** User types "Call John tomorrow", but the app saves "Call John tomorrow" as the title before the NLP parser can extract the date.
**Why it happens:** Debouncing issues or slow client-side parsing.
**Consequences:** Duplicate information in the title, missed due dates, loss of user trust in the "smart" features.
**Prevention:** 
- Use a high-performance parser like `chrono-node` directly on the client.
- Provide immediate visual "chipping" (turning parsed text into a badge) so the user knows the system understood before they hit Enter.
- If Enter is pressed too quickly, do a final synchronous parse before submitting.

### Pitfall 2: Over-Stripping Metadata
**What goes wrong:** The current hashtag parser (in GrovsNotes) strips hashtags from the stored title.
**Why it happens:** Desiring a "clean" look.
**Consequences:** If the user wants to see their tags in context, they are lost. If the parsing is wrong, the user can't easily edit the original string to fix it.
**Prevention:** 
- Store the "Original Input" alongside the "Cleaned Title".
- Consider a "Toggle" for showing/hiding metadata in titles rather than destructive stripping.

## Moderate Pitfalls

### Pitfall 1: The "Hidden Shortcut" Problem
**What goes wrong:** Implementing powerful shortcuts (e.g., `G` then `I` for Inbox) but users never find them.
**Prevention:** 
- Display shortcut hints in every menu item.
- Use a "Keyboard Onboarding" flow.
- Add a `?` hotkey to show a cheat sheet overlay.

### Pitfall 2: NLP Over-Recognition (False Positives)
**What goes wrong:** Parsing "Buy Friday the 13th movie" as a task due on Friday.
**Prevention:** 
- Allow users to "Escape" a parsed entity (e.g., hitting `Backspace` on a highlighted chip to revert it to plain text).
- Be conservative with NLP; require specific formats for ambiguous terms.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **NLP Dates** | Timezone mismatches | Ensure all parsing and storage uses ISO UTC, with local offsets only in the UI. |
| **Command Palette** | "Search Noise" | Rank results by recency and relevance; separate "Actions" from "Content Search". |
| **Keyboard Management** | Shortcut collisions | Allow users to rebind keys if they clash with OS or browser defaults. |

## Sources

- [Post-mortem: Why we stopped using NLP](https://www.google.com/search?q=productivity+app+nlp+failures)
- [Todoist: How to un-highlight parsed text](https://todoist.com/help/articles/introduction-to-natural-language-input)
- [Linear: Design Patterns for Keyboard-Driven Tools](https://linear.app/design)
