import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createDb } from '@grovsnotes/db';
import { config } from './config.js';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import itemRoutes from './routes/items.js';
import projectRoutes from './routes/projects.js';
import devLogRoutes from './routes/dev-logs.js';
import searchRoutes from './routes/search.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof createDb>;
    apiKey: string;
  }
}

export async function buildApp(overrides?: {
  databaseUrl?: string;
  migrate?: boolean;
  apiKey?: string;
}) {
  const dbPath = overrides?.databaseUrl || config.databaseUrl;
  const shouldMigrate = overrides?.migrate || false;

  const app = Fastify({
    logger: dbPath === ':memory:' ? false : {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  await app.register(cors, {
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  const db = createDb(dbPath);
  app.decorate('db', db);
  app.decorate('apiKey', overrides?.apiKey || config.apiKey);

  if (shouldMigrate) {
    const migrationsPath = new URL(
      '../../../packages/db/drizzle',
      import.meta.url
    ).pathname;
    migrate(db, { migrationsFolder: migrationsPath });
  }

  // Error handler
  app.setErrorHandler((error: any, _request, reply) => {
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
  await app.register(projectRoutes);
  await app.register(devLogRoutes);
  await app.register(searchRoutes);

  return app;
}
