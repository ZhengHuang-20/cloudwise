/**
 * Postgres（Neon）连接。Vercel 的 Fluid compute 会复用函数实例，所以用一个模块级连接池；
 * attachDatabasePool 让实例挂起前释放空闲连接。未配置 DATABASE_URL 时 db() 返回 null，
 * AI 接口照常可用，账号与后台接口返回 503。
 */
import { Pool, types, type PoolClient, type QueryResultRow } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { config } from './config';

// BIGINT / COUNT(*) 默认解析成字符串；本项目的 id 与计数都在安全整数范围内。
types.setTypeParser(types.builtins.INT8, (v) => Number(v));
types.setTypeParser(types.builtins.NUMERIC, (v) => Number(v));

let pool: Pool | null | undefined;

export function db(): Pool | null {
  if (pool !== undefined) return pool;
  const url = config().databaseUrl;
  if (!url) {
    pool = null;
    return pool;
  }
  pool = new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 5_000, connectionTimeoutMillis: 10_000 });
  pool.on('error', (err) => console.warn('数据库连接池错误:', err.message));
  attachDatabasePool(pool);
  return pool;
}

/** 已配置数据库时的连接池；调用前应已确认 db() 不为 null */
function must(): Pool {
  const p = db();
  if (!p) throw new Error('database not configured');
  return p;
}

export async function query<T extends QueryResultRow = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await must().query<T>(text, params);
  return res.rows;
}

export async function queryOne<T extends QueryResultRow = any>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** 执行写语句并返回影响行数 */
export async function exec(text: string, params: unknown[] = []): Promise<number> {
  const res = await must().query(text, params);
  return res.rowCount ?? 0;
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await must().connect();
  try {
    await client.query('BEGIN');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

const pgCode = (err: unknown) => (err as { code?: string } | null)?.code;
export const isDuplicate = (err: unknown) => pgCode(err) === '23505';
export const isFKViolation = (err: unknown) => pgCode(err) === '23503';

/**
 * 数据库状态，用于 /api/health：unconfigured | ok | failed。
 * failed 时 issue 只含阶段与 SQLSTATE 错误码，不含连接串等敏感信息。
 */
export async function dbStatus(): Promise<{ status: string; issue: string }> {
  if (!db()) return { status: 'unconfigured', issue: '' };
  try {
    await query('SELECT version FROM schema_migrations LIMIT 1');
    return { status: 'ok', issue: '' };
  } catch (err) {
    const code = pgCode(err);
    if (code === '42P01') return { status: 'failed', issue: 'migrate: 尚未执行数据库迁移（bun run db:migrate）' };
    return { status: 'failed', issue: code ? `connect: postgres error ${code}` : 'connect: 无法连接或校验失败' };
  }
}
