import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createDb } from '@grovsnotes/db';
import { config } from './config.js';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';

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

    // Create FTS table for in-memory DB
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

  return app;
}
