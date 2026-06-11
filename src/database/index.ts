import { neon } from "@neondatabase/serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Database = NeonHttpDatabase<typeof schema>;

let dbInstance: Database | null = null;

export const getDb = (): Database => {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    const sql = neon(connectionString);
    dbInstance = drizzle(sql, { schema });
  }

  return dbInstance;
};

export const db = new Proxy({} as Database, {
  get(_target, property) {
    return Reflect.get(getDb(), property);
  },
});

export * from "./schema";
