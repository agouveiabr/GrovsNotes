import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../app.js';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({ databaseUrl: ':memory:', migrate: true });
  await app.ready();

  // Seed test data
  await app.inject({
    method: 'POST',
    url: '/api/items',
    payload: { title: 'Implement elo ranking system', type: 'task', content: 'Build a ranking algorithm for players' },
  });

  await app.inject({
    method: 'POST',
    url: '/api/items',
    payload: { title: 'Design login page #frontend', type: 'idea', content: 'Create a beautiful login experience' },
  });

  await app.inject({
    method: 'POST',
    url: '/api/items',
    payload: { title: 'Fix database connection bug #backend', type: 'bug', content: 'Connection pooling issue in production' },
  });

  // Create a project and assign an item to it
  const projectRes = await app.inject({
    method: 'POST',
    url: '/api/projects',
    payload: { name: 'ATP' },
  });
  const project = projectRes.json();

  await app.inject({
    method: 'POST',
    url: '/api/items',
    payload: { title: 'ATP tournament tracker', type: 'idea', projectId: project.id, content: 'Track ATP tennis tournaments' },
  });
});

afterAll(async () => {
  await app.close();
});

describe('GET /api/search', () => {
  it('searches items by full text', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=ranking',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.items).toBeDefined();
    expect(body.devLogs).toBeDefined();
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(body.items[0].title).toContain('elo ranking');
  });

  it('filters by type', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=type:bug',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    for (const item of body.items) {
      expect(item.type).toBe('bug');
    }
  });

  it('combines text search with filters', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=tournament type:idea',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    for (const item of body.items) {
      expect(item.type).toBe('idea');
    }
  });

  it('returns empty results for no match', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=xyznonexistent',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.items).toEqual([]);
    expect(body.devLogs).toEqual([]);
  });

  it('returns empty results when query is empty', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.items).toEqual([]);
    expect(body.devLogs).toEqual([]);
  });

  it('filters by tag', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=tag:frontend',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.items.length).toBeGreaterThanOrEqual(1);
  });

  it('searches content as well as title', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=algorithm',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(body.items[0].content).toContain('algorithm');
  });
});
