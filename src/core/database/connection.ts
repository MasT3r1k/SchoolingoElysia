import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import type { Database } from '../../db/schemas';
import { env } from '../config/env.config';
import { InternalServerError } from '../errors/http-errors';

const pool = createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

pool.on('error', (err) => {
  console.error('[📦 Database Error]: Connection pool error:', err);
  throw new InternalServerError('Database connection pool error', err);
});

pool.on('connection', () => {
  if (env.NODE_ENV === 'development') {
    console.log('[📦 Database]: Pool connection established');
  }
});

const dialect = new MysqlDialect({ pool });

export const db = new Kysely<Database>({
  dialect,
  ...(env.NODE_ENV === 'development' && {
    log: (event) => {
      if (event.level === 'query') {
        console.log('[📦 Database Query]:', event.query.sql, event.query.parameters);
      }
      if (event.level === 'error') {
        console.error('[📦 Database Query Error]:', event.error);
      }
    },
  }),
});

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const res = await pool.promise().query('SELECT 1 as ping');
    return Array.isArray(res) && res.length > 0;
  } catch (err) {
    console.error('[📦 Database Health Check Failed]:', err);
    return false;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  await db.destroy();
  pool.end();
}
