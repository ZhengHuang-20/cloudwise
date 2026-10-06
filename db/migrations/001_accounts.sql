-- 客户后台：账号、会话、客户公司、站点与授权关系。
-- 时间统一 TIMESTAMPTZ（库内按 UTC 存储）。账号由管理员创建，不开放注册。

CREATE TABLE organizations (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id                   BIGSERIAL PRIMARY KEY,
  email                VARCHAR(191) NOT NULL UNIQUE,
  password_hash        VARCHAR(255) NOT NULL,
  role                 VARCHAR(16) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  org_id               BIGINT NULL REFERENCES organizations (id) ON DELETE SET NULL,
  display_name         VARCHAR(64) NOT NULL DEFAULT '',
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  disabled             BOOLEAN NOT NULL DEFAULT FALSE,
  failed_logins        INT NOT NULL DEFAULT 0,
  locked_until         TIMESTAMPTZ NULL,
  last_login_at        TIMESTAMPTZ NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_org ON users (org_id);

-- id 是会话令牌的 SHA-256 十六进制，库里不存明文令牌。
CREATE TABLE sessions (
  id         CHAR(64) PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  csrf_token CHAR(64) NOT NULL,
  ip         VARCHAR(64) NOT NULL DEFAULT '',
  user_agent VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions (user_id);
CREATE INDEX idx_sessions_expires ON sessions (expires_at);

-- site_key 用于采集脚本与留言接口识别站点（公开，不是密钥）。
CREATE TABLE sites (
  id         BIGSERIAL PRIMARY KEY,
  org_id     BIGINT NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  name       VARCHAR(128) NOT NULL,
  domain     VARCHAR(255) NOT NULL UNIQUE,
  hosting    VARCHAR(16) NOT NULL DEFAULT 'script' CHECK (hosting IN ('vercel', 'script', 'self_hosted')),
  site_key   VARCHAR(40) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sites_org ON sites (org_id);

-- 客户只能访问 site_members 里授权给自己的站点，所有数据查询都必须经过它做租户隔离。
CREATE TABLE site_members (
  site_id    BIGINT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
  user_id    BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (site_id, user_id)
);
CREATE INDEX idx_site_members_user ON site_members (user_id);
