# GrovsNotes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal project tracker for developers with ultra-fast capture, inbox workflow, powerful search, and git integration.

**Architecture:** Fastify REST API + React SPA in a pnpm monorepo. SQLite with FTS5 for storage and search. PWA with offline capture queue. Single-user, API key auth for git hooks only.

**Tech Stack:** Node 22, pnpm 10, Fastify, Drizzle ORM, SQLite (better-sqlite3), React 19, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Vitest

**Reference:** See `docs/plans/2026-03-04-grovsnotes-design.md` for the full approved design.

---

## Phase 1: Monorepo & Database Foundation

### Task 1: Scaffold Monorepo Root

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.npmrc`

**Step 1: Create root package.json**

```json
{
  "name": "grovsnotes",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel --filter './apps/*' dev",
    "build": "pnpm --filter './packages/*' build && pnpm --filter './apps/*' build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "db:generate": "pnpm --filter @grovsnotes/db generate",
    "db:migrate": "pnpm --filter @grovsnotes/db migrate"
  },
  "engines": {
    "node": ">=22",
    "pnpm": ">=10"
  }
}
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Step 3: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Step 4: Create .gitignore**

```
node_modules/
dist/
*.db
*.db-journal
*.db-wal
.env
.env.local
.DS_Store
```

**Step 5: Create .npmrc**

```
shamefully-hoist=false
strict-peer-dependencies=false
```

**Step 6: Run `pnpm install` to create lockfile**

Run: `pnpm install`
Expected: creates `pnpm-lock.yaml`

**Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .gitignore .npmrc pnpm-lock.yaml
git commit -m "chore: scaffold monorepo root with pnpm workspaces"
```

---

### Task 2: Scaffold Shared Types Package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/constants.ts`

**Step 1: Create packages/shared/package.json**

```json
{
  "name": "@grovsnotes/shared",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

Note: We use `main: ./src/index.ts` so other workspace packages import TypeScript source directly (bundled by the consuming app's build tool). No separate build step needed.

**Step 2: Create packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 3: Create packages/shared/src/types.ts**

```typescript
export const ITEM_TYPES = ['idea', 'task', 'note', 'bug', 'research'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_STATUSES = ['inbox', 'todo', 'doing', 'done', 'archived'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export interface Item {
  id: string;
  title: string;
  content: string | null;
  type: ItemType;
  status: ItemStatus;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemWithTags extends Item {
  tags: Tag[];
  project: Project | null;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface ProjectWithCount extends Project {
  itemCount: number;
}

export interface DevLog {
  id: string;
  repo: string;
  branch: string;
  commitHash: string;
  message: string;
  createdAt: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}
```

**Step 4: Create packages/shared/src/constants.ts**

```typescript
export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_TITLE_LENGTH = 500;
export const MAX_CONTENT_LENGTH = 10000;
```

**Step 5: Create packages/shared/src/index.ts**

```typescript
export * from './types.js';
export * from './constants.js';
```

**Step 6: Run pnpm install from root**

Run: `pnpm install`

**Step 7: Commit**

```bash
git add packages/shared/
git commit -m "feat: add shared types package with item, project, devlog types"
```

---

### Task 3: Scaffold Database Package with Drizzle Schema

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/src/schema.ts`
- Create: `packages/db/src/connection.ts`
- Create: `packages/db/drizzle.config.ts`

**Step 1: Create packages/db/package.json**

```json
{
  "name": "@grovsnotes/db",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "generate": "drizzle-kit generate",
    "migrate": "drizzle-kit migrate",
    "studio": "drizzle-kit studio",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "better-sqlite3": "^11.0.0",
    "drizzle-orm": "^0.39.0",
    "ulid": "^2.3.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.0",
    "drizzle-kit": "^0.30.0",
    "typescript": "^5.7.0"
  }
}
```

**Step 2: Create packages/db/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 3: Create packages/db/src/schema.ts**

```typescript
import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const items = sqliteTable(
  'items',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content'),
    type: text('type', { enum: ['idea', 'task', 'note', 'bug', 'research'] })
      .notNull()
      .default('idea'),
    status: text('status', {
      enum: ['inbox', 'todo', 'doing', 'done', 'archived'],
    })
      .notNull()
      .default('inbox'),
    projectId: text('project_id').references(() => projects.id, {
      onDelete: 'set null',
    }),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('items_status_idx').on(table.status),
    index('items_type_idx').on(table.type),
    index('items_project_id_idx').on(table.projectId),
    index('items_created_at_idx').on(table.createdAt),
  ]
);

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const itemTags = sqliteTable(
  'item_tags',
  {
    itemId: text('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('item_tags_item_id_idx').on(table.itemId),
    index('item_tags_tag_id_idx').on(table.tagId),
  ]
);

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  icon: text('icon'),
});

export const devLogs = sqliteTable(
  'dev_logs',
  {
    id: text('id').primaryKey(),
    repo: text('repo').notNull(),
    branch: text('branch').notNull(),
    commitHash: text('commit_hash').notNull(),
    message: text('message').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('dev_logs_repo_idx').on(table.repo),
    index('dev_logs_created_at_idx').on(table.createdAt),
  ]
);
```

**Step 4: Create packages/db/src/connection.ts**

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export function createDb(dbPath: string) {
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  return drizzle(sqlite, { schema });
}

export function createFtsTable(dbPath: string) {
  const sqlite = new Database(dbPath);
  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
      title,
      content,
      content='items',
      content_rowid='rowid'
    );
  `);

  // Triggers to keep FTS in sync with items table
  sqlite.exec(`
    CREATE TRIGGER IF NOT EXISTS items_fts_insert AFTER INSERT ON items BEGIN
      INSERT INTO items_fts(rowid, title, content) VALUES (NEW.rowid, NEW.title, NEW.content);
    END;
  `);
  sqlite.exec(`
    CREATE TRIGGER IF NOT EXISTS items_fts_delete AFTER DELETE ON items BEGIN
      INSERT INTO items_fts(items_fts, rowid, title, content) VALUES('delete', OLD.rowid, OLD.title, OLD.content);
    END;
  `);
  sqlite.exec(`
    CREATE TRIGGER IF NOT EXISTS items_fts_update AFTER UPDATE ON items BEGIN
      INSERT INTO items_fts(items_fts, rowid, title, content) VALUES('delete', OLD.rowid, OLD.title, OLD.content);
      INSERT INTO items_fts(rowid, title, content) VALUES (NEW.rowid, NEW.title, NEW.content);
    END;
  `);
  sqlite.close();
}

export type Db = ReturnType<typeof createDb>;
```

**Step 5: Create packages/db/src/index.ts**

```typescript
export * from './schema.js';
export { createDb, createFtsTable, type Db } from './connection.js';
```

**Step 6: Create packages/db/drizzle.config.ts**

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './data/grovsnotes.db',
  },
});
```

**Step 7: Run pnpm install from root**

Run: `pnpm install`

**Step 8: Generate initial migration**

Run: `pnpm db:generate`
Expected: Creates migration files in `packages/db/drizzle/`

**Step 9: Commit**

```bash
git add packages/db/
git commit -m "feat: add database package with Drizzle schema and FTS5 setup"
```

---

## Phase 2: API Server

### Task 4: Scaffold Fastify API

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/config.ts`
- Create: `apps/api/.env.example`

**Step 1: Create apps/api/package.json**

```json
{
  "name": "@grovsnotes/api",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@grovsnotes/db": "workspace:*",
    "@grovsnotes/shared": "workspace:*",
    "fastify": "^5.0.0",
    "@fastify/cors": "^11.0.0",
    "@fastify/static": "^8.0.0",
    "ulid": "^2.3.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "@types/node": "^22.0.0"
  }
}
```

**Step 2: Create apps/api/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 3: Create apps/api/src/config.ts**

```typescript
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL || './data/grovsnotes.db',
  apiKey: process.env.API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
```

**Step 4: Create apps/api/src/app.ts**

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createDb, createFtsTable } from '@grovsnotes/db';
import { config } from './config.js';

