-- AI 可见性测评结果。result_json 保存完整报告（含 AI 回答原文与引用来源），
-- 以后调整评分公式时可以重新计算，不必再调用模型。时间为 UTC。
CREATE TABLE audits (
  id          CHAR(32) NOT NULL,
  target_key  VARCHAR(255) NOT NULL,
  mode        ENUM('live','sample','site_only') NOT NULL,
  total_score TINYINT UNSIGNED NOT NULL,
  result_json MEDIUMTEXT NOT NULL,
  created_at  DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_audits_target_time (target_key, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
