import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';

const sqlite = new Database('data.db');
export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
migrate(db, { migrationsFolder: './drizzle' });