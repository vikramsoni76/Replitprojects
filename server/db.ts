import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false,
});

pool.on("error", (err) => {
  console.error("[db] Unexpected pool error (will reconnect automatically):", err.message);
});

async function keepAlive() {
  try {
    await pool.query("SELECT 1");
  } catch (err: any) {
    console.warn("[db] Keep-alive ping failed, Neon may be waking up:", err.message);
  }
}

setInterval(keepAlive, 4 * 60 * 1000);

export const db = drizzle(pool, { schema });

export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || "";
      const isNeonSuspended =
        msg.includes("endpoint has been disabled") ||
        msg.includes("connection refused") ||
        msg.includes("ECONNREFUSED") ||
        msg.includes("terminating connection") ||
        msg.includes("Connection terminated");
      if (isNeonSuspended && i < retries - 1) {
        console.warn(`[db] DB unavailable (attempt ${i + 1}/${retries}), retrying in ${delayMs}ms...`);
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}