export async function buildApp(overrides?: { databaseUrl?: string }) {
  const dbPath = overrides?.databaseUrl || config.databaseUrl;

  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  await app.register(cors, {
    origin: config.corsOrigin,
  });

  // Database
  const db = createDb(dbPath);
  app.decorate('db', db);

  // Error handler
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  });

  // Health check
  app.get('/api/health', async () => ({ status: 'ok' }));

  return app;
}
```

**Step 5: Create apps/api/src/index.ts**

```typescript
import { buildApp } from './app.js';
import { config } from './config.js';
import { createFtsTable } from '@grovsnotes/db';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

async function start() {
  // Ensure data directory exists
  mkdirSync(dirname(config.databaseUrl), { recursive: true });

  // Set up FTS table and triggers
  createFtsTable(config.databaseUrl);

  const app = await buildApp();

  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
```

**Step 6: Create apps/api/.env.example**

```
PORT=3000
HOST=0.0.0.0
DATABASE_URL=./data/grovsnotes.db
API_KEY=change-me-to-a-random-string
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

**Step 7: Run pnpm install from root**

Run: `pnpm install`

**Step 8: Verify the server starts**

Run: `cd apps/api && pnpm dev` (start, then Ctrl+C after confirming it logs "Server listening")

**Step 9: Commit**

```bash
git add apps/api/
git commit -m "feat: scaffold Fastify API with health check, CORS, and DB setup"
```

---

### Task 5: Hashtag Parser Utility

**Files:**
- Create: `apps/api/src/lib/hashtags.ts`
- Create: `apps/api/src/lib/__tests__/hashtags.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/api/src/lib/__tests__/hashtags.test.ts
import { describe, it, expect } from 'vitest';
import { parseHashtags } from '../hashtags.js';

describe('parseHashtags', () => {
  it('extracts hashtags and returns clean title', () => {
    const result = parseHashtags('fix auth bug #urgent #backend');
    expect(result).toEqual({
      cleanTitle: 'fix auth bug',
      tags: ['urgent', 'backend'],
    });
  });

  it('returns empty tags when no hashtags', () => {
    const result = parseHashtags('just a normal title');
    expect(result).toEqual({
      cleanTitle: 'just a normal title',
      tags: [],
    });
  });

  it('lowercases tags', () => {
    const result = parseHashtags('something #Frontend #API');
    expect(result).toEqual({
      cleanTitle: 'something',
      tags: ['frontend', 'api'],
    });
  });

  it('deduplicates tags', () => {
    const result = parseHashtags('thing #api #api #Api');
    expect(result).toEqual({
      cleanTitle: 'thing',
      tags: ['api'],
    });
  });

  it('handles hashtags at beginning and middle', () => {
    const result = parseHashtags('#idea build a #cool thing');
    expect(result).toEqual({
      cleanTitle: 'build a thing',
      tags: ['idea', 'cool'],
    });
  });

  it('trims extra whitespace', () => {
    const result = parseHashtags('  hello   #tag   world  ');
    expect(result).toEqual({
      cleanTitle: 'hello world',
      tags: ['tag'],
    });
  });

  it('handles empty string', () => {
    const result = parseHashtags('');
    expect(result).toEqual({
      cleanTitle: '',
      tags: [],
    });
  });

  it('handles only hashtags', () => {
    const result = parseHashtags('#tag1 #tag2');
    expect(result).toEqual({
      cleanTitle: '',
      tags: ['tag1', 'tag2'],
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd apps/api && pnpm test -- src/lib/__tests__/hashtags.test.ts`
Expected: FAIL — module not found

**Step 3: Write implementation**

```typescript
// apps/api/src/lib/hashtags.ts
export interface ParsedHashtags {
  cleanTitle: string;
  tags: string[];
}

export function parseHashtags(input: string): ParsedHashtags {
  const tagPattern = /#(\w+)/g;
  const tags: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(input)) !== null) {
    tags.push(match[1].toLowerCase());
  }

  const cleanTitle = input
    .replace(tagPattern, '')
    .replace(/\s+/g, ' ')
    .trim();

  const uniqueTags = [...new Set(tags)];

  return { cleanTitle, tags: uniqueTags };
}
```

**Step 4: Run test to verify it passes**

Run: `cd apps/api && pnpm test -- src/lib/__tests__/hashtags.test.ts`
Expected: All 8 tests PASS

**Step 5: Commit**

```bash
git add apps/api/src/lib/
git commit -m "feat: add hashtag parser with tests"
```

---

### Task 6: Items API Routes (Create, List, Get)

**Files:**
- Create: `apps/api/src/routes/items.ts`
- Create: `apps/api/src/routes/__tests__/items.test.ts`
- Modify: `apps/api/src/app.ts` (register routes)

**Step 1: Write the failing tests**

```typescript
// apps/api/src/routes/__tests__/items.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../../app.js';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync, rmSync } from 'node:fs';

const TEST_DB = ':memory:';

async function createTestApp() {
  const app = await buildApp({ databaseUrl: TEST_DB, migrate: true });
  return app;
}

describe('Items API', () => {
  describe('POST /api/items', () => {
    it('creates an item with default type and status', async () => {
      const app = await createTestApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'my first idea' },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.title).toBe('my first idea');
      expect(body.type).toBe('idea');
      expect(body.status).toBe('inbox');
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    it('parses hashtags from title', async () => {
      const app = await createTestApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'fix login #urgent #auth' },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.title).toBe('fix login');
      expect(body.tags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'urgent' }),
          expect.objectContaining({ name: 'auth' }),
        ])
      );
    });

    it('rejects empty title', async () => {
      const app = await createTestApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: '' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/items', () => {
    it('returns items sorted by created_at desc', async () => {
      const app = await createTestApp();

      await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'first' },
      });
      await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'second' },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/items',
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toHaveLength(2);
      expect(body.data[0].title).toBe('second');
      expect(body.data[1].title).toBe('first');
    });

    it('filters by status', async () => {
      const app = await createTestApp();

      await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'inbox item' },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/items?status=todo',
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toHaveLength(0);
    });

    it('filters by type', async () => {
      const app = await createTestApp();

      await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'an idea' },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/items?type=task',
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().data).toHaveLength(0);
    });
  });

  describe('GET /api/items/:id', () => {
    it('returns item with tags', async () => {
      const app = await createTestApp();
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'test #tagged' },
      });
      const { id } = createRes.json();

      const res = await app.inject({
        method: 'GET',
        url: `/api/items/${id}`,
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.id).toBe(id);
      expect(body.tags).toHaveLength(1);
      expect(body.tags[0].name).toBe('tagged');
    });

    it('returns 404 for unknown id', async () => {
      const app = await createTestApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/items/nonexistent',
      });

      expect(res.statusCode).toBe(404);
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd apps/api && pnpm test -- src/routes/__tests__/items.test.ts`
Expected: FAIL — routes not implemented

**Step 3: Implement items routes**

```typescript
// apps/api/src/routes/items.ts
import { FastifyInstance } from 'fastify';
import { eq, desc, and, inArray, sql } from 'drizzle-orm';
import { items, tags, itemTags } from '@grovsnotes/db';
import { ulid } from 'ulid';
import { parseHashtags } from '../lib/hashtags.js';
import type { ItemType, ItemStatus } from '@grovsnotes/shared';
import { ITEM_TYPES, ITEM_STATUSES, DEFAULT_PAGE_LIMIT } from '@grovsnotes/shared';

export async function itemRoutes(app: FastifyInstance) {
  // POST /api/items
  app.post('/api/items', async (request, reply) => {
    const { title, content, type, status, projectId } = request.body as {
      title?: string;
      content?: string;
      type?: ItemType;
      status?: ItemStatus;
      projectId?: string;
    };

    if (!title || title.trim() === '') {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Title is required' },
      });
    }

    if (type && !ITEM_TYPES.includes(type)) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: `Invalid type: ${type}` },
      });
    }

    if (status && !ITEM_STATUSES.includes(status)) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: `Invalid status: ${status}` },
      });
    }

    const { cleanTitle, tags: parsedTags } = parseHashtags(title);
    const now = new Date().toISOString();
    const id = ulid();

    const db = app.db;

    // Insert item
    db.insert(items)
      .values({
        id,
        title: cleanTitle,
        content: content || null,
        type: type || 'idea',
        status: status || 'inbox',
        projectId: projectId || null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Upsert tags and create associations
    const tagRecords = await upsertTags(db, parsedTags);
    for (const tag of tagRecords) {
      db.insert(itemTags).values({ itemId: id, tagId: tag.id }).run();
    }

    const item = db.select().from(items).where(eq(items.id, id)).get();
    const itemTagRecords = getItemTags(db, id);

    return reply.status(201).send({ ...item, tags: itemTagRecords });
  });

  // GET /api/items
  app.get('/api/items', async (request, reply) => {
    const query = request.query as {
      type?: string;
      status?: string;
      project?: string;
      tag?: string;
      limit?: string;
      cursor?: string;
    };

    const limit = Math.min(parseInt(query.limit || String(DEFAULT_PAGE_LIMIT), 10), 100);
    const conditions: ReturnType<typeof eq>[] = [];

    if (query.type) conditions.push(eq(items.type, query.type));
    if (query.status) conditions.push(eq(items.status, query.status));
    if (query.project) conditions.push(eq(items.projectId, query.project));
    if (query.cursor) conditions.push(sql`${items.id} < ${query.cursor}`);

    const db = app.db;

    let result;
    if (query.tag) {
      // Join through item_tags to filter by tag
      const tagRecord = db
        .select()
        .from(tags)
        .where(eq(tags.name, query.tag.toLowerCase()))
        .get();

      if (!tagRecord) {
        return reply.send({ data: [], nextCursor: null });
      }

      const taggedItemIds = db
        .select({ itemId: itemTags.itemId })
        .from(itemTags)
        .where(eq(itemTags.tagId, tagRecord.id))
        .all()
        .map((r) => r.itemId);

      if (taggedItemIds.length === 0) {
        return reply.send({ data: [], nextCursor: null });
      }

      conditions.push(inArray(items.id, taggedItemIds));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    result = db
      .select()
      .from(items)
      .where(whereClause)
      .orderBy(desc(items.createdAt))
      .limit(limit + 1)
      .all();

    const hasMore = result.length > limit;
    if (hasMore) result = result.slice(0, limit);

    // Attach tags to each item
    const data = result.map((item) => ({
      ...item,
      tags: getItemTags(db, item.id),
    }));

    return reply.send({
      data,
      nextCursor: hasMore ? result[result.length - 1].id : null,
    });
  });

  // GET /api/items/:id
  app.get('/api/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const db = app.db;

    const item = db.select().from(items).where(eq(items.id, id)).get();

    if (!item) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Item not found' },
      });
    }

    const itemTagRecords = getItemTags(db, id);

    return reply.send({ ...item, tags: itemTagRecords });
  });
}

function upsertTags(db: any, tagNames: string[]) {
  const result: Array<{ id: string; name: string }> = [];

  for (const name of tagNames) {
    let tag = db.select().from(tags).where(eq(tags.name, name)).get();
    if (!tag) {
      const id = ulid();
      db.insert(tags).values({ id, name }).run();
      tag = { id, name };
    }
    result.push(tag);
  }

  return result;
}

function getItemTags(db: any, itemId: string) {
  return db
    .select({ id: tags.id, name: tags.name })
    .from(itemTags)
    .innerJoin(tags, eq(itemTags.tagId, tags.id))
    .where(eq(itemTags.itemId, itemId))
    .all();
}
```

**Step 4: Update apps/api/src/app.ts to register routes and support in-memory DB for tests**

Modify `apps/api/src/app.ts` — add route registration and support `migrate` option:

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createDb, createFtsTable } from '@grovsnotes/db';
import { config } from './config.js';
import { itemRoutes } from './routes/items.js';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';

declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof createDb>;
  }
}

export async function buildApp(overrides?: {
  databaseUrl?: string;
  migrate?: boolean;
}) {
  const dbPath = overrides?.databaseUrl || config.databaseUrl;
  const shouldMigrate = overrides?.migrate || false;

  const app = Fastify({
    logger: overrides?.databaseUrl === ':memory:' ? false : {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  await app.register(cors, {
    origin: config.corsOrigin,
  });

  // Database
  const db = createDb(dbPath);
  app.decorate('db', db);

  // For tests: run migrations and create FTS tables in-memory
  if (shouldMigrate) {
    const migrationsPath = new URL(
      '../../../packages/db/drizzle',
      import.meta.url
    ).pathname;
    migrate(db, { migrationsFolder: migrationsPath });

    // Create FTS table in-memory (we can't use createFtsTable because it opens a new connection)
    const rawDb = (db as any).session?.client as Database.Database;
    if (rawDb) {
      rawDb.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
          title, content, content='items', content_rowid='rowid'
        );
        CREATE TRIGGER IF NOT EXISTS items_fts_insert AFTER INSERT ON items BEGIN
          INSERT INTO items_fts(rowid, title, content) VALUES (NEW.rowid, NEW.title, NEW.content);
        END;
        CREATE TRIGGER IF NOT EXISTS items_fts_delete AFTER DELETE ON items BEGIN
          INSERT INTO items_fts(items_fts, rowid, title, content) VALUES('delete', OLD.rowid, OLD.title, OLD.content);
        END;
        CREATE TRIGGER IF NOT EXISTS items_fts_update AFTER UPDATE ON items BEGIN
          INSERT INTO items_fts(items_fts, rowid, title, content) VALUES('delete', OLD.rowid, OLD.title, OLD.content);
          INSERT INTO items_fts(rowid, title, content) VALUES (NEW.rowid, NEW.title, NEW.content);
        END;
      `);
    }
  }

  // Error handler
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  });

  // Health check
  app.get('/api/health', async () => ({ status: 'ok' }));

  // Routes
  await app.register(itemRoutes);

  return app;
}
```

**Step 5: Run tests**

Run: `cd apps/api && pnpm test -- src/routes/__tests__/items.test.ts`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add apps/api/src/routes/ apps/api/src/app.ts
git commit -m "feat: add items API routes (create, list, get) with hashtag parsing"
```

---

### Task 7: Items API Routes (Update, Delete)

**Files:**
- Modify: `apps/api/src/routes/items.ts`
- Modify: `apps/api/src/routes/__tests__/items.test.ts`

**Step 1: Add failing tests**

Append to `apps/api/src/routes/__tests__/items.test.ts`:

```typescript
  describe('PATCH /api/items/:id', () => {
    it('updates item title and re-parses hashtags', async () => {
      const app = await createTestApp();
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'old title #oldtag' },
      });
      const { id } = createRes.json();

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/items/${id}`,
        payload: { title: 'new title #newtag' },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.title).toBe('new title');
      expect(body.tags).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'newtag' })])
      );
      expect(body.tags).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'oldtag' })])
      );
    });

    it('updates status without affecting tags', async () => {
      const app = await createTestApp();
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'task #important' },
      });
      const { id } = createRes.json();

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/items/${id}`,
        payload: { status: 'doing' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().status).toBe('doing');
      expect(res.json().tags).toHaveLength(1);
    });

    it('returns 404 for unknown id', async () => {
      const app = await createTestApp();
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/items/nonexistent',
        payload: { title: 'new' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('deletes item and its tag associations', async () => {
      const app = await createTestApp();
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'to delete #temp' },
      });
      const { id } = createRes.json();

      const res = await app.inject({
        method: 'DELETE',
        url: `/api/items/${id}`,
      });

      expect(res.statusCode).toBe(204);

      const getRes = await app.inject({
        method: 'GET',
        url: `/api/items/${id}`,
      });
      expect(getRes.statusCode).toBe(404);
    });

    it('returns 404 for unknown id', async () => {
      const app = await createTestApp();
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/items/nonexistent',
      });
      expect(res.statusCode).toBe(404);
    });
  });
