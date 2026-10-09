/** /api/admin/*（仅管理员）与 /api/sites（我的站点） */
import { exec, isDuplicate, isFKViolation, query, queryOne, tx } from '../db';
import { apiError, json, pathID, readJSON, runeLen, str } from '../http';
import { adminOnly, authed, createUser, hashPassword, normalizeEmail, randomHex, randomPassword, validatePassword } from '../auth';

// ---------- 客户公司 ----------

export const listOrgs = authed(adminOnly, async () => {
  const rows = await query(`SELECT id, name, created_at FROM organizations ORDER BY id DESC`);
  return json({ organizations: rows.map((r) => ({ id: r.id, name: r.name, createdAt: r.created_at })) });
});

export const createOrg = authed(adminOnly, async (req) => {
  const body = await readJSON(req);
  const name = str(body.name).trim();
  if (!name || runeLen(name) > 128) return apiError(400, 'bad_request', '公司名称不能为空且不超过 128 字');
  const row = await queryOne(`INSERT INTO organizations (name) VALUES ($1) RETURNING id, name, created_at`, [name]);
  return json({ organization: { id: row.id, name: row.name, createdAt: row.created_at } }, 201);
});

// ---------- 账号 ----------

export const listUsers = authed(adminOnly, async () => {
  const rows = await query(
    `SELECT id, email, role, org_id, display_name, must_change_password, disabled, last_login_at, created_at
     FROM users ORDER BY id DESC`,
  );
  return json({
    users: rows.map((r) => ({
      id: r.id,
      email: r.email,
      role: r.role,
      displayName: r.display_name,
      mustChangePassword: r.must_change_password,
      disabled: r.disabled,
      createdAt: r.created_at,
      ...(r.org_id != null ? { orgId: r.org_id } : {}),
      ...(r.last_login_at ? { lastLoginAt: r.last_login_at } : {}),
    })),
  });
});

export const createUserRoute = authed(adminOnly, async (req) => {
  const body = await readJSON(req);
  const email = normalizeEmail(str(body.email));
  if (!email) return apiError(400, 'bad_request', '邮箱格式不正确');
  const role = str(body.role) || 'customer';
  if (role !== 'customer' && role !== 'admin') return apiError(400, 'bad_request', '角色只能是 customer 或 admin');
  const orgId = typeof body.orgId === 'number' && Number.isInteger(body.orgId) ? body.orgId : null;
  if (role === 'customer' && orgId == null) return apiError(400, 'bad_request', '客户账号必须指定所属公司 orgId');
  const password = str(body.password);
  if (password) {
    const msg = validatePassword(password, email);
    if (msg) return apiError(400, 'weak_password', msg.replace('新密码', '初始密码'));
  }
  const name = str(body.displayName).trim();
  if (runeLen(name) > 64) return apiError(400, 'bad_request', '姓名不超过 64 字');
  try {
    const created = await createUser(email, name, role, orgId, password);
    // 初始密码只在创建响应里出现一次，库里只存哈希。
    return json({ id: created.id, email, initialPassword: created.password }, 201);
  } catch (err) {
    if (isDuplicate(err)) return apiError(409, 'duplicate', '该邮箱已存在');
    if (isFKViolation(err)) return apiError(400, 'bad_request', '所属公司不存在');
    throw err;
  }
});

export const resetPassword = authed(adminOnly, async (_req, _u, params) => {
  const id = pathID(params.id);
  if (!id) return apiError(400, 'bad_request', '无效的用户 ID');
  const pw = randomPassword();
  const h = await hashPassword(pw);
  const found = await tx(async (c) => {
    const res = await c.query(
      `UPDATE users SET password_hash = $1, must_change_password = TRUE, failed_logins = 0, locked_until = NULL WHERE id = $2`,
      [h, id],
    );
    if (!res.rowCount) return false;
    await c.query(`DELETE FROM sessions WHERE user_id = $1`, [id]);
    return true;
  });
  if (!found) return apiError(404, 'not_found', '用户不存在');
  return json({ id, initialPassword: pw });
});

export const setDisabled = authed(adminOnly, async (req, me, params) => {
  const id = pathID(params.id);
  if (!id) return apiError(400, 'bad_request', '无效的用户 ID');
  const body = await readJSON(req);
  if (typeof body.disabled !== 'boolean') return apiError(400, 'bad_request', '缺少 disabled 字段');
  const disabled = body.disabled;
  if (id === me.id && disabled) return apiError(400, 'bad_request', '不能停用自己的账号');
  await exec(`UPDATE users SET disabled = $1 WHERE id = $2`, [disabled, id]);
  if (disabled) await exec(`DELETE FROM sessions WHERE user_id = $1`, [id]);
  return json({ id, disabled });
});

// ---------- 站点 ----------

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

