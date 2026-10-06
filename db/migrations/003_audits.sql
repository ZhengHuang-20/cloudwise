-- AI 可见性测评：任务进度与结果都存在这张表里。
-- Vercel 上创建任务与轮询进度的请求可能落在不同的函数实例，所以任务状态不能只放内存。
-- report 保存完整报告（含 AI 回答原文与引用来源），以后调整评分公式时可以重新计算，不必再调用模型。
CREATE TABLE audits (
  id          CHAR(32) PRIMARY KEY,
  target_key  VARCHAR(255) NOT NULL,
  status      VARCHAR(16) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'done', 'failed')),
  step        SMALLINT NOT NULL DEFAULT 0,
  done        INT NOT NULL DEFAULT 0,
  total       INT NOT NULL DEFAULT 0,
  engines     JSONB NOT NULL DEFAULT '[]',
  log         JSONB NOT NULL DEFAULT '[]',
  error       TEXT NOT NULL DEFAULT '',
  mode        VARCHAR(16) NULL CHECK (mode IN ('live', 'sample', 'site_only')),
  engine_set  VARCHAR(64) NOT NULL DEFAULT '',
  total_score SMALLINT NULL,
  report      JSONB NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audits_target_time ON audits (target_key, created_at);
-- 同一目标同时只有一个进行中的任务，并发提交时合并到同一个任务。
CREATE UNIQUE INDEX uq_audits_running ON audits (target_key) WHERE status IN ('queued', 'running');

-- 限流与每日额度计数（固定窗口）。函数实例之间不共享内存，计数放在库里才准确。
CREATE TABLE rate_limits (
  key          VARCHAR(191) PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  hits         INT NOT NULL
);
CREATE INDEX idx_rate_limits_window ON rate_limits (window_start);
