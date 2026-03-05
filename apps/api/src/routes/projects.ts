import type { FastifyInstance } from 'fastify';
import { ulid } from 'ulid';
import { eq, sql } from 'drizzle-orm';
import { items, projects } from '@grovsnotes/db';

export default async function projectRoutes(app: FastifyInstance) {
  // POST /api/projects — Create a project
  app.post('/api/projects', async (request, reply) => {
    const body = request.body as {
      name?: string;
      color?: string;
      icon?: string;
    } | null;

    if (!body || typeof body.name !== 'string' || body.name.trim() === '') {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'name is required and must be non-empty',
        },
      });
    }

    const id = ulid();

    await app.db.insert(projects).values({
      id,
      name: body.name.trim(),
      color: body.color ?? null,
      icon: body.icon ?? null,
    });

    const [created] = await app.db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    return reply.status(201).send(created);
  });

  // GET /api/projects — List projects with item count
  app.get('/api/projects', async (_request, reply) => {
    const rows = await app.db
      .select({
        id: projects.id,
        name: projects.name,
        color: projects.color,
        icon: projects.icon,
        itemCount: sql<number>`count(${items.id})`.as('item_count'),
      })
      .from(projects)
      .leftJoin(items, eq(projects.id, items.projectId))
      .groupBy(projects.id);

    return reply.send(rows);
  });

  // PATCH /api/projects/:id — Update a project
  app.patch('/api/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string;
      color?: string;
      icon?: string;
    } | null;

    const [existing] = await app.db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!existing) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Project not found' },
      });
    }

    const updates: Record<string, unknown> = {};

    if (body?.name !== undefined) updates.name = body.name;
    if (body?.color !== undefined) updates.color = body.color;
    if (body?.icon !== undefined) updates.icon = body.icon;

    if (Object.keys(updates).length > 0) {
      await app.db.update(projects).set(updates).where(eq(projects.id, id));
    }

    const [updated] = await app.db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    return reply.send(updated);
  });

  // DELETE /api/projects/:id — Delete a project
  app.delete('/api/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [existing] = await app.db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!existing) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Project not found' },
      });
    }

    // Nullify items' projectId first
    await app.db
      .update(items)
      .set({ projectId: null })
      .where(eq(items.projectId, id));

    // Delete the project
    await app.db.delete(projects).where(eq(projects.id, id));

    return reply.status(204).send();
  });
}
