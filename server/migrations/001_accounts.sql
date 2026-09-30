-- 客户后台：账号、会话、客户公司、站点与授权关系。
-- 所有时间均为 UTC。账号由管理员创建，不开放注册。

CREATE TABLE organizations (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(128) NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email                VARCHAR(191) NOT NULL,
  password_hash        VARCHAR(255) NOT NULL,
  role                 ENUM('admin','customer') NOT NULL DEFAULT 'customer',
  org_id               BIGINT UNSIGNED NULL,
  display_name         VARCHAR(64) NOT NULL DEFAULT '',
  must_change_password TINYINT(1) NOT NULL DEFAULT 1,
  disabled             TINYINT(1) NOT NULL DEFAULT 0,
  failed_logins        INT NOT NULL DEFAULT 0,
  locked_until         DATETIME NULL,
  last_login_at        DATETIME NULL,
  created_at           DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_org (org_id),
  CONSTRAINT fk_users_org FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- id 是会话令牌的 SHA-256 十六进制，库里不存明文令牌。
CREATE TABLE sessions (
  id         CHAR(64) NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  csrf_token CHAR(64) NOT NULL,
  ip         VARCHAR(45) NOT NULL DEFAULT '',
  user_agent VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- site_key 用于采集脚本与留言接口识别站点（公开，不是密钥）。
CREATE TABLE sites (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id     BIGINT UNSIGNED NOT NULL,
  name       VARCHAR(128) NOT NULL,
  domain     VARCHAR(255) NOT NULL,
  hosting    ENUM('vercel','script','self_hosted') NOT NULL DEFAULT 'script',
  site_key   VARCHAR(40) NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sites_key (site_key),
  UNIQUE KEY uq_sites_domain (domain),
  KEY idx_sites_org (org_id),
  CONSTRAINT fk_sites_org FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 客户只能访问 site_members 里授权给自己的站点，所有数据查询都必须经过它做租户隔离。
CREATE TABLE site_members (
  site_id    BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (site_id, user_id),
  KEY idx_site_members_user (user_id),
  CONSTRAINT fk_sm_site FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE,
  CONSTRAINT fk_sm_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
