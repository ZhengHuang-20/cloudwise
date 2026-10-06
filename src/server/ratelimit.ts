/**
 * 固定窗口计数，用于按 IP 限流与每日额度。Vercel 的函数实例之间不共享内存，
 * 所以配置了数据库时计数放在 rate_limits 表里；未配置数据库（本地开发）时退化为进程内计数。
 */
import { db, exec, queryOne } from './db';

const mem = new Map<string, { start: number; hits: number }>();

function memHit(key: string, windowSec: number): number {
  const now = Date.now();
  const cur = mem.get(key);
  if (!cur || now - cur.start >= windowSec * 1000) {
    mem.set(key, { start: now, hits: 1 });
    if (mem.size > 10_000) {
      for (const [k, v] of mem) if (now - v.start >= windowSec * 1000) mem.delete(k);
    }
    return 1;
  }
  cur.hits++;
  return cur.hits;
}

/** 计一次并返回当前窗口内的次数 */
export async function hit(key: string, windowSec: number): Promise<number> {
  if (!db()) return memHit(key, windowSec);
  const row = await queryOne<{ hits: number }>(
    `INSERT INTO rate_limits (key, window_start, hits) VALUES ($1, now(), 1)
     ON CONFLICT (key) DO UPDATE SET
       hits = CASE WHEN rate_limits.window_start <= now() - make_interval(secs => $2) THEN 1 ELSE rate_limits.hits + 1 END,
       window_start = CASE WHEN rate_limits.window_start <= now() - make_interval(secs => $2) THEN now() ELSE rate_limits.window_start END
     RETURNING hits`,
    [key, windowSec],
  );
  // 顺手清理过期计数，避免表无限增长
  if (Math.random() < 0.01) {
    exec(`DELETE FROM rate_limits WHERE window_start < now() - interval '2 days'`).catch(() => {});
  }
  return row?.hits ?? 1;
}

/** 窗口内不超过 max 次时返回 true */
export async function allow(name: string, id: string, max: number, windowSec: number): Promise<boolean> {
  return (await hit(`${name}:${id}`, windowSec)) <= max;
}

export const limits = {
  login: (ip: string) => allow('login', ip, 10, 60),
  collect: (ip: string) => allow('collect', ip, 120, 60),
  lead: (ip: string) => allow('lead', ip, 10, 60),
  audit: (ip: string) => allow('audit', ip, 6, 3600),
};
