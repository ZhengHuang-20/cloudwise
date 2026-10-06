/** /api/auth/*：登录、当前用户、登出、改密 */
import { db, exec, queryOne, tx } from '../db';
import { apiError, clientIP, dbUnavailable, json, readJSON, route, str } from '../http';
import { limits } from '../ratelimit';
import {
  anyUser,
  authed,
  clearSessionCookie,
  createSession,
  getDummyHash,
  hashPassword,
  LOCK_MINUTES,
  MAX_FAILED_LOGIN,
  userJSON,
  validatePassword,
  verifyPassword,
} from '../auth';

const BAD_CREDS = '邮箱或密码错误';

export const login = route(async (req) => {
  if (!db()) return dbUnavailable();
  if (!(await limits.login(clientIP(req)))) return apiError(429, 'rate_limited', '请求过于频繁，请稍后再试');
  const body = await readJSON(req);
  const email = str(body.email).trim().toLowerCase();
  const password = str(body.password);
  if (!email || !password || Buffer.byteLength(password) > 256) return apiError(401, 'bad_credentials', BAD_CREDS);

  const user = await queryOne(`SELECT id, password_hash, disabled, locked_until FROM users WHERE email = $1`, [email]);
  if (!user) {
    await verifyPassword(password, await getDummyHash());
    return apiError(401, 'bad_credentials', BAD_CREDS);
  }
  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    return apiError(429, 'locked', `尝试次数过多，请 ${LOCK_MINUTES} 分钟后再试`);
  }
  if (!(await verifyPassword(password, user.password_hash)) || user.disabled) {
    // Postgres 的 SET 子句都读取更新前的值，两个字段互不影响。
    await exec(
      `UPDATE users SET
         locked_until = CASE WHEN failed_logins + 1 >= $1 THEN now() + make_interval(mins => $2) ELSE locked_until END,
         failed_logins = CASE WHEN failed_logins + 1 >= $1 THEN 0 ELSE failed_logins + 1 END
       WHERE id = $3`,
      [MAX_FAILED_LOGIN, LOCK_MINUTES, user.id],
    );
    return apiError(401, 'bad_credentials', BAD_CREDS);
  }

  await exec(`UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = now() WHERE id = $1`, [user.id]);
  const { csrf, cookie } = await createSession(req, user.id);
  const u = await queryOne(
    `SELECT id, email, role, org_id, display_name, must_change_password FROM users WHERE id = $1`,
    [user.id],
  );
  return json(
    {
      user: userJSON({
        id: u.id,
        email: u.email,
        role: u.role,
        displayName: u.display_name,
        orgId: u.org_id,
        mustChange: u.must_change_password,
        csrf,
        sessionId: '',
      }),
    },
    200,
    { 'Set-Cookie': cookie },
  );
});

export const me = authed(anyUser, async (_req, u) => json({ user: userJSON(u) }));

export const logout = authed(anyUser, async (req, u) => {
  await exec(`DELETE FROM sessions WHERE id = $1`, [u.sessionId]);
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie(req) });
});

export const changePassword = authed(anyUser, async (req, u) => {
  const body = await readJSON(req);
  const current = str(body.currentPassword);
  const next = str(body.newPassword);
  const row = await queryOne(`SELECT password_hash FROM users WHERE id = $1`, [u.id]);
  if (!row) return apiError(500, 'internal', '服务器内部错误');
  if (!(await verifyPassword(current, row.password_hash))) {
    return apiError(400, 'bad_current_password', '当前密码不正确');
  }
  const msg = validatePassword(next, u.email);
  if (msg) return apiError(400, 'weak_password', msg);
  if (next === current) return apiError(400, 'weak_password', '新密码不能与当前密码相同');

  const newHash = await hashPassword(next);
  await tx(async (c) => {
    await c.query(`UPDATE users SET password_hash = $1, must_change_password = FALSE WHERE id = $2`, [newHash, u.id]);
    // 改密后踢掉其他设备上的会话，保留当前会话。
    await c.query(`DELETE FROM sessions WHERE user_id = $1 AND id <> $2`, [u.id, u.sessionId]);
  });
  return json({ user: userJSON({ ...u, mustChange: false }) });
});
