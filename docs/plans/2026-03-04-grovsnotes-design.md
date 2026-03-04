# GrovsNotes - Design Document

**Date:** 2026-03-04
**Status:** Approved

## Overview

GrovsNotes is a personal project tracker for developers focused on capturing ideas quickly and maintaining a development log. Core philosophy: capture fast, organize later, search everything.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Architecture | REST API + SPA | Simple, clean separation, easy git hook integration |
| Database | SQLite + FTS5 | Zero-config, single-user, no server needed |
| Auth | Single-user, API key for hooks | Minimal friction, secure enough for personal use |
| Monorepo | pnpm workspaces | Fast, disk-efficient, no extra tooling |
| Offline | Capture-only | Queue locally, sync when online. Covers critical use case |
| Tags | Inline hashtags | Parsed from text, zero capture friction |
| Deployment | VPS / self-hosted | Caddy + PM2, full control |

## Tech Stack

- **Backend:** Node.js, Fastify, TypeScript, SQLite, Drizzle ORM
- **Frontend:** React, Vite, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui, Radix UI, Framer Motion
- **State:** TanStack Query (React Query)
- **PWA:** vite-plugin-pwa
- **Testing:** Vitest, React Testing Library, light-my-request

## Repository Structure

```
grovsnotes/
├── apps/
│   ├── web/          # React SPA (Vite + PWA)
│   └── api/          # Fastify REST API
├── packages/
│   ├── db/           # Drizzle schema, migrations, SQLite setup
│   └── shared/       # Shared types & constants
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

## Database Schema

### items

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | Primary key |
| title | text | Required. Hashtags stripped on save. |
| content | text | Optional longer description |
| type | text | `idea` \| `task` \| `note` \| `bug` \| `research`. Default: `idea` |
| status | text | `inbox` \| `todo` \| `doing` \| `done` \| `archived`. Default: `inbox` |
| project_id | text | FK to projects. Nullable |
| created_at | text (ISO) | Auto-set |
| updated_at | text (ISO) | Auto-set on update |

### tags

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | Primary key |
| name | text | Unique, lowercase |

### item_tags

| Column | Type |
|---|---|
| item_id | text FK |
| tag_id | text FK |

### projects

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | Primary key |
| name | text | Required |
| color | text | Hex color. Optional |
| icon | text | Emoji or icon name. Optional |

### dev_logs

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | Primary key |
| repo | text | Repository name |
| branch | text | Branch name |
| commit_hash | text | Full SHA |
| message | text | Commit message |
| created_at | text (ISO) | Commit timestamp |

### items_fts (FTS5 virtual table)

Indexes `title` and `content` columns for full-text search.

## API Design

Base path: `/api`. JSON request/response. ISO 8601 dates. Cursor-based pagination via `?limit=` and `?cursor=` (ULID).

### Items

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/items` | Create item. Parses hashtags from title. |
| `GET` | `/api/items` | List items. Params: `?type=`, `?status=`, `?project=`, `?tag=`, `?q=` |
| `GET` | `/api/items/:id` | Get item with tags and project |
| `PATCH` | `/api/items/:id` | Update item. Re-parses hashtags on title change. |
| `DELETE` | `/api/items/:id` | Delete item and tag associations |

### Projects

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects` | List projects with item count |
| `POST` | `/api/projects` | Create project |
| `PATCH` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project (nullifies items' project_id) |

### Dev Logs

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/dev-logs` | Create dev log entry. Requires API key. |
| `GET` | `/api/dev-logs` | List dev logs. Params: `?repo=`, `?branch=`, `?from=`, `?to=` |

### Search

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/search` | Unified search. Parses: plain text (FTS), `project:X`, `type:X`, `tag:X` |

### Error Response

```json
{ "error": { "code": "NOT_FOUND", "message": "Item not found" } }
```

### Hashtag Parsing Flow

On create/update (when title changes):
1. Extract `#word` patterns from title
2. Strip hashtags from stored title
3. Upsert tags (create if new)
4. Update junction table

## Frontend Architecture

### Directory Structure

```
apps/web/src/
├── components/
│   ├── capture/      # Quick capture input
│   ├── inbox/        # Inbox list view
│   ├── items/        # Item card, item detail
│   ├── projects/     # Project list, project detail
│   ├── search/       # Search bar, results
│   ├── timeline/     # Dev timeline view
│   └── layout/       # Shell, nav, sidebar
├── hooks/            # Custom React hooks
├── lib/              # API client, hashtag parser, utils
├── routes/           # Page-level route components
├── sw/               # Service worker (offline capture)
├── App.tsx
└── main.tsx
```

### Views

1. **Capture** (home) - Single input, always focused on load
2. **Inbox** - Items with `status: inbox`, newest first
3. **Projects** - Project list, drill into project items
4. **Search** - Unified query syntax, real-time debounced results
5. **Timeline** - Chronological mix of items + dev logs

### Quick Capture Flow

1. User lands on app, input focused
2. Types text (e.g., `fix auth bug #urgent #atp`)
3. Presses Enter
4. POST fires, input clears, subtle animation
5. Item appears in inbox

### Offline Capture

- Items queued in localStorage when offline
- Service worker syncs queue on connectivity return
- UI indicator shows pending sync count

### State Management

TanStack Query for server state. React useState for local UI state. No external state library.

## Git Hook Integration

`post-commit` hook script:

```bash
#!/bin/sh
REPO=$(basename "$(git rev-parse --show-toplevel)")
BRANCH=$(git rev-parse --abbrev-ref HEAD)
HASH=$(git rev-parse HEAD)
MSG=$(git log -1 --pretty=%B)

curl -s -X POST "$GROVSNOTES_URL/api/dev-logs" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $GROVSNOTES_API_KEY" \
  -d "{\"repo\":\"$REPO\",\"branch\":\"$BRANCH\",\"commit_hash\":\"$HASH\",\"message\":\"$MSG\"}"
```

Env vars `GROVSNOTES_URL` and `GROVSNOTES_API_KEY` set in shell profile. Installable per-repo or globally via `git config core.hooksPath`.

## Deployment

- **API:** Node.js process managed by PM2 or systemd
- **Frontend:** Static files served by Caddy (auto-HTTPS) or Fastify via `@fastify/static`
- **Database:** SQLite file on disk, backed up via cron
- **Reverse proxy:** Caddy handles HTTPS + proxies `/api/*` to Fastify

## Testing Strategy

- **API:** Vitest + light-my-request (Fastify test injection, no HTTP server)
- **Database:** In-memory SQLite for tests
- **Frontend:** Vitest + React Testing Library (capture flow, search)
- **E2E:** Playwright for critical paths (not required for v1)

## Error Handling & Logging

- **API:** Fastify built-in logger (pino), structured JSON logs
- **Errors:** Consistent error response shape via Fastify error handler plugin
- **Frontend:** Error boundaries + toast notifications for API errors
