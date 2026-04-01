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
  } finally {
    client?.release();
  }
}
