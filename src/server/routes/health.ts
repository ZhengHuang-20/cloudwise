/** /api/health：运行状态（不含敏感信息），部署后用于确认 key 与数据库是否生效 */
import { db, dbStatus } from '../db';
import { activeEngines } from '../engines';
import { gemini } from '../gemini';
import { json, route } from '../http';

export const health = route(async () => {
  const { status, issue } = await dbStatus();
  return json({
    status: 'ok',
    hasGeminiKey: gemini() !== null,
    auditEngines: activeEngines().map((e) => e.id),
    hasDatabase: db() !== null,
    dbStatus: status,
    dbIssue: issue,
    timestamp: new Date().toISOString(),
  });
});

/** 未定义的 /api/* 路径统一返回 JSON 404 */
export const notFound = async () => json({ error: '接口不存在', code: 'not_found' }, 404);
