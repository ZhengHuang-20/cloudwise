-- 站点访问记录与线索。所有时间均为 UTC。
-- visitor_id 由采集脚本在访客浏览器里生成的随机匿名 ID，不含个人信息，不记录 IP。
CREATE TABLE visits (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id    BIGINT UNSIGNED NOT NULL,
  visitor_id VARCHAR(40) NOT NULL,
  path       VARCHAR(512) NOT NULL,
  referrer   VARCHAR(255) NOT NULL DEFAULT '',
  device     ENUM('desktop','mobile','tablet') NOT NULL DEFAULT 'desktop',
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_visits_site_time (site_id, created_at),
  CONSTRAINT fk_visits_site FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 线索：其他网站的访客留下的联系方式。
CREATE TABLE leads (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id     BIGINT UNSIGNED NOT NULL,
  name        VARCHAR(64) NOT NULL DEFAULT '',
  phone       VARCHAR(32) NOT NULL DEFAULT '',
  email       VARCHAR(191) NOT NULL DEFAULT '',
  company     VARCHAR(128) NOT NULL DEFAULT '',
  message     VARCHAR(2000) NOT NULL DEFAULT '',
  source_page VARCHAR(512) NOT NULL DEFAULT '',
  visitor_id  VARCHAR(40) NOT NULL DEFAULT '',
  status      ENUM('new','contacted','qualified','closed','invalid') NOT NULL DEFAULT 'new',
  note        VARCHAR(1000) NOT NULL DEFAULT '',
  ip          VARCHAR(45) NOT NULL DEFAULT '',
  user_agent  VARCHAR(255) NOT NULL DEFAULT '',
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_leads_site_time (site_id, created_at),
  KEY idx_leads_site_status (site_id, status),
  CONSTRAINT fk_leads_site FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
