import { Pool } from "pg";
import { DB_CONFIG } from "./config";

export const pool = new Pool(DB_CONFIG);

export async function initDb(): Promise<void> {
  let client;
  try {
    client = await pool.connect();
    console.log(`[DB] Connected to PostgreSQL at ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
  } catch (err) {
    console.error("[DB] Failed to connect to PostgreSQL:", err);
    throw err;
  }

  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email         TEXT UNIQUE NOT NULL,
        name          TEXT,
        password_hash TEXT NOT NULL,
        role          TEXT NOT NULL DEFAULT 'fullstack',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'fullstack';

      CREATE TABLE IF NOT EXISTS interviews (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date           TIMESTAMPTZ NOT NULL DEFAULT now(),
        role           TEXT NOT NULL,
        question_type  TEXT NOT NULL,
        config         JSONB NOT NULL,
        result         JSONB NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(date DESC);
    `);
    console.log("[DB] Schema verified (tables exist or were created)");
  } catch (err) {
    console.error("[DB] Failed to initialize schema:", err);
    throw err;
  } finally {
    client.release();
  }
}
