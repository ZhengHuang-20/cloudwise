-- engine_set 是「探测平台 + 分析模型」的签名（如 openai,perplexity,gemini,analysis:anthropic/claude-haiku-5.5），
-- 配了 OpenRouter 的长模型名后会超过 64 个字符，保存报告时报 22001，所以放宽为 TEXT。
ALTER TABLE audits ALTER COLUMN engine_set TYPE TEXT;