/** 去掉协议、路径与端口，只保留小写主机名 */
export function normalizeDomain(input: string): string | null {
  let s = input.trim().toLowerCase().replace(/^https?:\/\//, '');
  const cut = s.search(/[/?#]/);
  if (cut >= 0) s = s.slice(0, cut);
  const colon = s.lastIndexOf(':');
  if (colon >= 0) s = s.slice(0, colon);
  return s.length <= 255 && DOMAIN_RE.test(s) ? s : null;
}

const SITE_COLS = `s.id, s.org_id, s.name, s.domain, s.hosting, s.site_key, s.created_at`;

const siteJSON = (r: any) => ({
  id: r.id,
  orgId: r.org_id,
  name: r.name,
  domain: r.domain,
  hosting: r.hosting,
  siteKey: r.site_key,
  createdAt: r.created_at,
});

export const listSites = authed(adminOnly, async () => {
  // 管理视角额外返回已授权的账号 ID（用于展示与撤销授权）与 Vercel 项目关联
  const rows = await query(
    `SELECT ${SITE_COLS}, s.vercel_team_id, s.vercel_project_id,
       COALESCE((SELECT array_agg(m.user_id::int ORDER BY m.user_id) FROM site_members m WHERE m.site_id = s.id), '{}') AS member_ids
     FROM sites s ORDER BY s.id DESC`,
  );
  return json({
    sites: rows.map((r) => ({
      ...siteJSON(r),
      vercelTeamId: r.vercel_team_id,
      vercelProjectId: r.vercel_project_id,
      memberIds: r.member_ids as number[],
    })),
  });
});

const VERCEL_TEAM_RE = /^team_[A-Za-z0-9]{8,64}$/;
const VERCEL_PROJECT_RE = /^prj_[A-Za-z0-9]{8,64}$/;

/** PATCH /api/admin/sites/{id}：设置站点关联的 Vercel 团队 ID 与项目 ID（留空表示不关联）。 */
export const updateSite = authed(adminOnly, async (req, _u, params) => {
  const id = pathID(params.id);
  if (!id) return apiError(400, 'bad_request', '无效的站点 ID');
  const body = await readJSON(req);
  const teamId = str(body.vercelTeamId).trim();
  const projectId = str(body.vercelProjectId).trim();
  if (teamId && !VERCEL_TEAM_RE.test(teamId)) return apiError(400, 'bad_request', '团队 ID 应以 team_ 开头');
  if (projectId && !VERCEL_PROJECT_RE.test(projectId)) return apiError(400, 'bad_request', '项目 ID 应以 prj_ 开头');
  const n = await exec(`UPDATE sites SET vercel_team_id = $2, vercel_project_id = $3 WHERE id = $1`, [id, teamId, projectId]);
  if (n === 0) return apiError(404, 'not_found', '站点不存在');
  return json({ ok: true });
});

export const createSite = authed(adminOnly, async (req) => {
  const body = await readJSON(req);
  const orgId = typeof body.orgId === 'number' && Number.isInteger(body.orgId) ? body.orgId : 0;
  const name = str(body.name).trim();
  const domain = normalizeDomain(str(body.domain));
  const hosting = str(body.hosting) || 'script';
  if (orgId <= 0) return apiError(400, 'bad_request', '请指定所属公司 orgId');
  if (!name || runeLen(name) > 128) return apiError(400, 'bad_request', '站点名称不能为空且不超过 128 字');
  if (!domain) return apiError(400, 'bad_request', '域名格式不正确，例如 www.example.com');
  if (!['vercel', 'script', 'self_hosted'].includes(hosting)) {
    return apiError(400, 'bad_request', 'hosting 只能是 vercel / script / self_hosted');
  }
  try {
    const row = await queryOne(
      `INSERT INTO sites (org_id, name, domain, hosting, site_key) VALUES ($1, $2, $3, $4, $5)
       RETURNING id, org_id, name, domain, hosting, site_key, created_at`,
      [orgId, name, domain, hosting, 'sk_' + randomHex(12)],
    );
    return json({ site: siteJSON(row) }, 201);
  } catch (err) {
    if (isDuplicate(err)) return apiError(409, 'duplicate', '该域名已接入');
    if (isFKViolation(err)) return apiError(400, 'bad_request', '所属公司不存在');
    throw err;
  }
});

export const addMember = authed(adminOnly, async (req, _u, params) => {
  const siteId = pathID(params.id);
  if (!siteId) return apiError(400, 'bad_request', '无效的站点 ID');
  const body = await readJSON(req);
  const userId = typeof body.userId === 'number' && Number.isInteger(body.userId) ? body.userId : 0;
  // 只允许把站点授权给同一公司的客户账号，避免串户。
  const match = await query(
    `SELECT 1 FROM sites s JOIN users u ON u.org_id = s.org_id WHERE s.id = $1 AND u.id = $2 AND u.role = 'customer'`,
    [siteId, userId],
  );
  if (match.length === 0) {
    return apiError(400, 'bad_request', '站点或用户不存在，或用户不属于该站点所在公司');
  }
  await exec(`INSERT INTO site_members (site_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [siteId, userId]);
  return json({ ok: true });
});

export const removeMember = authed(adminOnly, async (_req, _u, params) => {
  const siteId = pathID(params.id);
  const userId = pathID(params.userId);
  if (!siteId || !userId) return apiError(400, 'bad_request', '无效的 ID');
  await exec(`DELETE FROM site_members WHERE site_id = $1 AND user_id = $2`, [siteId, userId]);
  return json({ ok: true });
});

/** 客户视角的站点列表：管理员看全部，客户只看授权给自己的。 */
export const mySites = authed({}, async (_req, u) => {
  const rows =
    u.role === 'admin'
      ? await query(`SELECT ${SITE_COLS} FROM sites s ORDER BY s.id DESC`)
      : await query(
          `SELECT ${SITE_COLS} FROM sites s JOIN site_members m ON m.site_id = s.id WHERE m.user_id = $1 ORDER BY s.id DESC`,
          [u.id],
        );
  return json({ sites: rows.map(siteJSON) });
});