```

**Step 2: Run tests to verify new ones fail**

Run: `cd apps/api && pnpm test -- src/routes/__tests__/items.test.ts`
Expected: New tests FAIL

**Step 3: Add PATCH and DELETE to items routes**

Add to `apps/api/src/routes/items.ts` inside `itemRoutes`:

```typescript
  // PATCH /api/items/:id
  app.patch('/api/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      title?: string;
      content?: string;
      type?: ItemType;
      status?: ItemStatus;
      projectId?: string | null;
    };

    const db = app.db;
    const existing = db.select().from(items).where(eq(items.id, id)).get();

    if (!existing) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Item not found' },
      });
    }

    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };

    let titleChanged = false;
    if (body.title !== undefined) {
      const { cleanTitle, tags: parsedTags } = parseHashtags(body.title);
      updates.title = cleanTitle;
      titleChanged = true;

      // Re-sync tags
      db.delete(itemTags).where(eq(itemTags.itemId, id)).run();
      const tagRecords = upsertTags(db, parsedTags);
      for (const tag of tagRecords) {
        db.insert(itemTags).values({ itemId: id, tagId: tag.id }).run();
      }
    }
    if (body.content !== undefined) updates.content = body.content;
    if (body.type !== undefined) updates.type = body.type;
    if (body.status !== undefined) updates.status = body.status;
    if (body.projectId !== undefined) updates.projectId = body.projectId;

    db.update(items).set(updates).where(eq(items.id, id)).run();

    const updated = db.select().from(items).where(eq(items.id, id)).get();
    const itemTagRecords = getItemTags(db, id);

    return reply.send({ ...updated, tags: itemTagRecords });
  });

  // DELETE /api/items/:id
  app.delete('/api/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const db = app.db;

    const existing = db.select().from(items).where(eq(items.id, id)).get();

    if (!existing) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Item not found' },
      });
    }

    db.delete(itemTags).where(eq(itemTags.itemId, id)).run();
    db.delete(items).where(eq(items.id, id)).run();

    return reply.status(204).send();
  });
```

Note: `upsertTags` and `getItemTags` must be accessible — they should be module-level functions (already are from Task 6).

**Step 4: Run tests**

Run: `cd apps/api && pnpm test -- src/routes/__tests__/items.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add apps/api/src/routes/
git commit -m "feat: add items update and delete API routes"
```

---

### Task 8: Projects API Routes

**Files:**
- Create: `apps/api/src/routes/projects.ts`
- Create: `apps/api/src/routes/__tests__/projects.test.ts`
- Modify: `apps/api/src/app.ts` (register projects routes)

**Step 1: Write failing tests**

```typescript
// apps/api/src/routes/__tests__/projects.test.ts
import { describe, it, expect } from 'vitest';
import { buildApp } from '../../app.js';

async function createTestApp() {
  return buildApp({ databaseUrl: ':memory:', migrate: true });
}

