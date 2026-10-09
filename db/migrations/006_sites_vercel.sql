-- 托管在 Vercel 上的站点，可关联 Vercel 项目，后台数据概览用 Vercel Web Analytics 的汇总数据作参考。
-- 团队 ID 与项目 ID 都是公开标识（不是密钥）；访问 Vercel 的令牌只放在环境变量 VERCEL_API_TOKEN 里。
ALTER TABLE sites
  ADD COLUMN vercel_team_id    VARCHAR(64) NOT NULL DEFAULT '',
  ADD COLUMN vercel_project_id VARCHAR(64) NOT NULL DEFAULT '';
