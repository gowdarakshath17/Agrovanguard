import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import fs from 'fs';

declare global {
  var _postgresPool: Pool | undefined;
  var _drizzleDb: NodePgDatabase<typeof schema> | undefined;
  interface Window {
    recaptchaVerifier: any;
    grecaptcha: any;
  }
}

export function resolveSqlHost(): string | undefined {
  const envHost = process.env.SQL_HOST;
  if (envHost && fs.existsSync(envHost)) {
    return envHost;
  }
  // Check if there is an active Cloud SQL socket directory mounted in /app/cloudsql
  if (fs.existsSync('/app/cloudsql')) {
    try {
      const entries = fs.readdirSync('/app/cloudsql');
      for (const entry of entries) {
        const fullPath = `/app/cloudsql/${entry}`;
        try {
          if (fs.statSync(fullPath).isDirectory()) {
            return fullPath;
          }
        } catch {}
      }
    } catch {}
  }
  return envHost;
}

export const createPool = (): Pool => {
  if (!global._postgresPool) {
    const host = resolveSqlHost();
    const poolConfig: any = {
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 5,
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 10000,
    };

    if (host) {
      poolConfig.host = host;
    }

    global._postgresPool = new Pool(poolConfig);

    // Suppress unhandled pool socket errors so they don't terminate the Node.js server process
    global._postgresPool.on('error', (err) => {
      // Quietly log and ignore closed socket / proxy connection errors
      // console.warn('[Database Pool] Handled pool client notice:', err?.message || err);
    });
  }
  return global._postgresPool;
};

let dbHealthy: boolean | null = null;
let lastDbCheck = 0;
let currentDbCheckInterval = 30000;
const MAX_DB_CHECK_INTERVAL = 600000; // 10 minutes

export async function isDbAvailable(): Promise<boolean> {
  const now = Date.now();
  if (dbHealthy !== null && now - lastDbCheck < currentDbCheckInterval) {
    return dbHealthy;
  }
  lastDbCheck = now;
  try {
    const host = resolveSqlHost();
    if (!host) {
      dbHealthy = false;
      currentDbCheckInterval = MAX_DB_CHECK_INTERVAL;
      return false;
    }
    const p = createPool();
    const client = await p.connect();
    try {
      await client.query('SELECT 1');
      dbHealthy = true;
      currentDbCheckInterval = 30000;
    } finally {
      client.release();
    }
  } catch {
    dbHealthy = false;
    // Exponentially back off to avoid spamming the Cloud SQL proxy with unauthorized socket connections
    currentDbCheckInterval = Math.min(currentDbCheckInterval * 2, MAX_DB_CHECK_INTERVAL);
  }
  return dbHealthy;
}

export async function closePool(): Promise<void> {
  if (global._postgresPool) {
    try {
      await global._postgresPool.end();
    } catch {}
    global._postgresPool = undefined;
    global._drizzleDb = undefined;
  }
}

// Lazy Drizzle proxy that only establishes a pool when actually queried
export const db: NodePgDatabase<typeof schema> = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(target, prop) {
    if (!global._drizzleDb) {
      const p = createPool();
      global._drizzleDb = drizzle(p, { schema });
    }
    return (global._drizzleDb as any)[prop];
  }
});