describe('Projects API', () => {
  describe('POST /api/projects', () => {
    it('creates a project', async () => {
      const app = await createTestApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/projects',
        payload: { name: 'ATP', color: '#3b82f6', icon: 'tennis' },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.name).toBe('ATP');
      expect(body.color).toBe('#3b82f6');
      expect(body.id).toBeDefined();
    });

    it('rejects empty name', async () => {
      const app = await createTestApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/projects',
        payload: { name: '' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/projects', () => {
    it('returns projects with item count', async () => {
      const app = await createTestApp();

      const projectRes = await app.inject({
        method: 'POST',
        url: '/api/projects',
        payload: { name: 'ATP' },
      });
      const projectId = projectRes.json().id;

      await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'item 1', projectId },
      });
      await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'item 2', projectId },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/projects',
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveLength(1);
      expect(body[0].name).toBe('ATP');
      expect(body[0].itemCount).toBe(2);
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('updates project name', async () => {
      const app = await createTestApp();
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/projects',
        payload: { name: 'Old Name' },
      });
      const { id } = createRes.json();

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/projects/${id}`,
        payload: { name: 'New Name' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().name).toBe('New Name');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('deletes project and nullifies items', async () => {
      const app = await createTestApp();
      const projectRes = await app.inject({
        method: 'POST',
        url: '/api/projects',
        payload: { name: 'To Delete' },
      });
      const projectId = projectRes.json().id;

      await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title: 'linked item', projectId },
      });

      const deleteRes = await app.inject({
        method: 'DELETE',
        url: `/api/projects/${projectId}`,
      });
      expect(deleteRes.statusCode).toBe(204);

      // Item should still exist but with null project
      const itemsRes = await app.inject({
        method: 'GET',
        url: '/api/items',
      });
      expect(itemsRes.json().data[0].projectId).toBeNull();
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd apps/api && pnpm test -- src/routes/__tests__/projects.test.ts`
Expected: FAIL

**Step 3: Implement projects routes**

```typescript
// apps/api/src/routes/projects.ts
import { FastifyInstance } from 'fastify';
import { eq, sql } from 'drizzle-orm';
import { projects, items } from '@grovsnotes/db';
import { ulid } from 'ulid';

export async function projectRoutes(app: FastifyInstance) {
  // POST /api/projects
  app.post('/api/projects', async (request, reply) => {
    const { name, color, icon } = request.body as {
      name?: string;
      color?: string;
      icon?: string;
    };

    if (!name || name.trim() === '') {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Name is required' },
      });
    }

    const id = ulid();
    const db = app.db;

    db.insert(projects)
      .values({ id, name: name.trim(), color: color || null, icon: icon || null })
      .run();

    const project = db.select().from(projects).where(eq(projects.id, id)).get();
    return reply.status(201).send(project);
  });

  // GET /api/projects
  app.get('/api/projects', async (request, reply) => {
    const db = app.db;

    const result = db
      .select({
        id: projects.id,
        name: projects.name,
        color: projects.color,
        icon: projects.icon,
        itemCount: sql<number>`count(${items.id})`.as('item_count'),
      })
      .from(projects)
      .leftJoin(items, eq(items.projectId, projects.id))
      .groupBy(projects.id)
      .all();

    return reply.send(result);
  });

  // PATCH /api/projects/:id
  app.patch('/api/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string;
      color?: string;
      icon?: string;
    };

    const db = app.db;
    const existing = db.select().from(projects).where(eq(projects.id, id)).get();

    if (!existing) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Project not found' },
      });
    }

    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.color !== undefined) updates.color = body.color;
    if (body.icon !== undefined) updates.icon = body.icon;

    db.update(projects).set(updates).where(eq(projects.id, id)).run();

    const updated = db.select().from(projects).where(eq(projects.id, id)).get();
    return reply.send(updated);
  });

  // DELETE /api/projects/:id
  app.delete('/api/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const db = app.db;

    const existing = db.select().from(projects).where(eq(projects.id, id)).get();

    if (!existing) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Project not found' },
      });
    }

    // Nullify items' projectId (handled by FK onDelete: 'set null' but let's be explicit)
    db.update(items)
      .set({ projectId: null })
      .where(eq(items.projectId, id))
      .run();

    db.delete(projects).where(eq(projects.id, id)).run();

    return reply.status(204).send();
  });
}
```

**Step 4: Register in app.ts**

Add import and registration to `apps/api/src/app.ts`:

```typescript
import { projectRoutes } from './routes/projects.js';
// ... inside buildApp, after itemRoutes registration:
await app.register(projectRoutes);
```

**Step 5: Run tests**

Run: `cd apps/api && pnpm test -- src/routes/__tests__/projects.test.ts`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add apps/api/src/routes/ apps/api/src/app.ts
git commit -m "feat: add projects API routes (CRUD with item count)"
```

---

### Task 9: Dev Logs API Routes with API Key Auth

**Files:**
- Create: `apps/api/src/routes/dev-logs.ts`
- Create: `apps/api/src/routes/__tests__/dev-logs.test.ts`
- Modify: `apps/api/src/app.ts` (register dev-logs routes)

**Step 1: Write failing tests**

```typescript
// apps/api/src/routes/__tests__/dev-logs.test.ts
import { describe, it, expect } from 'vitest';
import { buildApp } from '../../app.js';

async function createTestApp(apiKey = 'test-key') {
  return buildApp({ databaseUrl: ':memory:', migrate: true, apiKey });
}

describe('Dev Logs API', () => {
  describe('POST /api/dev-logs', () => {
    it('creates a dev log with valid API key', async () => {
      const app = await createTestApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/dev-logs',
        headers: { 'x-api-key': 'test-key' },
        payload: {
          repo: 'grovsnotes',
          branch: 'main',
          commitHash: 'abc123def456',
          message: 'feat: add items',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.repo).toBe('grovsnotes');
      expect(body.message).toBe('feat: add items');
      expect(body.id).toBeDefined();
    });

    it('rejects request without API key', async () => {
      const app = await createTestApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/dev-logs',
        payload: {
          repo: 'test',
          branch: 'main',
          commitHash: 'abc',
          message: 'test',
        },
      });

      expect(res.statusCode).toBe(401);
    });

    it('rejects request with wrong API key', async () => {
      const app = await createTestApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/dev-logs',
        headers: { 'x-api-key': 'wrong-key' },
        payload: {
          repo: 'test',
          branch: 'main',
          commitHash: 'abc',
          message: 'test',
        },
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/dev-logs', () => {
    it('returns dev logs sorted by created_at desc', async () => {
      const app = await createTestApp();

      await app.inject({
        method: 'POST',
        url: '/api/dev-logs',
        headers: { 'x-api-key': 'test-key' },
        payload: { repo: 'r', branch: 'main', commitHash: 'a', message: 'first' },
      });
      await app.inject({
        method: 'POST',
        url: '/api/dev-logs',
        headers: { 'x-api-key': 'test-key' },
        payload: { repo: 'r', branch: 'main', commitHash: 'b', message: 'second' },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/dev-logs',
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toHaveLength(2);
      expect(body.data[0].message).toBe('second');
    });

    it('filters by repo', async () => {
      const app = await createTestApp();
      const headers = { 'x-api-key': 'test-key' };

      await app.inject({
        method: 'POST',
        url: '/api/dev-logs',
        headers,
        payload: { repo: 'atp', branch: 'main', commitHash: 'a', message: 'a' },
      });
      await app.inject({
        method: 'POST',
        url: '/api/dev-logs',
        headers,
        payload: { repo: 'supercopa', branch: 'main', commitHash: 'b', message: 'b' },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/dev-logs?repo=atp',
      });

      expect(res.json().data).toHaveLength(1);
      expect(res.json().data[0].repo).toBe('atp');
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd apps/api && pnpm test -- src/routes/__tests__/dev-logs.test.ts`
Expected: FAIL

**Step 3: Implement dev-logs routes**

```typescript
// apps/api/src/routes/dev-logs.ts
import { FastifyInstance } from 'fastify';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { devLogs } from '@grovsnotes/db';
import { ulid } from 'ulid';
import { DEFAULT_PAGE_LIMIT } from '@grovsnotes/shared';

export async function devLogRoutes(app: FastifyInstance) {
  // POST /api/dev-logs (requires API key)
  app.post('/api/dev-logs', async (request, reply) => {
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || apiKey !== app.apiKey) {
      return reply.status(401).send({
        error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' },
      });
    }

    const { repo, branch, commitHash, message } = request.body as {
      repo: string;
      branch: string;
      commitHash: string;
      message: string;
    };

    if (!repo || !branch || !commitHash || !message) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'repo, branch, commitHash, and message are required',
        },
      });
    }

    const id = ulid();
    const now = new Date().toISOString();
    const db = app.db;

    db.insert(devLogs)
      .values({ id, repo, branch, commitHash, message, createdAt: now })
      .run();

    const entry = db.select().from(devLogs).where(eq(devLogs.id, id)).get();
    return reply.status(201).send(entry);
  });

  // GET /api/dev-logs
  app.get('/api/dev-logs', async (request, reply) => {
    const query = request.query as {
      repo?: string;
      branch?: string;
      from?: string;
      to?: string;
      limit?: string;
      cursor?: string;
    };

    const db = app.db;
    const limit = Math.min(
      parseInt(query.limit || String(DEFAULT_PAGE_LIMIT), 10),
      100
    );
    const conditions: ReturnType<typeof eq>[] = [];

    if (query.repo) conditions.push(eq(devLogs.repo, query.repo));
    if (query.branch) conditions.push(eq(devLogs.branch, query.branch));
    if (query.from) conditions.push(gte(devLogs.createdAt, query.from));
    if (query.to) conditions.push(lte(devLogs.createdAt, query.to));
    if (query.cursor) conditions.push(sql`${devLogs.id} < ${query.cursor}`);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let result = db
      .select()
      .from(devLogs)
      .where(whereClause)
      .orderBy(desc(devLogs.createdAt))
      .limit(limit + 1)
      .all();

    const hasMore = result.length > limit;
    if (hasMore) result = result.slice(0, limit);

    return reply.send({
      data: result,
      nextCursor: hasMore ? result[result.length - 1].id : null,
    });
  });
}
```

**Step 4: Update buildApp to accept apiKey override and decorate**

Add to `apps/api/src/app.ts`:
- Add `apiKey` to overrides type
- Add `app.decorate('apiKey', overrides?.apiKey || config.apiKey);`
- Register devLogRoutes
- Update FastifyInstance declaration to include `apiKey: string`

```typescript
declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof createDb>;
    apiKey: string;
  }
}
```

And in `buildApp`:
```typescript
app.decorate('apiKey', overrides?.apiKey || config.apiKey);
```

And register:
```typescript
import { devLogRoutes } from './routes/dev-logs.js';
// ...
await app.register(devLogRoutes);
```

**Step 5: Run tests**

Run: `cd apps/api && pnpm test -- src/routes/__tests__/dev-logs.test.ts`
Expected: All tests PASS

**Step 6: Run all API tests**

Run: `cd apps/api && pnpm test`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add apps/api/src/
git commit -m "feat: add dev-logs API routes with API key authentication"
```

---

### Task 10: Search API Route (FTS5)

**Files:**
- Create: `apps/api/src/routes/search.ts`
- Create: `apps/api/src/routes/__tests__/search.test.ts`
- Create: `apps/api/src/lib/search-parser.ts`
- Create: `apps/api/src/lib/__tests__/search-parser.test.ts`
- Modify: `apps/api/src/app.ts` (register search routes)

**Step 1: Write search parser tests**

```typescript
// apps/api/src/lib/__tests__/search-parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseSearchQuery } from '../search-parser.js';

describe('parseSearchQuery', () => {
  it('parses plain text', () => {
    expect(parseSearchQuery('hello world')).toEqual({
      text: 'hello world',
      filters: {},
    });
  });

  it('parses type filter', () => {
    expect(parseSearchQuery('type:idea')).toEqual({
      text: '',
      filters: { type: 'idea' },
    });
  });

  it('parses project filter', () => {
    expect(parseSearchQuery('project:ATP')).toEqual({
      text: '',
      filters: { project: 'ATP' },
    });
  });

  it('parses tag filter', () => {
    expect(parseSearchQuery('tag:urgent')).toEqual({
      text: '',
      filters: { tag: 'urgent' },
    });
  });

  it('parses mixed text and filters', () => {
    expect(parseSearchQuery('elo ranking type:idea project:ATP')).toEqual({
      text: 'elo ranking',
      filters: { type: 'idea', project: 'ATP' },
    });
  });

  it('handles empty string', () => {
    expect(parseSearchQuery('')).toEqual({
      text: '',
      filters: {},
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd apps/api && pnpm test -- src/lib/__tests__/search-parser.test.ts`
Expected: FAIL

**Step 3: Implement search parser**

```typescript
// apps/api/src/lib/search-parser.ts
export interface ParsedSearch {
  text: string;
  filters: {
    type?: string;
    project?: string;
    tag?: string;
  };
}

const FILTER_PATTERN = /\b(type|project|tag):(\S+)/g;

export function parseSearchQuery(query: string): ParsedSearch {
  const filters: ParsedSearch['filters'] = {};
  let text = query;

  let match: RegExpExecArray | null;
  while ((match = FILTER_PATTERN.exec(query)) !== null) {
    const [, key, value] = match;
    filters[key as keyof typeof filters] = value;
  }

  text = query.replace(FILTER_PATTERN, '').replace(/\s+/g, ' ').trim();

  return { text, filters };
}
```

**Step 4: Run parser tests**

Run: `cd apps/api && pnpm test -- src/lib/__tests__/search-parser.test.ts`
Expected: All tests PASS

**Step 5: Write search route tests**

```typescript
// apps/api/src/routes/__tests__/search.test.ts
import { describe, it, expect } from 'vitest';
import { buildApp } from '../../app.js';

async function createTestApp() {
  return buildApp({ databaseUrl: ':memory:', migrate: true, apiKey: 'key' });
}

describe('Search API', () => {
  it('searches items by full text', async () => {
    const app = await createTestApp();

    await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'add elo ranking system' },
    });
    await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'fix login page' },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=elo',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].title).toBe('add elo ranking system');
  });

  it('filters by type', async () => {
    const app = await createTestApp();

    await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'idea one' },
    });
    await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'task one', type: 'task' },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=type:task',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().items).toHaveLength(1);
    expect(res.json().items[0].title).toBe('task one');
  });

  it('combines text search with filters', async () => {
    const app = await createTestApp();

    await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'elo idea', type: 'idea' },
    });
    await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'elo task', type: 'task' },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=elo type:task',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().items).toHaveLength(1);
    expect(res.json().items[0].title).toBe('elo task');
  });

  it('returns empty results for no match', async () => {
    const app = await createTestApp();

    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=nonexistent',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().items).toHaveLength(0);
  });
});
```

**Step 6: Run search route tests to verify they fail**

Run: `cd apps/api && pnpm test -- src/routes/__tests__/search.test.ts`
Expected: FAIL

**Step 7: Implement search route**

```typescript
// apps/api/src/routes/search.ts
import { FastifyInstance } from 'fastify';
import { eq, desc, and, inArray, sql } from 'drizzle-orm';
import { items, tags, itemTags } from '@grovsnotes/db';
import { parseSearchQuery } from '../lib/search-parser.js';

export async function searchRoutes(app: FastifyInstance) {
  app.get('/api/search', async (request, reply) => {
    const { q } = request.query as { q?: string };

    if (!q || q.trim() === '') {
      return reply.send({ items: [], devLogs: [] });
    }

    const { text, filters } = parseSearchQuery(q);
    const db = app.db;
    const conditions: any[] = [];

    // Full-text search via FTS5
    let ftsItemIds: string[] | null = null;
    if (text) {
      const rawDb = (db as any).session?.client;
      if (rawDb) {
        const ftsResults = rawDb
          .prepare(
            `SELECT i.id FROM items i
             INNER JOIN items_fts ON items_fts.rowid = i.rowid
             WHERE items_fts MATCH ?
             ORDER BY rank`
          )
          .all(text) as Array<{ id: string }>;
        ftsItemIds = ftsResults.map((r) => r.id);

        if (ftsItemIds.length === 0) {
          return reply.send({ items: [], devLogs: [] });
        }
        conditions.push(inArray(items.id, ftsItemIds));
      }
    }

    // Apply filters
    if (filters.type) conditions.push(eq(items.type, filters.type));
    if (filters.project) {
      conditions.push(eq(items.projectId, filters.project));
    }
    if (filters.tag) {
      const tagRecord = db
        .select()
        .from(tags)
        .where(eq(tags.name, filters.tag.toLowerCase()))
        .get();

      if (!tagRecord) {
        return reply.send({ items: [], devLogs: [] });
      }

      const taggedIds = db
        .select({ itemId: itemTags.itemId })
        .from(itemTags)
        .where(eq(itemTags.tagId, tagRecord.id))
        .all()
        .map((r) => r.itemId);

      if (taggedIds.length === 0) {
        return reply.send({ items: [], devLogs: [] });
      }
      conditions.push(inArray(items.id, taggedIds));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const matchedItems = db
      .select()
      .from(items)
      .where(whereClause)
      .orderBy(desc(items.createdAt))
      .limit(50)
      .all();

    return reply.send({
      items: matchedItems,
      devLogs: [], // Dev logs search can be added later
    });
  });
}
```

**Step 8: Register in app.ts**

```typescript
import { searchRoutes } from './routes/search.js';
// ...
await app.register(searchRoutes);
```

**Step 9: Run tests**

Run: `cd apps/api && pnpm test -- src/routes/__tests__/search.test.ts`
Expected: All tests PASS

**Step 10: Run all API tests**

Run: `cd apps/api && pnpm test`
Expected: All tests PASS

**Step 11: Commit**

```bash
git add apps/api/src/
git commit -m "feat: add unified search API with FTS5 and query syntax parsing"
```

---

## Phase 3: Frontend Application

### Task 11: Scaffold React + Vite App with Tailwind and shadcn/ui

**Files:**
- Create: `apps/web/` (via Vite scaffold)
- Configure: Tailwind, shadcn/ui, path aliases

**Step 1: Scaffold Vite React TypeScript project**

Run from project root:
```bash
cd apps && pnpm create vite web --template react-ts
```

**Step 2: Install dependencies**

```bash
cd apps/web && pnpm add @tanstack/react-query react-router-dom framer-motion
pnpm add -D tailwindcss @tailwindcss/vite
```

**Step 3: Configure Tailwind**

Add Tailwind to `apps/web/src/index.css`:
```css
@import "tailwindcss";
```

Update `apps/web/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

**Step 4: Initialize shadcn/ui**

Run: `cd apps/web && pnpm dlx shadcn@latest init`

Select: New York style, Zinc base color, CSS variables.

**Step 5: Add initial shadcn components**

```bash
cd apps/web && pnpm dlx shadcn@latest add button input badge card toast sonner
```

**Step 6: Clean up default Vite files**

Remove `apps/web/src/App.css`, update `apps/web/src/App.tsx` to a minimal shell:

```tsx
// apps/web/src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<div>GrovsNotes</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

**Step 7: Verify dev server runs**

Run: `cd apps/web && pnpm dev` (start, verify in browser, Ctrl+C)

**Step 8: Commit**

```bash
git add apps/web/
git commit -m "feat: scaffold React frontend with Vite, Tailwind, shadcn/ui, React Query"
```

---

### Task 12: API Client Library

**Files:**
- Create: `apps/web/src/lib/api.ts`

**Step 1: Create API client**

```typescript
// apps/web/src/lib/api.ts
import type {
  Item,
  ItemWithTags,
  Project,
  ProjectWithCount,
  DevLog,
  PaginatedResponse,
  ItemType,
  ItemStatus,
} from '@grovsnotes/shared';

const BASE_URL = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Items
export const api = {
  items: {
    create(data: { title: string; content?: string; type?: ItemType; projectId?: string }) {
      return request<ItemWithTags>('/items', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    list(params?: {
      type?: ItemType;
      status?: ItemStatus;
      project?: string;
      tag?: string;
      limit?: number;
      cursor?: string;
    }) {
      const search = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) search.set(key, String(value));
        });
      }
      const qs = search.toString();
      return request<PaginatedResponse<ItemWithTags>>(`/items${qs ? `?${qs}` : ''}`);
    },

    get(id: string) {
      return request<ItemWithTags>(`/items/${id}`);
    },

    update(
      id: string,
      data: Partial<{
        title: string;
        content: string;
        type: ItemType;
        status: ItemStatus;
        projectId: string | null;
      }>
    ) {
      return request<ItemWithTags>(`/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete(id: string) {
      return request<void>(`/items/${id}`, { method: 'DELETE' });
    },
  },

  projects: {
    list() {
      return request<ProjectWithCount[]>('/projects');
    },

    create(data: { name: string; color?: string; icon?: string }) {
      return request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update(id: string, data: Partial<{ name: string; color: string; icon: string }>) {
      return request<Project>(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete(id: string) {
      return request<void>(`/projects/${id}`, { method: 'DELETE' });
    },
  },

  devLogs: {
    list(params?: { repo?: string; branch?: string; from?: string; to?: string }) {
      const search = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) search.set(key, String(value));
        });
      }
      const qs = search.toString();
      return request<PaginatedResponse<DevLog>>(`/dev-logs${qs ? `?${qs}` : ''}`);
    },
  },

  search(q: string) {
    return request<{ items: Item[]; devLogs: DevLog[] }>(
      `/search?q=${encodeURIComponent(q)}`
    );
  },
};
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/api.ts
git commit -m "feat: add typed API client for frontend"
```

---

### Task 13: React Query Hooks

**Files:**
- Create: `apps/web/src/hooks/use-items.ts`
- Create: `apps/web/src/hooks/use-projects.ts`
- Create: `apps/web/src/hooks/use-dev-logs.ts`
- Create: `apps/web/src/hooks/use-search.ts`

**Step 1: Create items hooks**

```typescript
// apps/web/src/hooks/use-items.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ItemType, ItemStatus } from '@grovsnotes/shared';

export function useItems(params?: {
  type?: ItemType;
  status?: ItemStatus;
  project?: string;
  tag?: string;
}) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => api.items.list(params),
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => api.items.get(id),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.items.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof api.items.update>[1]) =>
      api.items.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.items.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
```

**Step 2: Create projects hooks**

```typescript
// apps/web/src/hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: api.projects.list,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.projects.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
```

**Step 3: Create dev logs hooks**

```typescript
// apps/web/src/hooks/use-dev-logs.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDevLogs(params?: {
  repo?: string;
  branch?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: ['devLogs', params],
    queryFn: () => api.devLogs.list(params),
  });
}
```

**Step 4: Create search hook**

```typescript
// apps/web/src/hooks/use-search.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.search(query),
    enabled: query.trim().length > 0,
  });
}
```

**Step 5: Commit**

```bash
git add apps/web/src/hooks/
git commit -m "feat: add React Query hooks for items, projects, dev logs, search"
```

---

### Task 14: Layout Shell and Navigation

**Files:**
- Create: `apps/web/src/components/layout/app-shell.tsx`
- Create: `apps/web/src/components/layout/bottom-nav.tsx`
- Modify: `apps/web/src/App.tsx`

**Step 1: Create bottom navigation**

```tsx
// apps/web/src/components/layout/bottom-nav.tsx
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Capture', icon: '+" },
  { to: '/inbox', label: 'Inbox', icon: 'tray' },
  { to: '/projects', label: 'Projects', icon: 'folder' },
  { to: '/search', label: 'Search', icon: 'search' },
  { to: '/timeline', label: 'Timeline', icon: 'clock' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <span className="text-lg">{item.icon === '+' ? '+' : item.icon === 'tray' ? '\u2709' : item.icon === 'folder' ? '\uD83D\uDCC1' : item.icon === 'search' ? '\uD83D\uDD0D' : '\u23F0'}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
```

Note: Replace emoji placeholders with proper Lucide icons from shadcn/ui in the actual implementation. Install `lucide-react` and use `<Plus />`, `<Inbox />`, `<FolderOpen />`, `<Search />`, `<Clock />`.

**Step 2: Create app shell**

```tsx
// apps/web/src/components/layout/app-shell.tsx
import { Outlet } from 'react-router-dom';
import { BottomNav } from './bottom-nav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="max-w-lg mx-auto px-4 py-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
```

**Step 3: Update App.tsx with routes**

```tsx
// apps/web/src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, retry: 1 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<div>Capture</div>} />
            <Route path="/inbox" element={<div>Inbox</div>} />
            <Route path="/projects" element={<div>Projects</div>} />
            <Route path="/search" element={<div>Search</div>} />
            <Route path="/timeline" element={<div>Timeline</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
```

**Step 4: Install lucide-react**

Run: `cd apps/web && pnpm add lucide-react`

**Step 5: Verify dev server renders the shell**

Run: `cd apps/web && pnpm dev`

**Step 6: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add app shell layout with bottom navigation and routing"
```

---

### Task 15: Quick Capture Component

**Files:**
- Create: `apps/web/src/components/capture/capture-input.tsx`
- Create: `apps/web/src/routes/capture-page.tsx`
- Modify: `apps/web/src/App.tsx` (wire up route)

**Step 1: Create capture input component**

```tsx
// apps/web/src/components/capture/capture-input.tsx
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useCreateItem } from '@/hooks/use-items';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function CaptureInput() {
  const [value, setValue] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const createItem = useCreateItem();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    try {
      await createItem.mutateAsync({ title: trimmed });
      setLastSaved(trimmed);
      setValue('');
      setTimeout(() => setLastSaved(null), 2000);
    } catch (err) {
      toast.error('Failed to save item');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-2xl font-bold tracking-tight">GrovsNotes</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What's on your mind? #tags work too"
          className="text-lg h-12"
          disabled={createItem.isPending}
        />
      </form>
      <AnimatePresence>
        {lastSaved && (
          <motion.p
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="text-sm text-muted-foreground"
          >
            Saved: {lastSaved}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 2: Create capture page route**

```tsx
// apps/web/src/routes/capture-page.tsx
import { CaptureInput } from '@/components/capture/capture-input';

export function CapturePage() {
  return <CaptureInput />;
}
```

**Step 3: Wire up in App.tsx**

Replace `<div>Capture</div>` with `<CapturePage />`, import from `@/routes/capture-page`.

**Step 4: Verify in browser**

Run both API and web dev servers. Type a note and press Enter. Confirm it saves.

**Step 5: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add quick capture input component with animation feedback"
```

---

### Task 16: Inbox View

**Files:**
- Create: `apps/web/src/components/inbox/inbox-list.tsx`
- Create: `apps/web/src/components/items/item-card.tsx`
- Create: `apps/web/src/routes/inbox-page.tsx`
- Modify: `apps/web/src/App.tsx`

**Step 1: Create item card component**

```tsx
// apps/web/src/components/items/item-card.tsx
import { Badge } from '@/components/ui/badge';
import type { ItemWithTags } from '@grovsnotes/shared';

interface ItemCardProps {
  item: ItemWithTags;
  onClick?: (item: ItemWithTags) => void;
}

const typeIcons: Record<string, string> = {
  idea: '\uD83D\uDCA1',
  task: '\u2705',
  note: '\uD83D\uDCDD',
  bug: '\uD83D\uDC1B',
  research: '\uD83D\uDD2C',
};

export function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <button
      onClick={() => onClick?.(item)}
      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start gap-2">
        <span className="text-sm">{typeIcons[item.type] || '\uD83D\uDCDD'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{item.title}</p>
          {item.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {item.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </button>
  );
}
```

**Step 2: Create inbox list**

```tsx
// apps/web/src/components/inbox/inbox-list.tsx
import { useItems } from '@/hooks/use-items';
import { ItemCard } from '@/components/items/item-card';

export function InboxList() {
  const { data, isLoading, error } = useItems({ status: 'inbox' });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-destructive">Error loading inbox</p>;

  const items = data?.data || [];

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        Inbox is empty. Capture something!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

**Step 3: Create inbox page**

```tsx
// apps/web/src/routes/inbox-page.tsx
import { InboxList } from '@/components/inbox/inbox-list';

export function InboxPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Inbox</h2>
      <InboxList />
    </div>
  );
}
```

**Step 4: Wire up route in App.tsx**

**Step 5: Verify in browser**

**Step 6: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add inbox view with item cards showing type icons and tags"
```

