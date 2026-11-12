/** /api/admin/organizations/{id}/contacts*（仅管理员）：企业联系人、新线索短信开关、测试短信与发送记录 */
import { normalizeName, normalizePhone } from '../../lib/contact';
import { adminOnly, authed } from '../auth';
import { config } from '../config';
import { exec, isDuplicate, isFKViolation, query, queryOne } from '../db';
import { apiError, json, pathID, readJSON, runeLen, str } from '../http';
import { sendTestSms } from '../leadNotify';
import { smsConfigured } from '../sms';

const PHONE_RE = /^1[3-9]\d{9}$/;
const COLS = `id, org_id, name, title, phone, notify_leads, created_at`;

const contactJSON = (r: any) => ({
  id: r.id,
  orgId: r.org_id,
  name: r.name,
  title: r.title,
  phone: r.phone,
  notifyLeads: r.notify_leads,
  createdAt: r.created_at,
});

/** 校验并整理请求体；partial 为 true 时（PATCH）只校验出现的字段 */
function parseBody(body: Record<string, unknown>, partial: boolean) {
  const out: { name?: string; title?: string; phone?: string; notifyLeads?: boolean } = {};
  if (!partial || 'name' in body) {
    const name = normalizeName(str(body.name));
    if (!name || runeLen(name) > 32) return { error: '姓名不能为空且不超过 32 字' };
    out.name = name;
  }
  if (!partial || 'title' in body) {
    const title = str(body.title).trim();
    if (runeLen(title) > 32) return { error: '职务不超过 32 字' };
    out.title = title;
  }
  if (!partial || 'phone' in body) {
    const phone = normalizePhone(str(body.phone));
    if (!PHONE_RE.test(phone)) return { error: '请填写 11 位大陆手机号' };
    out.phone = phone;
  }
  if ('notifyLeads' in body) {
    if (typeof body.notifyLeads !== 'boolean') return { error: 'notifyLeads 应为布尔值' };
    out.notifyLeads = body.notifyLeads;
  } else if (!partial) {
    out.notifyLeads = true;
  }
  return { value: out };
}

/** GET：公司的联系人、短信配置状态与最近 50 条发送记录 */
export const listContacts = authed(adminOnly, async (_req, _u, params) => {
  const orgId = pathID(params.id);
  if (!orgId) return apiError(400, 'bad_request', '无效的公司 ID');
  const [contacts, logs] = await Promise.all([
    query(`SELECT ${COLS} FROM org_contacts WHERE org_id = $1 ORDER BY id`, [orgId]),
    query(
      `SELECT l.id, l.contact_id, l.phone, l.kind, l.status, l.error, l.created_at, c.name AS contact_name, d.name AS lead_name
       FROM sms_logs l
       LEFT JOIN org_contacts c ON c.id = l.contact_id
       LEFT JOIN leads d ON d.id = l.lead_id
       WHERE l.org_id = $1 ORDER BY l.id DESC LIMIT 50`,
      [orgId],
    ),
  ]);
  return json({
    contacts: contacts.map(contactJSON),
    smsConfigured: smsConfigured(),
    dailyLimit: config().smsDailyLimit,
    logs: logs.map((r) => ({
      id: r.id,
      contactName: r.contact_name ?? '',
      phone: r.phone,
      kind: r.kind,
      status: r.status,
      error: r.error,
      leadName: r.lead_name ?? '',
      createdAt: r.created_at,
    })),
  });
});

export const createContact = authed(adminOnly, async (req, _u, params) => {
  const orgId = pathID(params.id);
  if (!orgId) return apiError(400, 'bad_request', '无效的公司 ID');
  const parsed = parseBody(await readJSON(req), false);
  if ('error' in parsed) return apiError(400, 'bad_request', parsed.error!);
  const v = parsed.value;
  try {
    const row = await queryOne(
      `INSERT INTO org_contacts (org_id, name, title, phone, notify_leads) VALUES ($1, $2, $3, $4, $5) RETURNING ${COLS}`,
      [orgId, v.name, v.title, v.phone, v.notifyLeads],
    );
    return json({ contact: contactJSON(row) }, 201);
  } catch (err) {
    if (isDuplicate(err)) return apiError(409, 'duplicate', '该手机号已在联系人中');
    if (isFKViolation(err)) return apiError(404, 'not_found', '公司不存在');
    throw err;
  }
});

export const updateContact = authed(adminOnly, async (req, _u, params) => {
  const orgId = pathID(params.id);
  const id = pathID(params.contactId);
  if (!orgId || !id) return apiError(400, 'bad_request', '无效的 ID');
  const parsed = parseBody(await readJSON(req), true);
  if ('error' in parsed) return apiError(400, 'bad_request', parsed.error!);
  const v = parsed.value;
  const cols: Record<string, unknown> = { name: v.name, title: v.title, phone: v.phone, notify_leads: v.notifyLeads };
  const sets: string[] = [];
  const args: unknown[] = [];
  for (const [col, val] of Object.entries(cols)) {
    if (val === undefined) continue;
    args.push(val);
    sets.push(`${col} = $${args.length}`);
  }
  if (sets.length === 0) return apiError(400, 'bad_request', '没有要修改的字段');
  args.push(id, orgId);
  try {
    const row = await queryOne(
      `UPDATE org_contacts SET ${sets.join(', ')} WHERE id = $${args.length - 1} AND org_id = $${args.length} RETURNING ${COLS}`,
      args,
    );
    if (!row) return apiError(404, 'not_found', '联系人不存在');
    return json({ contact: contactJSON(row) });
  } catch (err) {
    if (isDuplicate(err)) return apiError(409, 'duplicate', '该手机号已在联系人中');
    throw err;
  }
});

export const deleteContact = authed(adminOnly, async (_req, _u, params) => {
  const orgId = pathID(params.id);
  const id = pathID(params.contactId);
  if (!orgId || !id) return apiError(400, 'bad_request', '无效的 ID');
  const n = await exec(`DELETE FROM org_contacts WHERE id = $1 AND org_id = $2`, [id, orgId]);
  if (n === 0) return apiError(404, 'not_found', '联系人不存在');
  return json({ ok: true });
});

/** POST .../test：用新线索模板给该联系人发一条示例短信，确认签名、模板与号码都正常 */
export const testContact = authed(adminOnly, async (_req, _u, params) => {
  const orgId = pathID(params.id);
  const id = pathID(params.contactId);
  if (!orgId || !id) return apiError(400, 'bad_request', '无效的 ID');
  if (!smsConfigured()) return apiError(503, 'sms_unconfigured', '短信服务未配置，请先在 Vercel 环境变量里填写 ALIYUN_* 四项并重新部署');
  const contact = await queryOne(`SELECT id, org_id, phone FROM org_contacts WHERE id = $1 AND org_id = $2`, [id, orgId]);
  if (!contact) return apiError(404, 'not_found', '联系人不存在');
  const site = await queryOne(`SELECT name FROM sites WHERE org_id = $1 ORDER BY id LIMIT 1`, [orgId]);
  const res = await sendTestSms(contact, site?.name ?? '官网');
  if (!res.ok) return apiError(502, 'sms_failed', `发送失败：${res.error}`);
  return json({ ok: true });
});
