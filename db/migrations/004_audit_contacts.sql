-- AI 可见性测评的联系方式：每次提交都记一条，包括复用 7 天内已有报告的提交，方便销售回访。
-- 只通过服务端写入，不提供任何公开的读取接口。
CREATE TABLE audit_contacts (
  id            BIGSERIAL PRIMARY KEY,
  target        VARCHAR(255) NOT NULL,
  contact_name  VARCHAR(20) NOT NULL,
  contact_phone VARCHAR(11) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_contacts_time ON audit_contacts (created_at);
CREATE INDEX idx_audit_contacts_phone ON audit_contacts (contact_phone);
