-- 线索的自定义字段：任意表单里除姓名 / 手机 / 邮箱 / 公司 / 留言之外的填写内容，按「字段名 → 值」原样保存。
-- 站点的字段映射：服务端识别不准时，管理员配「表单字段名 → 标准字段」，改了立即生效，不用网站重新发版。
ALTER TABLE leads ADD COLUMN extra JSONB NOT NULL DEFAULT '{}';
ALTER TABLE sites ADD COLUMN field_map JSONB NOT NULL DEFAULT '{}';
