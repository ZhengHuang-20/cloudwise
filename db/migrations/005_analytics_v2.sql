-- 访问分析 v2：会话、来源渠道、国家地区、浏览器 / 系统、参与时长，以及线索的来源归因。
-- 地区来自 Vercel 的 x-vercel-ip-* 请求头，只存国家与省 / 州代码，仍然不存 IP。
-- 升级前的访问没有会话，只计入访客与浏览量；渠道、地区、跳出率等从升级后开始统计。

ALTER TABLE visits
  ADD COLUMN session_id VARCHAR(40) NOT NULL DEFAULT '',
  -- 页面在前台的累计时长与最大滚动深度（采集脚本在页面切到后台或关闭时补报）
  ADD COLUMN engaged_ms INT NOT NULL DEFAULT 0,
  ADD COLUMN scroll_pct SMALLINT NOT NULL DEFAULT 0;
-- 补报参与时长时按会话找最近一次浏览
CREATE INDEX idx_visits_session ON visits (site_id, session_id, id);

-- 访问会话（与登录会话表 sessions 无关）：同一访客连续访问，30 分钟无操作后算新会话（会话 ID 由采集脚本生成）。
-- 每次页面浏览时插入或更新一行；来源、地区、设备取会话的第一个页面。
CREATE TABLE visit_sessions (
  id             BIGSERIAL PRIMARY KEY,
  site_id        BIGINT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
  session_id     VARCHAR(40) NOT NULL,
  visitor_id     VARCHAR(40) NOT NULL,
  is_new_visitor BOOLEAN NOT NULL DEFAULT false,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  pageviews      INT NOT NULL DEFAULT 1,
  engaged_ms     INT NOT NULL DEFAULT 0,
  entry_path     VARCHAR(512) NOT NULL DEFAULT '',
  exit_path      VARCHAR(512) NOT NULL DEFAULT '',
  -- 渠道：direct / search / ai / social / referral / paid / email；source 是归一后的来源名（Google、ChatGPT…）
  channel        VARCHAR(16) NOT NULL DEFAULT 'direct',
  source         VARCHAR(128) NOT NULL DEFAULT '',
  ref_host       VARCHAR(255) NOT NULL DEFAULT '',
  utm_source     VARCHAR(128) NOT NULL DEFAULT '',
  utm_medium     VARCHAR(128) NOT NULL DEFAULT '',
  utm_campaign   VARCHAR(128) NOT NULL DEFAULT '',
  utm_term       VARCHAR(128) NOT NULL DEFAULT '',
  utm_content    VARCHAR(128) NOT NULL DEFAULT '',
  country        VARCHAR(2) NOT NULL DEFAULT '',
  region         VARCHAR(8) NOT NULL DEFAULT '',
  device         VARCHAR(8) NOT NULL DEFAULT 'desktop' CHECK (device IN ('desktop', 'mobile', 'tablet')),
  browser        VARCHAR(24) NOT NULL DEFAULT '',
  os             VARCHAR(24) NOT NULL DEFAULT '',
  lang           VARCHAR(16) NOT NULL DEFAULT '',
  has_lead       BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (site_id, session_id)
);
CREATE INDEX idx_visit_sessions_site_time ON visit_sessions (site_id, started_at);
CREATE INDEX idx_visit_sessions_visitor ON visit_sessions (site_id, visitor_id, started_at);

-- 线索提交时快照来源：留资所在的会话不是直接访问时用它，否则取最近 90 天内最近一次非直接访问的会话，都没有时取最近一次会话。
ALTER TABLE leads
  ADD COLUMN channel      VARCHAR(16) NOT NULL DEFAULT '',
  ADD COLUMN source       VARCHAR(128) NOT NULL DEFAULT '',
  ADD COLUMN utm_campaign VARCHAR(128) NOT NULL DEFAULT '',
  ADD COLUMN landing_path VARCHAR(512) NOT NULL DEFAULT '',
  ADD COLUMN country      VARCHAR(2) NOT NULL DEFAULT '';
