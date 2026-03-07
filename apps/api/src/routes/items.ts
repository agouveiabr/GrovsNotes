import type { FastifyInstance } from 'fastify';
import { ulid } from 'ulid';
import { eq, desc, and, lt, inArray, sql } from 'drizzle-orm';
import { items, tags, itemTags } from '@grovsnotes/db';
import {
  ITEM_TYPES,
  ITEM_STATUSES,
  type ItemType,
  type ItemStatus,
  type Tag,
} from '@grovsnotes/shared';
import { parseHashtags } from '../lib/hashtags.js';
import { refineNote } from '../lib/ai-service.js';
import type { Db } from '@grovsnotes/db';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function upsertTags(db: Db, tagNames: string[]): Promise<Tag[]> {
  if (tagNames.length === 0) return [];

  const result: Tag[] = [];

  for (const name of tagNames) {
    // Try to find existing tag
    const existing = await db
      .select()
      .from(tags)
      .where(eq(tags.name, name))
      .limit(1);

    if (existing.length > 0) {
      result.push({ id: existing[0].id, name: existing[0].name });
    } else {
      const id = ulid();
      await db.insert(tags).values({ id, name });
      result.push({ id, name });
    }
  }

  return result;
}

async function getItemTags(db: Db, itemId: string): Promise<Tag[]> {
  const rows = await db
    .select({ id: tags.id, name: tags.name })
    .from(itemTags)
    .innerJoin(tags, eq(itemTags.tagId, tags.id))
    .where(eq(itemTags.itemId, itemId));

  return rows;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export default async function itemRoutes(app: FastifyInstance) {
  // POST /api/items — Create an item
  app.post('/api/items', async (request, reply) => {
    const body = request.body as {
      title?: string;
      content?: string;
      type?: string;
      status?: string;
      projectId?: string;
    } | null;

    // Validate title
    if (!body || typeof body.title !== 'string' || body.title.trim() === '') {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'title is required and must be non-empty' },
      });
    }

    // Validate type if provided
    if (body.type !== undefined && !ITEM_TYPES.includes(body.type as ItemType)) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: `type must be one of: ${ITEM_TYPES.join(', ')}` },
      });
    }

    // Validate status if provided
    if (body.status !== undefined && !ITEM_STATUSES.includes(body.status as ItemStatus)) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: `status must be one of: ${ITEM_STATUSES.join(', ')}` },
      });
    }

    const { cleanTitle, tags: parsedTagNames } = parseHashtags(body.title);

    const id = ulid();
    const now = new Date().toISOString();

    await app.db.insert(items).values({
      id,
      title: cleanTitle,
      content: body.content ?? null,
      type: (body.type as ItemType) ?? 'idea',
      status: (body.status as ItemStatus) ?? 'inbox',
      projectId: body.projectId ?? null,
      createdAt: now,
      updatedAt: now,
    });

    // Upsert tags and link them
    const tagRecords = await upsertTags(app.db, parsedTagNames);
    for (const tag of tagRecords) {
      await app.db.insert(itemTags).values({ itemId: id, tagId: tag.id });
    }

    // Fetch the created item
    const [created] = await app.db
      .select()
      .from(items)
      .where(eq(items.id, id));

    return reply.status(201).send({
      ...created,
      tags: tagRecords,
      project: null,
    });
  });

  // GET /api/items — List items with optional filters
  app.get('/api/items', async (request, reply) => {
    const query = request.query as {
      type?: string;
      status?: string;
      project?: string;
      tag?: string;
      limit?: string;
      cursor?: string;
    };

    let limit = parseInt(query.limit || '50', 10);
    if (isNaN(limit) || limit < 1) limit = 50;
    if (limit > 100) limit = 100;

    const conditions: ReturnType<typeof eq>[] = [];

    if (query.status) {
      conditions.push(eq(items.status, query.status as any));
    }
    if (query.type) {
      conditions.push(eq(items.type, query.type as any));
    }
    if (query.project) {
      conditions.push(eq(items.projectId, query.project));
    }
    if (query.cursor) {
      conditions.push(lt(items.id, query.cursor));
    }

    let itemRows;

    if (query.tag) {
      // Find tag IDs matching the tag name
      const matchingTags = await app.db
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.name, query.tag));

      if (matchingTags.length === 0) {
        return reply.send({ data: [], nextCursor: null });
      }

      const tagIds = matchingTags.map((t) => t.id);

      // Get item IDs that have this tag
      const taggedItemIds = await app.db
        .select({ itemId: itemTags.itemId })
        .from(itemTags)
        .where(inArray(itemTags.tagId, tagIds));

      if (taggedItemIds.length === 0) {
        return reply.send({ data: [], nextCursor: null });
      }

      const ids = taggedItemIds.map((r) => r.itemId);
      conditions.push(inArray(items.id, ids));

      itemRows = await app.db
        .select()
        .from(items)
        .where(conditions.length > 1 ? and(...conditions) : conditions[0])
        .orderBy(desc(items.createdAt))
        .limit(limit + 1);
    } else {
      itemRows = await app.db
        .select()
        .from(items)
        .where(
          conditions.length > 1
            ? and(...conditions)
            : conditions.length === 1
              ? conditions[0]
              : undefined
        )
        .orderBy(desc(items.createdAt))
        .limit(limit + 1);
    }

    const hasMore = itemRows.length > limit;
    const data = hasMore ? itemRows.slice(0, limit) : itemRows;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    // Fetch tags for each item
    const itemsWithTags = await Promise.all(
      data.map(async (item) => {
        const itemTagList = await getItemTags(app.db, item.id);
        return {
          ...item,
          tags: itemTagList,
          project: null,
        };
      })
    );

    return reply.send({ data: itemsWithTags, nextCursor });
  });

  // GET /api/items/:id — Get single item
  app.get('/api/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [item] = await app.db
      .select()
      .from(items)
      .where(eq(items.id, id));

    if (!item) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Item not found' },
      });
    }

    const itemTagList = await getItemTags(app.db, id);

    return reply.send({
      ...item,
      tags: itemTagList,
      project: null,
    });
  });

  // POST /api/items/:id/refine — Get AI refinement preview
  app.post('/api/items/:id/refine', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [item] = await app.db
      .select()
      .from(items)
      .where(eq(items.id, id));

    if (!item) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Item not found' },
      });
    }

    try {
      const refined = await refineNote(item.title, item.content ?? '');
      return reply.send(refined);
    } catch (error: any) {
      return reply.status(500).send({
        error: { code: 'AI_ERROR', message: error.message || 'AI refinement failed' },
      });
    }
  });

  // PATCH /api/items/:id — Update an item
  app.patch('/api/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      title?: string;
      content?: string;
      type?: string;
      status?: string;
      projectId?: string | null;
    } | null;

    const [existing] = await app.db
      .select()
      .from(items)
      .where(eq(items.id, id));

    if (!existing) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Item not found' },
      });
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body?.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: 'title must be non-empty' },
        });
      }

      const { cleanTitle, tags: parsedTagNames } = parseHashtags(body.title);
      updates.title = cleanTitle;

      // Re-sync tags: delete old associations, upsert new tags, link
      await app.db.delete(itemTags).where(eq(itemTags.itemId, id));
      const tagRecords = await upsertTags(app.db, parsedTagNames);
      for (const tag of tagRecords) {
        await app.db.insert(itemTags).values({ itemId: id, tagId: tag.id });
      }
    }

    if (body?.content !== undefined) updates.content = body.content;

    if (body?.type !== undefined) {
      if (!ITEM_TYPES.includes(body.type as ItemType)) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: `type must be one of: ${ITEM_TYPES.join(', ')}` },
        });
      }
      updates.type = body.type;
    }

    if (body?.status !== undefined) {
      if (!ITEM_STATUSES.includes(body.status as ItemStatus)) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: `status must be one of: ${ITEM_STATUSES.join(', ')}` },
        });
      }
      updates.status = body.status;
    }

    if (body?.projectId !== undefined) updates.projectId = body.projectId;

    await app.db.update(items).set(updates).where(eq(items.id, id));

    const [updated] = await app.db
      .select()
      .from(items)
      .where(eq(items.id, id));

    const itemTagList = await getItemTags(app.db, id);

    return reply.send({
      ...updated,
      tags: itemTagList,
      project: null,
    });
  });

  // DELETE /api/items/:id — Delete an item
  app.delete('/api/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [existing] = await app.db
      .select()
      .from(items)
      .where(eq(items.id, id));

    if (!existing) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Item not found' },
      });
    }

    // Delete tag associations first, then the item
    await app.db.delete(itemTags).where(eq(itemTags.itemId, id));
    await app.db.delete(items).where(eq(items.id, id));

    return reply.status(204).send();
  });
}