---

### Task 17: Item Detail / Edit View

**Files:**
- Create: `apps/web/src/components/items/item-detail.tsx`
- Create: `apps/web/src/routes/item-page.tsx`
- Modify: `apps/web/src/App.tsx` (add route `/items/:id`)

This component allows editing title, content, type, status, and project for an item. Use shadcn/ui `Select` for type/status dropdowns. Include a delete button with confirmation.

**Step 1: Install shadcn select component**

Run: `cd apps/web && pnpm dlx shadcn@latest add select textarea dialog`

**Step 2: Create item detail component with edit form**

The component should:
- Load item by ID via `useItem(id)`
- Inline-editable title
- Textarea for content
- Select dropdowns for type and status
- Project selector
- Save on change (debounced or on blur)
- Delete button with confirmation dialog

**Step 3: Create route page, wire to `/items/:id`**

**Step 4: Update ItemCard to navigate to `/items/:id` on click**

**Step 5: Verify in browser**

**Step 6: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add item detail view with inline editing"
```

---

### Task 18: Projects View

**Files:**
- Create: `apps/web/src/components/projects/project-list.tsx`
- Create: `apps/web/src/components/projects/project-items.tsx`
- Create: `apps/web/src/routes/projects-page.tsx`
- Create: `apps/web/src/routes/project-detail-page.tsx`
- Modify: `apps/web/src/App.tsx`

**Step 1: Create project list component**

Show all projects with item count, color indicator. Click to navigate to `/projects/:id`.

**Step 2: Create project items view**

Show items filtered by project. Reuse ItemCard.

**Step 3: Add "New Project" form (inline or dialog)**

**Step 4: Wire up routes**

**Step 5: Verify in browser**

**Step 6: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add projects view with project list and item filtering"
```

