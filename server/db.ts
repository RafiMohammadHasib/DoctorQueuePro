
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

const sqlite = new Database(path.resolve('./data.db'));
export const db = drizzle(sqlite);
