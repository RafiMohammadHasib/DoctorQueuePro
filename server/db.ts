import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Get the database URL from environment variables
const dbUrl = process.env.DATABASE_URL!;

// Create a Neon database client
const sql = neon(dbUrl);

// Create a Drizzle ORM instance
export const db = drizzle(sql);