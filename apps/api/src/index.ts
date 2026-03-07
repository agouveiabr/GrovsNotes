import 'dotenv/config';
import { buildApp } from './app.js';
import { config } from './config.js';
import { createFtsTable } from '@grovsnotes/db';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

async function start() {
  mkdirSync(dirname(config.databaseUrl), { recursive: true });

  const app = await buildApp({ migrate: true });

  // FTS setup must come AFTER migrations create the items table
  createFtsTable(config.databaseUrl);

  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
