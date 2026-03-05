import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../app.js';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({ databaseUrl: ':memory:', migrate: true });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('POST /api/items', () => {
  it('creates an item with default type and status', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'My first idea' },
    });

    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body.id).toBeDefined();
    expect(body.title).toBe('My first idea');
    expect(body.type).toBe('idea');
    expect(body.status).toBe('inbox');
    expect(body.content).toBeNull();
    expect(body.projectId).toBeNull();
    expect(body.tags).toEqual([]);
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
  });

  it('parses hashtags from title', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'Fix login bug #urgent #backend' },
    });

    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body.title).toBe('Fix login bug');
    expect(body.tags).toHaveLength(2);

    const tagNames = body.tags.map((t: { name: string }) => t.name);
    expect(tagNames).toContain('urgent');
    expect(tagNames).toContain('backend');
  });

  it('rejects empty title', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: '' },
    });

    expect(res.statusCode).toBe(400);

    const body = res.json();
    expect(body.error).toBeDefined();
  });

  it('rejects missing title', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/items', () => {
  let itemIds: string[] = [];

  beforeAll(async () => {
    // Create several items with small delays to ensure ordering
    const titles = [
      'First item #alpha',
      'Second item #beta',
      'Third item #alpha #beta',
    ];

    for (const title of titles) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/items',
        payload: { title },
      });
      itemIds.push(res.json().id);
    }
  });

  it('returns items sorted by created_at desc', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/items',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.data).toBeDefined();
    expect(body.nextCursor).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(3);

    // Verify descending order by createdAt
    for (let i = 1; i < body.data.length; i++) {
      expect(body.data[i - 1].createdAt >= body.data[i].createdAt).toBe(true);
    }
  });

  it('filters by status', async () => {
    // Create an item with status 'todo'
    await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'Todo item', status: 'todo' },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/items?status=todo',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    for (const item of body.data) {
      expect(item.status).toBe('todo');
    }
  });

  it('filters by type', async () => {
    // Create an item with type 'bug'
    await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'A bug report', type: 'bug' },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/items?type=bug',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    for (const item of body.data) {
      expect(item.type).toBe('bug');
    }
  });

  it('filters by tag', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/items?tag=alpha',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    for (const item of body.data) {
      const tagNames = item.tags.map((t: { name: string }) => t.name);
      expect(tagNames).toContain('alpha');
    }
  });

  it('paginates with cursor and limit', async () => {
    const res1 = await app.inject({
      method: 'GET',
      url: '/api/items?limit=2',
    });

    const body1 = res1.json();
    expect(body1.data).toHaveLength(2);
    expect(body1.nextCursor).not.toBeNull();

    const res2 = await app.inject({
      method: 'GET',
      url: `/api/items?limit=2&cursor=${body1.nextCursor}`,
    });

    const body2 = res2.json();
    expect(body2.data.length).toBeGreaterThanOrEqual(1);

    // No overlap between pages
    const ids1 = body1.data.map((i: { id: string }) => i.id);
    const ids2 = body2.data.map((i: { id: string }) => i.id);
    for (const id of ids2) {
      expect(ids1).not.toContain(id);
    }
  });
});

describe('GET /api/items/:id', () => {
  it('returns item with tags', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'Detail item #detail' },
    });

    const created = createRes.json();

    const res = await app.inject({
      method: 'GET',
      url: `/api/items/${created.id}`,
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.id).toBe(created.id);
    expect(body.title).toBe('Detail item');
    expect(body.tags).toHaveLength(1);
    expect(body.tags[0].name).toBe('detail');
  });

  it('returns 404 for unknown id', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/items/nonexistent-id',
    });

    expect(res.statusCode).toBe(404);

    const body = res.json();
    expect(body.error).toBeDefined();
  });
});

describe('PATCH /api/items/:id', () => {
  it('updates item title and re-parses hashtags', async () => {
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
    const tagNames = body.tags.map((t: { name: string }) => t.name);
    expect(tagNames).toContain('newtag');
    expect(tagNames).not.toContain('oldtag');
  });

  it('updates status without affecting tags', async () => {
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
    expect(res.json().tags[0].name).toBe('important');
  });

  it('updates type', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'convert me' },
    });
    const { id } = createRes.json();

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/items/${id}`,
      payload: { type: 'task' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().type).toBe('task');
  });

  it('returns 404 for unknown id', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/items/nonexistent-id',
      payload: { title: 'new' },
    });
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/items/:id', () => {
  it('deletes item and its tag associations', async () => {
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

    // Verify it's gone
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/items/${id}`,
    });
    expect(getRes.statusCode).toBe(404);
  });

  it('returns 404 for unknown id', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/items/nonexistent-id',
    });
    expect(res.statusCode).toBe(404);
  });
});
