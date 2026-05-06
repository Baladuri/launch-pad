import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { resolve } from 'node:path';
import * as schema from './schema.js';

const sqlite = new Database(resolve(import.meta.dirname, '../../data/launchpad.db'));
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export type Db = typeof db;
