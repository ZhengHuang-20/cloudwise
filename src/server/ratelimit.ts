/**
 * 固定窗口计数，用于按 IP 限流与每日额度。Vercel 的函数实例之间不共享内存，
 * 所以配置了数据库时计数放在 rate_limits 表里；未配置数据库（本地开发）时退化为进程内计数。
 */
import { db, exec, queryOne } from './db';

const mem = new Map<string, { start: number; hits: number }>();

function memHit(key: string, windowSec: number, by: number): number {
  const now = Date.now();
  const cur = mem.get(key);
  if (!cur || now - cur.start >= windowSec * 1000) {
    mem.set(key, { start: now, hits: by });
    if (mem.size > 10_000) {
      for (const [k, v] of mem) if (now - v.start >= windowSec * 1000) mem.delete(k);
    }
    return by;
  }
  cur.hits += by;
  return cur.hits;
}

/** 计 by 次（默认 1）并返回当前窗口内的总次数 */
export async function hit(key: string, windowSec: number, by = 1): Promise<number> {
  if (!db()) return memHit(key, windowSec, by);
  const row = await queryOne<{ hits: number }>(
    `INSERT INTO rate_limits (key, window_start, hits) VALUES ($1, now(), $3)
     ON CONFLICT (key) DO UPDATE SET
       hits = CASE WHEN rate_limits.window_start <= now() - make_interval(secs => $2) THEN $3 ELSE rate_limits.hits + $3 END,
       window_start = CASE WHEN rate_limits.window_start <= now() - make_interval(secs => $2) THEN now() ELSE rate_limits.window_start END
     RETURNING hits`,
    [key, windowSec, by],
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
  // 每次页面浏览约 1～3 次（浏览 + 参与时长补报），公司出口 IP 后面可能有很多访客
  collect: (ip: string) => allow('collect', ip, 300, 60),
  lead: (ip: string) => allow('lead', ip, 10, 60),
  audit: (ip: string) => allow('audit', ip, 6, 3600),
  // AI 售前顾问每条消息都调用一次付费模型，不限流时可以被脚本刷
  chat: (ip: string) => allow('chat', ip, 30, 3600),
};
