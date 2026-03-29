---
direction: dark
---

# GrovsNotes Design System

Dark-first, neutral palette. Borders define structure. Shadows are whispers. Whitespace is generous.

Extracted from codebase scan. Reflects actual usage frequency, not aspirational values.

---

## Direction

- **Mode:** Dark-first. Class-based toggle (`.dark` on `<html>`), stored in `localStorage` as `grovsnotes-theme`. Default: dark.
- **Palette:** Neutral only — OKLCH CSS variables, no custom accent hue. Primary = near-white in dark mode.
- **Depth:** Borders separate regions. Shadows elevate surfaces.
- **Scale:** Conservative — no 3xl+ text, no decorative gradients, no glassmorphism.

---

## Spacing

Base unit: 4px (Tailwind default).

| Token | Value | Use |
|-------|-------|-----|
| `1` | 4px | Icon button padding, tight inline gaps |
| `2` | 8px | Badge padding, small gaps (`gap-2` dominant) |
| `3` | 12px | Input horizontal padding (`px-3`), item card padding (`p-3`) |
| `4` | 16px | Default container padding (`p-4`), standard gaps (`gap-4`) |
| `6` | 24px | Card content padding (`px-6`), CardHeader/Footer |
| `12` | 48px | Empty state vertical centering (`py-12`) |

**Rule:** Use `p-3` for compact cards (item list), `p-4` for standard panels, `px-6` for card content areas.

---

## Border Radius

Two-tier system.

| Token | Use |
|-------|-----|
| `rounded-md` | Atoms — buttons, inputs, badges, tooltips |
| `rounded-lg` | Item cards, compact panels |
| `rounded-xl` | Standard cards, project panels, modals |
| `rounded-full` | Dots, color swatches, avatar circles |

**Rule:** Never mix `rounded-lg` and `rounded-xl` within the same context. Pick one per component family.

---

## Depth

**Border-first.** Shadows are accents, not structure.

- Primary separation: `border` (62 occurrences)
- Shadows used sparingly: `shadow-sm` on cards, `shadow-xs` on form inputs
- `shadow-lg` reserved for floating overlays (dialogs, popovers)

**Rule:** Use `border` to separate regions. Add `shadow-sm` only on elevated surfaces (cards floating above background). Never use shadow as the sole depth cue.

---

## Color

All colors via CSS variables — no raw Tailwind color tokens in components.

### Surface hierarchy
```
bg-background   → page background
bg-card         → card / panel surfaces
bg-accent       → hover states, subtle fills
bg-input        → form inputs
```

### Text hierarchy
```
text-foreground          → primary content
text-muted-foreground    → secondary, metadata, descriptions
text-card-foreground     → text on card surfaces
```

### Semantic roles
```
primary       → CTAs, active nav, key actions
secondary     → badges, supporting actions
destructive   → delete, error, overdue states
accent        → hover fills, row highlights
ring          → focus outlines
```

### Opacity modifiers in use
- `/90` — hover darken on primary
- `/50` — hover fill on ghost/accent
- `/30`, `/20` — disabled, subtle tints
- `/40`, `/60` — border softening

**Rule:** Never use raw zinc/slate/gray. All color decisions go through CSS variables. Use semantic roles (primary, destructive, muted) rather than shade numbers.

---

## Typography

Conservative scale. Hierarchy via weight, not size jumps.

| Token | Use |
|-------|-----|
| `text-xs` | Badges, labels, timestamps, metadata (most common) |
| `text-sm` | Body text, descriptions, form fields (default) |
| `text-base` | Form inputs, normal paragraphs |
| `text-lg` | Section headings, card titles |
| `text-xl` | Page-level headings |
| `text-2xl` | Primary page title (h1 only) |

| Weight | Use |
|--------|-----|
| `font-medium` | Item titles, form labels, nav links |
| `font-semibold` | Card titles, button text, emphasized labels |
| `font-bold` | Page headings, strong emphasis |

**Rule:** Don't go above `text-2xl`. Don't use `font-black`. Distinguish siblings with weight before reaching for a larger size.

---

## Buttons

| Size | Height | Padding | Font | Radius |
|------|--------|---------|------|--------|
| `xs` | `h-6` | `px-2` | `text-xs` | `rounded-md` |
| `sm` | `h-8` | `px-3` | `text-xs` | `rounded-md` |
| `default` | `h-9` | `px-4 py-2` | `text-sm` | `rounded-md` |
| `lg` | `h-10` | `px-6` | `text-sm` | `rounded-md` |
| `icon` | `h-8 w-8` | `p-1` | — | `rounded-md` |

Variants: `default`, `outline`, `ghost`, `secondary`, `destructive`, `link`

**Rule:** Use `ghost` for toolbar/contextual actions. Use `outline` for secondary actions next to a primary. Use `icon` size for actions inside list rows (hidden until group-hover).

---

## Cards

### Standard card (shadcn Card)
```
rounded-xl border bg-card py-6 shadow-sm
```
Content area: `px-6`. Use for primary content panels.

### Item card (list rows)
```
p-3 rounded-lg border bg-card
hover:bg-accent/50 transition-colors
```
Compact. Hidden actions revealed on `group-hover`.

### Project card
```
p-4 border rounded-xl bg-card shadow-sm
```
Standard padding, slightly elevated via `shadow-sm`.

---

## Interaction

### Hover
- Filled buttons: `hover:bg-primary/90` (10% darken)
- Ghost/accent areas: `hover:bg-accent/50`
- List rows: `hover:bg-accent/50` via group
- Hidden actions in rows: `opacity-0 group-hover:opacity-100`

### Focus
```
focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
```
Applied consistently to all interactive elements.

### Transitions
- `transition-colors` — color/background changes
- `transition-all` — multi-property (use sparingly)
- Duration: Tailwind default (150ms)

### Animation
- Framer Motion: `AnimatePresence` + `motion.*` for mount/unmount (e.g. capture feedback)
- Tailwind animate: `animate-in fade-in zoom-in-95 duration-200` for inline reveals
- Loading: `animate-spin` on spinner icons

---

## Component Inventory

shadcn/ui components in active use:

- `Button` — all interactive actions
- `Badge` — tags, status, counts
- `Input` — text fields
- `Textarea` — multi-line fields
- `Select` — dropdowns (type, status, project)
- `Dialog` — confirmations (destructive)
- `Toaster` (Sonner) — notifications
- `Card` / `CardHeader` / `CardContent` / `CardFooter` — content panels

Supporting libraries:

- `lucide-react` — icons (20+ types in use)
- `react-markdown` + `remark-gfm` — markdown rendering with `dark:prose-invert`
- `framer-motion` — mount/unmount animations

**Not yet used:** Popover, Dropdown Menu, Tabs, Tooltip, Accordion, Command.

---

## Offline / PWA

- Offline indicator: `border-amber-500/50` on CaptureInput
- Pending sync: Badge `variant="secondary"` with count
- Capture input border shifts from `border-border` → `border-amber-500/50` when offline

This is the one place raw Tailwind amber tokens are allowed (semantic exception for connectivity state).
