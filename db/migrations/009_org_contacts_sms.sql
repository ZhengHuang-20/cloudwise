-- 企业联系人与新线索短信提醒。
-- 管理员在「客户公司」里登记联系人（如企业负责人）的手机号，打开「新线索短信」后，
-- 该公司任一站点收到新线索时给联系人发一条短信（阿里云短信服务，见 src/server/sms.ts）。
CREATE TABLE org_contacts (
  id          BIGSERIAL PRIMARY KEY,
  org_id      BIGINT NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  name        VARCHAR(32) NOT NULL,
  title       VARCHAR(32) NOT NULL DEFAULT '',
  -- 11 位大陆手机号（不带 +86）
  phone       VARCHAR(11) NOT NULL,
  notify_leads BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, phone)
);
CREATE INDEX idx_org_contacts_org ON org_contacts (org_id);

-- 每条短信的发送记录：排查「为什么没收到」，也用于按号码计算每日发送量。
-- 联系人或线索删除后记录保留（不加外键），号码照常可查。
CREATE TABLE sms_logs (
  id          BIGSERIAL PRIMARY KEY,
  org_id      BIGINT NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  contact_id  BIGINT NULL,
  lead_id     BIGINT NULL,
  phone       VARCHAR(11) NOT NULL,
  kind        VARCHAR(8) NOT NULL CHECK (kind IN ('lead', 'test')),
  status      VARCHAR(8) NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  -- 服务商回执号（阿里云 BizId），失败时为空
  biz_id      VARCHAR(64) NOT NULL DEFAULT '',
  -- 失败或跳过的原因（服务商错误码 + 说明），不含密钥
  error       VARCHAR(255) NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sms_logs_org_time ON sms_logs (org_id, created_at);
CREATE INDEX idx_sms_logs_phone_time ON sms_logs (phone, created_at);
