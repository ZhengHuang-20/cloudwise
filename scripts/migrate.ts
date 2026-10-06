/**
 * 构建前执行的数据库迁移（package.json 的 build 先跑它）：`bun run db:migrate` 也可单独执行。
 * 未配置数据库时跳过；设置 SKIP_DB_MIGRATE=1 也会跳过（例如预览部署共用生产库、又不想在预览构建时迁移）。
 */
import nextEnv from '@next/env';
import { migrate, migrationUrl, seedAdmin } from '../src/server/migrate';
import { db } from '../src/server/db';

nextEnv.loadEnvConfig(process.cwd());

async function main() {
  if (process.env.SKIP_DB_MIGRATE === '1') {
    console.log('SKIP_DB_MIGRATE=1，跳过数据库迁移');
    return;
  }
  const url = migrationUrl();
  if (!url) {
    console.log('未配置 DATABASE_URL：跳过数据库迁移（账号与后台接口将返回 503，AI 接口照常可用）');
    return;
  }
  await migrate(url);
  console.log('数据库迁移完成');
  await seedAdmin();
  await db()?.end();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
