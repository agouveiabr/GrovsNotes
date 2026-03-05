import type { FastifyInstance } from 'fastify';
import { ulid } from 'ulid';
import { eq, desc, and, lt, gte, lte } from 'drizzle-orm';
import { devLogs } from '@grovsnotes/db';

export default async function devLogRoutes(app: FastifyInstance) {
  // POST /api/dev-logs — Create a dev log entry (requires API key)
  app.post('/api/dev-logs', async (request, reply) => {
    // Check API key
    const apiKey = request.headers['x-api-key'];
    if (!apiKey || apiKey !== app.apiKey) {
      return reply.status(401).send({
        error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' },
      });
    }

    const body = request.body as {
      repo?: string;
      branch?: string;
      commitHash?: string;
      message?: string;
    } | null;

    // Validate required fields
    if (
      !body ||
      typeof body.repo !== 'string' || body.repo.trim() === '' ||
      typeof body.branch !== 'string' || body.branch.trim() === '' ||
      typeof body.commitHash !== 'string' || body.commitHash.trim() === '' ||
      typeof body.message !== 'string' || body.message.trim() === ''
    ) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'repo, branch, commitHash, and message are all required',
        },
      });
    }

    const id = ulid();
    const now = new Date().toISOString();

    await app.db.insert(devLogs).values({
      id,
      repo: body.repo.trim(),
      branch: body.branch.trim(),
      commitHash: body.commitHash.trim(),
      message: body.message.trim(),
      createdAt: now,
    });

    const [created] = await app.db
      .select()
      .from(devLogs)
      .where(eq(devLogs.id, id));

    return reply.status(201).send(created);
  });

  // GET /api/dev-logs — List dev logs
  app.get('/api/dev-logs', async (request, reply) => {
    const query = request.query as {
      repo?: string;
      branch?: string;
      from?: string;
      to?: string;
      limit?: string;
      cursor?: string;
    };

    let limit = parseInt(query.limit || '50', 10);
    if (isNaN(limit) || limit < 1) limit = 50;
    if (limit > 100) limit = 100;

    const conditions: ReturnType<typeof eq>[] = [];

    if (query.repo) {
      conditions.push(eq(devLogs.repo, query.repo));
    }
    if (query.branch) {
      conditions.push(eq(devLogs.branch, query.branch));
    }
    if (query.from) {
      conditions.push(gte(devLogs.createdAt, query.from));
    }
    if (query.to) {
      conditions.push(lte(devLogs.createdAt, query.to));
    }
    if (query.cursor) {
      conditions.push(lt(devLogs.id, query.cursor));
    }

    const rows = await app.db
      .select()
      .from(devLogs)
      .where(
        conditions.length > 1
          ? and(...conditions)
          : conditions.length === 1
            ? conditions[0]
            : undefined
      )
      .orderBy(desc(devLogs.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return reply.send({ data, nextCursor });
  });
}
