import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../app.js';
import type { FastifyInstance } from 'fastify';

const TEST_API_KEY = 'test-key';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({
    databaseUrl: ':memory:',
    migrate: true,
    apiKey: TEST_API_KEY,
  });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('POST /api/dev-logs', () => {
  it('creates a dev log with valid API key', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/dev-logs',
      headers: { 'x-api-key': TEST_API_KEY },
      payload: {
        repo: 'my-app',
        branch: 'main',
        commitHash: 'abc123',
        message: 'fix: resolve login bug',
      },
    });

    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body.id).toBeDefined();
    expect(body.repo).toBe('my-app');
    expect(body.branch).toBe('main');
    expect(body.commitHash).toBe('abc123');
    expect(body.message).toBe('fix: resolve login bug');
    expect(body.createdAt).toBeDefined();
  });

  it('rejects request without API key', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/dev-logs',
      payload: {
        repo: 'my-app',
        branch: 'main',
        commitHash: 'abc123',
        message: 'some commit',
      },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBeDefined();
  });

  it('rejects request with wrong API key', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/dev-logs',
      headers: { 'x-api-key': 'wrong-key' },
      payload: {
        repo: 'my-app',
        branch: 'main',
        commitHash: 'abc123',
        message: 'some commit',
      },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBeDefined();
  });

  it('rejects missing required fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/dev-logs',
      headers: { 'x-api-key': TEST_API_KEY },
      payload: { repo: 'my-app' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBeDefined();
  });
});

describe('GET /api/dev-logs', () => {
  beforeAll(async () => {
    // Create several dev logs with different repos and timestamps
    const entries = [
      {
        repo: 'frontend',
        branch: 'main',
        commitHash: 'aaa111',
        message: 'feat: add dashboard',
      },
      {
        repo: 'frontend',
        branch: 'dev',
        commitHash: 'bbb222',
        message: 'fix: button alignment',
      },
      {
        repo: 'backend',
        branch: 'main',
        commitHash: 'ccc333',
        message: 'chore: update deps',
      },
    ];

    for (const entry of entries) {
      await app.inject({
        method: 'POST',
        url: '/api/dev-logs',
        headers: { 'x-api-key': TEST_API_KEY },
        payload: entry,
      });
    }
  });

  it('returns dev logs sorted by createdAt desc', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/dev-logs',
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

  it('filters by repo', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/dev-logs?repo=frontend',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    for (const log of body.data) {
      expect(log.repo).toBe('frontend');
    }
  });

  it('filters by branch', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/dev-logs?branch=main',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    for (const log of body.data) {
      expect(log.branch).toBe('main');
    }
  });

  it('paginates with cursor and limit', async () => {
    const res1 = await app.inject({
      method: 'GET',
      url: '/api/dev-logs?limit=2',
    });

    const body1 = res1.json();
    expect(body1.data).toHaveLength(2);
    expect(body1.nextCursor).not.toBeNull();

    const res2 = await app.inject({
      method: 'GET',
      url: `/api/dev-logs?limit=2&cursor=${body1.nextCursor}`,
    });

    const body2 = res2.json();
    expect(body2.data.length).toBeGreaterThanOrEqual(1);

    // No overlap between pages
    const ids1 = body1.data.map((d: { id: string }) => d.id);
    const ids2 = body2.data.map((d: { id: string }) => d.id);
    for (const id of ids2) {
      expect(ids1).not.toContain(id);
    }
  });
});