---

### Task 19: Search View

**Files:**
- Create: `apps/web/src/components/search/search-view.tsx`
- Create: `apps/web/src/routes/search-page.tsx`
- Modify: `apps/web/src/App.tsx`

**Step 1: Create search view component**

- Single input field
- Debounced query (300ms) using `useSearch` hook
- Show results as ItemCard list
- Show query syntax help text: `type:idea`, `project:ATP`, `tag:urgent`

**Step 2: Wire up route**

**Step 3: Verify in browser with both FTS and filter queries**

**Step 4: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add search view with debounced full-text and filter search"
```

---

### Task 20: Dev Timeline View

**Files:**
- Create: `apps/web/src/components/timeline/timeline-view.tsx`
- Create: `apps/web/src/routes/timeline-page.tsx`
- Modify: `apps/web/src/App.tsx`

**Step 1: Create timeline view**

- Fetch both items and dev logs
- Merge and sort chronologically by `createdAt`
- Visual distinction: git icon for commits, type icon for items
- Date headers for grouping
- Repo/branch filter dropdown

**Step 2: Wire up route**

**Step 3: Verify with sample data**

**Step 4: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add dev timeline view with mixed items and commit log"
```

---

## Phase 4: PWA & Polish

### Task 21: PWA Setup with Offline Capture

