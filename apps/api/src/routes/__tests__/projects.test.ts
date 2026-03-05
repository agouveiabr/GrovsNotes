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

describe('POST /api/projects', () => {
  it('creates a project with name only', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'My Project' },
    });

    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body.id).toBeDefined();
    expect(body.name).toBe('My Project');
    expect(body.color).toBeNull();
    expect(body.icon).toBeNull();
  });

  it('creates a project with color and icon', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'Styled Project', color: '#ff0000', icon: 'rocket' },
    });

    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body.name).toBe('Styled Project');
    expect(body.color).toBe('#ff0000');
    expect(body.icon).toBe('rocket');
  });

  it('rejects empty name', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: '' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBeDefined();
  });

  it('rejects missing name', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBeDefined();
  });
});

describe('GET /api/projects', () => {
  it('returns projects with item count', async () => {
    // Create a project
    const projectRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'Counted Project' },
    });
    const project = projectRes.json();

    // Create items assigned to that project
    await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'Item in project', projectId: project.id },
    });
    await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'Another item in project', projectId: project.id },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/projects',
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(Array.isArray(body)).toBe(true);

    const found = body.find(
      (p: { id: string }) => p.id === project.id
    );
    expect(found).toBeDefined();
    expect(found.name).toBe('Counted Project');
    expect(found.itemCount).toBe(2);
  });

  it('returns 0 item count for project with no items', async () => {
    const projectRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'Empty Project' },
    });
    const project = projectRes.json();

    const res = await app.inject({
      method: 'GET',
      url: '/api/projects',
    });

    const body = res.json();
    const found = body.find(
      (p: { id: string }) => p.id === project.id
    );
    expect(found).toBeDefined();
    expect(found.itemCount).toBe(0);
  });
});

describe('PATCH /api/projects/:id', () => {
  it('updates project name', async () => {
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

  it('updates project color and icon', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'Color Project' },
    });
    const { id } = createRes.json();

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/projects/${id}`,
      payload: { color: '#00ff00', icon: 'star' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().color).toBe('#00ff00');
    expect(res.json().icon).toBe('star');
  });

  it('returns 404 for unknown id', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/projects/nonexistent-id',
      payload: { name: 'Updated' },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBeDefined();
  });
});

describe('DELETE /api/projects/:id', () => {
  it('deletes project and nullifies items', async () => {
    // Create a project
    const projectRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'To Delete' },
    });
    const project = projectRes.json();

    // Create an item in that project
    const itemRes = await app.inject({
      method: 'POST',
      url: '/api/items',
      payload: { title: 'Orphaned item', projectId: project.id },
    });
    const item = itemRes.json();

    // Delete the project
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/projects/${project.id}`,
    });

    expect(res.statusCode).toBe(204);

    // Verify project is gone
    const getRes = await app.inject({
      method: 'GET',
      url: '/api/projects',
    });
    const projects = getRes.json();
    const found = projects.find(
      (p: { id: string }) => p.id === project.id
    );
    expect(found).toBeUndefined();

    // Verify item's projectId is now null
    const itemGetRes = await app.inject({
      method: 'GET',
      url: `/api/items/${item.id}`,
    });
    expect(itemGetRes.json().projectId).toBeNull();
  });

  it('returns 404 for unknown id', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/projects/nonexistent-id',
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBeDefined();
  });
});
