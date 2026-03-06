import type { FastifyInstance } from 'fastify';
import { eq, and, inArray } from 'drizzle-orm';
import { items, tags, itemTags, projects } from '@grovsnotes/db';
import Database from 'better-sqlite3';
import { parseSearch } from '../lib/search-parser.js';

export default async function searchRoutes(app: FastifyInstance) {
  // GET /api/search?q= — Unified search
  app.get('/api/search', async (request, reply) => {
    const query = request.query as { q?: string };
    const q = query.q?.trim() || '';

    if (q === '') {
      return reply.send({ items: [], devLogs: [] });
    }

    const parsed = parseSearch(q);

    // If there's no text and no filters, return empty
    if (parsed.text === '' && Object.keys(parsed.filters).length === 0) {
      return reply.send({ items: [], devLogs: [] });
    }

    let candidateIds: string[] | null = null;

    // If text is present, use FTS5 to find matching item IDs
    if (parsed.text !== '') {
      const rawDb = (app.db as any).session?.client as Database.Database;
      if (!rawDb) {
        return reply.send({ items: [], devLogs: [] });
      }

      // Escape FTS5 special characters and prepare search text
      const searchText = parsed.text
        .replace(/['"]/g, '')
        .split(/\s+/)
        .filter(Boolean)
        .map(term => `${term}*`)
        .join(' ');

      if (searchText === '') {
        return reply.send({ items: [], devLogs: [] });
      }

      const ftsResults = rawDb
        .prepare(
          `SELECT i.id FROM items i INNER JOIN items_fts ON items_fts.rowid = i.rowid WHERE items_fts MATCH ? ORDER BY rank`
        )
        .all(searchText) as Array<{ id: string }>;

      candidateIds = ftsResults.map((r) => r.id);

      if (candidateIds.length === 0) {
        return reply.send({ items: [], devLogs: [] });
      }
    }

    // Build filter conditions
    const conditions: ReturnType<typeof eq>[] = [];

    if (candidateIds !== null) {
      conditions.push(inArray(items.id, candidateIds));
    }

    if (parsed.filters.type) {
      conditions.push(eq(items.type, parsed.filters.type as any));
    }

    if (parsed.filters.project) {
      // Look up project by name
      const projectRows = await app.db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.name, parsed.filters.project));

      if (projectRows.length === 0) {
        return reply.send({ items: [], devLogs: [] });
      }

      conditions.push(eq(items.projectId, projectRows[0].id));
    }

    if (parsed.filters.tag) {
      // Look up tag by name
      const tagRows = await app.db
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.name, parsed.filters.tag));

      if (tagRows.length === 0) {
        return reply.send({ items: [], devLogs: [] });
      }

      // Get item IDs that have this tag
      const taggedItemIds = await app.db
        .select({ itemId: itemTags.itemId })
        .from(itemTags)
        .where(eq(itemTags.tagId, tagRows[0].id));

      if (taggedItemIds.length === 0) {
        return reply.send({ items: [], devLogs: [] });
      }

      const ids = taggedItemIds.map((r) => r.itemId);
      conditions.push(inArray(items.id, ids));
    }

    const whereClause =
      conditions.length > 1
        ? and(...conditions)
        : conditions.length === 1
          ? conditions[0]
          : undefined;

    const resultItems = await app.db
      .select()
      .from(items)
      .where(whereClause);

    return reply.send({ items: resultItems, devLogs: [] });
  });
}
