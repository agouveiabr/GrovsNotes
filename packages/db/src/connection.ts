import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export function createDb(dbPath: string) {
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  return drizzle(sqlite, { schema });
}

export function createFtsTable(dbPath: string) {
  const sqlite = new Database(dbPath);
  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
      title,
      content,
      content='items',
      content_rowid='rowid'
    );
  `);

  // Triggers to keep FTS in sync with items table
  sqlite.exec(`
    CREATE TRIGGER IF NOT EXISTS items_fts_insert AFTER INSERT ON items BEGIN
      INSERT INTO items_fts(rowid, title, content) VALUES (NEW.rowid, NEW.title, NEW.content);
    END;
  `);
  sqlite.exec(`
    CREATE TRIGGER IF NOT EXISTS items_fts_delete AFTER DELETE ON items BEGIN
      INSERT INTO items_fts(items_fts, rowid, title, content) VALUES('delete', OLD.rowid, OLD.title, OLD.content);
    END;
  `);
  sqlite.exec(`
    CREATE TRIGGER IF NOT EXISTS items_fts_update AFTER UPDATE ON items BEGIN
      INSERT INTO items_fts(items_fts, rowid, title, content) VALUES('delete', OLD.rowid, OLD.title, OLD.content);
      INSERT INTO items_fts(rowid, title, content) VALUES (NEW.rowid, NEW.title, NEW.content);
    END;
  `);
  sqlite.close();
}

export type Db = ReturnType<typeof createDb>;
