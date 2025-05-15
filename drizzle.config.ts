import { defineConfig } from "drizzle-kit";
import path from "path";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  driver: "better-sqlite3",
  dbCredentials: {
    url: path.resolve('./data.db'),
  },
});
