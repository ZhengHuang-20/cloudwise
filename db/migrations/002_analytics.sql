-- 站点访问记录与线索。
-- visitor_id 由采集脚本在访客浏览器里生成的随机匿名 ID，不含个人信息，不记录 IP。
CREATE TABLE visits (
  id         BIGSERIAL PRIMARY KEY,
  site_id    BIGINT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
  visitor_id VARCHAR(40) NOT NULL,
  path       VARCHAR(512) NOT NULL,
  referrer   VARCHAR(255) NOT NULL DEFAULT '',
  device     VARCHAR(8) NOT NULL DEFAULT 'desktop' CHECK (device IN ('desktop', 'mobile', 'tablet')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_visits_site_time ON visits (site_id, created_at);

-- 线索：其他网站的访客留下的联系方式。
CREATE TABLE leads (
  id          BIGSERIAL PRIMARY KEY,
  site_id     BIGINT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
  name        VARCHAR(64) NOT NULL DEFAULT '',
  phone       VARCHAR(32) NOT NULL DEFAULT '',
  email       VARCHAR(191) NOT NULL DEFAULT '',
  company     VARCHAR(128) NOT NULL DEFAULT '',
  message     VARCHAR(2000) NOT NULL DEFAULT '',
  source_page VARCHAR(512) NOT NULL DEFAULT '',
  visitor_id  VARCHAR(40) NOT NULL DEFAULT '',
  status      VARCHAR(16) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'invalid')),
  note        VARCHAR(1000) NOT NULL DEFAULT '',
  ip          VARCHAR(64) NOT NULL DEFAULT '',
  user_agent  VARCHAR(255) NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_site_time ON leads (site_id, created_at);
CREATE INDEX idx_leads_site_status ON leads (site_id, status);