**Files:**
- Install: `vite-plugin-pwa`
- Create: `apps/web/src/sw/offline-queue.ts`
- Modify: `apps/web/vite.config.ts`
- Create: `apps/web/public/manifest.json` icons

**Step 1: Install vite-plugin-pwa**

Run: `cd apps/web && pnpm add -D vite-plugin-pwa`

**Step 2: Configure PWA plugin in vite.config.ts**

Add VitePWA plugin with:
- `registerType: 'autoUpdate'`
- Manifest: name, short_name, theme_color, display: standalone
- Workbox: precache app shell

**Step 3: Create offline capture queue**

```typescript
// apps/web/src/sw/offline-queue.ts
const QUEUE_KEY = 'grovsnotes_offline_queue';

export function getOfflineQueue(): Array<{ title: string }> {
  const raw = localStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addToOfflineQueue(item: { title: string }) {
  const queue = getOfflineQueue();
  queue.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export async function syncOfflineQueue(
  createFn: (data: { title: string }) => Promise<unknown>
) {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  for (const item of queue) {
    await createFn(item);
  }
  clearOfflineQueue();
}
```

**Step 4: Update CaptureInput to use offline queue when navigator.onLine is false**

**Step 5: Add sync-on-reconnect logic (window `online` event)**

**Step 6: Add pending sync count indicator**

**Step 7: Verify offline behavior**

- Open app, go offline (DevTools), capture item, verify queued
- Go back online, verify sync

**Step 8: Commit**

```bash
git add apps/web/
git commit -m "feat: add PWA configuration with offline capture queue"
```

---

### Task 22: Git Post-Commit Hook Script

**Files:**
- Create: `scripts/post-commit`
- Create: `scripts/install-hook.sh`

**Step 1: Create the post-commit hook**

```bash
#!/bin/sh
# scripts/post-commit
# GrovsNotes post-commit hook — sends commit data to the API

GROVSNOTES_URL="${GROVSNOTES_URL:-http://localhost:3000}"

if [ -z "$GROVSNOTES_API_KEY" ]; then
  exit 0
fi

REPO=$(basename "$(git rev-parse --show-toplevel)")
BRANCH=$(git rev-parse --abbrev-ref HEAD)
HASH=$(git rev-parse HEAD)
MSG=$(git log -1 --pretty=%B)

curl -s -X POST "$GROVSNOTES_URL/api/dev-logs" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $GROVSNOTES_API_KEY" \
  -d "{\"repo\":\"$REPO\",\"branch\":\"$BRANCH\",\"commit_hash\":\"$HASH\",\"message\":$(echo "$MSG" | jq -Rs .)}" \
  > /dev/null 2>&1 &
```

Note: The hook runs curl in background (`&`) so it doesn't slow down commits. Uses `jq` to properly escape the commit message JSON.

**Step 2: Create install script**

```bash
#!/bin/sh
# scripts/install-hook.sh
# Install GrovsNotes post-commit hook in a repo

TARGET="${1:-.}"
HOOK_DIR="$TARGET/.git/hooks"

if [ ! -d "$HOOK_DIR" ]; then
  echo "Error: $TARGET is not a git repository"
  exit 1
fi

cp "$(dirname "$0")/post-commit" "$HOOK_DIR/post-commit"
chmod +x "$HOOK_DIR/post-commit"
echo "GrovsNotes post-commit hook installed in $TARGET"
```

**Step 3: Make scripts executable**

Run: `chmod +x scripts/post-commit scripts/install-hook.sh`

**Step 4: Commit**

```bash
git add scripts/
git commit -m "feat: add git post-commit hook and install script"
```

---

### Task 23: Drizzle Migrations Runner for Production

**Files:**
- Modify: `apps/api/src/index.ts` (run migrations on startup)

**Step 1: Add migration run to server startup**

Update `apps/api/src/index.ts` to run Drizzle migrations before starting the server, so the database is always up-to-date on deploy.

```typescript
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
// ...
// After createDb, before createFtsTable:
const db = createDb(config.databaseUrl);
migrate(db, { migrationsFolder: './drizzle' });
```

Note: For production, migration files must be bundled/copied to the deploy target.

**Step 2: Verify server starts cleanly with fresh DB**

Run: `rm -f apps/api/data/grovsnotes.db && cd apps/api && pnpm dev`

**Step 3: Commit**

```bash
git add apps/api/src/index.ts
git commit -m "feat: run database migrations on API startup"
```

---

### Task 24: Final Integration Test

**Step 1: Start both API and web dev servers**

Run in separate terminals:
```bash
cd apps/api && pnpm dev
cd apps/web && pnpm dev
```

**Step 2: Manual smoke test checklist**

- [ ] Capture: type text + hashtags, press Enter, confirm saved
- [ ] Inbox: navigate to inbox, see captured items
- [ ] Item detail: click item, edit type/status, verify persisted
- [ ] Projects: create project, assign item to project
- [ ] Search: search by text, by `type:task`, by `tag:name`
- [ ] Timeline: verify commits appear (if hook installed)
- [ ] PWA: check manifest loads, installable prompt appears
- [ ] Offline: go offline, capture item, go online, verify sync

**Step 3: Run all tests**

Run: `pnpm test`
Expected: All tests PASS

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final integration verification"
```

---

## Summary

| Phase | Tasks | Description |
|---|---|---|
| 1 | Tasks 1-3 | Monorepo scaffold, shared types, database schema |
| 2 | Tasks 4-10 | Fastify API with all CRUD routes and search |
| 3 | Tasks 11-20 | React frontend with all views and components |
| 4 | Tasks 21-24 | PWA, git hook, migrations, integration test |

Total: 24 tasks. Each task has explicit file paths, code, test commands, and commit points.
