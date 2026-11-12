/**
 * 新线索短信提醒：线索入库后（公开线索接口与测评提交），给站点所属公司里打开了「新线索短信」的联系人各发一条。
 * 由调用方用 next/server 的 after() 在响应之后执行，不拖慢提交；每次发送（含失败与跳过）都写入 sms_logs。
 */
import { clip } from './http';
import { config } from './config';
import { exec, query, queryOne } from './db';
import { sendSms, smsConfigured, type SmsResult } from './sms';

interface Recipient {
  id: number;
  org_id: number;
  phone: string;
}

/**
 * 模板变量：${sitename} 站点名、${customer} 称呼、${contact} 联系方式。阿里云「其他」类变量单个不超过 35 个字符。
 * 变量名不能用 email、mobile、nick、id、site（阿里云保留）。
 */
export function leadSmsParams(site: string, name: string, contact: string) {
  return {
    sitename: clip(site, 20) || '官网',
    customer: clip(name, 12) || '访客',
    contact: clip(contact, 35) || '未留',
  };
}

async function log(r: Recipient, kind: 'lead' | 'test', leadId: number | null, res: SmsResult | { skipped: string }) {
  const status = 'skipped' in res ? 'skipped' : res.ok ? 'sent' : 'failed';
  await exec(
    `INSERT INTO sms_logs (org_id, contact_id, lead_id, phone, kind, status, biz_id, error) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      r.org_id,
      r.id,
      leadId,
      r.phone,
      kind,
      status,
      'skipped' in res ? '' : res.ok ? res.bizId : '',
      'skipped' in res ? res.skipped : res.ok ? '' : res.error,
    ],
  );
}

/** 该号码今天（北京时间）已经成功发出的新线索短信条数 */
async function sentToday(phone: string): Promise<number> {
  const row = await queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM sms_logs
     WHERE phone = $1 AND kind = 'lead' AND status = 'sent'
       AND created_at >= (date_trunc('day', now() AT TIME ZONE 'Asia/Shanghai') AT TIME ZONE 'Asia/Shanghai')`,
    [phone],
  );
  return row?.n ?? 0;
}

/** 给线索所在站点的公司联系人发提醒。不抛异常（在 after() 里执行，失败只记日志）。 */
export async function notifyNewLead(leadId: number): Promise<void> {
  try {
    const lead = await queryOne(
      `SELECT l.name, l.phone, l.email, s.name AS site_name, s.org_id
       FROM leads l JOIN sites s ON s.id = l.site_id WHERE l.id = $1`,
      [leadId],
    );
    if (!lead) return;
    const recipients = await query<Recipient>(
      `SELECT id, org_id, phone FROM org_contacts WHERE org_id = $1 AND notify_leads ORDER BY id`,
      [lead.org_id],
    );
    if (recipients.length === 0) return;
    const params = leadSmsParams(lead.site_name, lead.name, lead.phone || lead.email);
    const limit = config().smsDailyLimit;
    await Promise.all(
      recipients.map(async (r) => {
        if (!smsConfigured()) return log(r, 'lead', leadId, { skipped: '短信服务未配置（ALIYUN_* 环境变量）' });
        if ((await sentToday(r.phone)) >= limit) {
          return log(r, 'lead', leadId, { skipped: `该号码今天已收到 ${limit} 条，超出每日上限（SMS_DAILY_LIMIT）` });
        }
        return log(r, 'lead', leadId, await sendSms(r.phone, params));
      }),
    );
  } catch (err) {
    console.error(`新线索短信提醒失败（lead ${leadId}）:`, err);
  }
}

/** 管理员手动给某个联系人发一条测试短信（同一个模板，内容为示例），返回发送结果 */
export async function sendTestSms(r: Recipient, siteName: string): Promise<SmsResult> {
  const res = await sendSms(r.phone, leadSmsParams(siteName, '测试线索', r.phone));
  await log(r, 'test', null, res);
  return res;
}
