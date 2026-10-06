/** 创建管理员并打印一次性初始密码：bun run create-admin <email> */
import nextEnv from '@next/env';
import { createUser, normalizeEmail } from '../src/server/auth';
import { db, isDuplicate } from '../src/server/db';
import { migrate, migrationUrl } from '../src/server/migrate';

nextEnv.loadEnvConfig(process.cwd());

async function main() {
  const raw = process.argv[2];
  if (!raw) throw new Error('用法: bun run create-admin <email>');
  const email = normalizeEmail(raw);
  if (!email) throw new Error('邮箱格式不正确');
  const url = migrationUrl();
  if (!url || !db()) throw new Error('未配置数据库（DATABASE_URL）');
  await migrate(url);
  try {
    const { password } = await createUser(email, '管理员', 'admin', null);
    console.log(`管理员已创建\n邮箱: ${email}\n初始密码: ${password}\n首次登录后会被要求修改密码。`);
  } catch (err) {
    if (isDuplicate(err)) throw new Error('该邮箱已存在');
    throw err;
  } finally {
    await db()?.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
