/**
 * 数据库迁移：按文件名顺序执行 db/migrations/*.sql 中尚未执行过的文件，每个文件一个事务，
 * 用 advisory lock 防止并发构建同时迁移。由 scripts/migrate.ts（构建时）与 scripts/create-admin.ts 调用。
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import { createUser, normalizeEmail, validatePassword } from './auth';

const MIGRATIONS_DIR = path.join(process.cwd(), 'db', 'migrations');
const LOCK_ID = 7_270_301;

/**
 * 迁移用直连地址：Neon 的 pooled 地址经 PgBouncer（事务模式），会话级的 advisory lock 不可靠，
 * 所以优先用 Vercel × Neon 集成提供的 unpooled 地址。
 */
export function migrationUrl(): string {
  const env = process.env;
  return (
    env.DATABASE_URL_UNPOOLED || env.POSTGRES_URL_NON_POOLING || env.DATABASE_URL || env.POSTGRES_URL || ''
  ).trim();
}

export async function migrate(url: string, log = console.log): Promise<void> {
  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 15_000 });
  await client.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(128) PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
    const done = new Set((await client.query('SELECT version FROM schema_migrations')).rows.map((r) => r.version));
    for (const name of files) {
      if (done.has(name)) continue;
      const sql = await readFile(path.join(MIGRATIONS_DIR, name), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [name]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw new Error(`迁移 ${name} 失败: ${(err as Error).message}`);
      }
      log(`已执行迁移 ${name}`);
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]).catch(() => {});
    await client.end();
  }
}

/**
 * 按 CW_ADMIN_EMAIL / CW_ADMIN_PASSWORD 创建首个管理员。只创建，从不修改已有账号；首次登录仍会被要求改密。
 * 需要运行时连接池（DATABASE_URL），在 migrate 之后调用。
 */
export async function seedAdmin(log = console.log): Promise<void> {
  const emailRaw = process.env.CW_ADMIN_EMAIL ?? '';
  const pw = process.env.CW_ADMIN_PASSWORD ?? '';
  if (!emailRaw || !pw) return;
  const email = normalizeEmail(emailRaw);
  if (!email) {
    log('CW_ADMIN_EMAIL 无效，跳过创建管理员');
    return;
  }
  const msg = validatePassword(pw, email);
  if (msg) {
    log('CW_ADMIN_PASSWORD 不符合要求，跳过创建管理员: ' + msg.replace('新密码', '初始密码'));
    return;
  }
  try {
    await createUser(email, '管理员', 'admin', null, pw);
    log(`已创建管理员 ${email}（首次登录需改密）`);
  } catch (err) {
    if ((err as { code?: string }).code === '23505') return; // 已存在：不修改
    throw err;
  }
}
