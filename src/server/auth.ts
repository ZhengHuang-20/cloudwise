/**
 * 账号与会话：密码 argon2id，会话为 HttpOnly cookie（库里只存令牌的 SHA-256）+ X-CSRF-Token。
 * 首次登录必须改密，连续 5 次失败锁定 15 分钟。
 */
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import type { NextRequest } from 'next/server';
import { db, exec, query, queryOne } from './db';
import { apiError, clientIP, dbUnavailable, isSecure, route, userAgent } from './http';

export const SESSION_COOKIE = 'cw_session';
const SESSION_TTL_MS = 7 * 24 * 3600 * 1000;
export const MAX_FAILED_LOGIN = 5;
export const LOCK_MINUTES = 15;
const MIN_PASSWORD_LEN = 10;

// ---------- 密码 ----------

// 与原 Go 版参数一致（m=64MiB, t=3, p=2），PHC 字符串格式相同，旧哈希可直接校验。
const ARGON = { memoryCost: 64 * 1024, timeCost: 3, parallelism: 2, outputLen: 32 };

export const hashPassword = (pw: string) => hash(pw, ARGON);

export async function verifyPassword(pw: string, encoded: string): Promise<boolean> {
  if (!encoded.startsWith('$argon2id$')) return false;
  try {
    return await verify(encoded, pw);
  } catch {
    return false;
  }
}

// 用户不存在时也做一次等价的哈希校验，避免通过响应时间枚举邮箱。
let dummyHash: Promise<string> | null = null;
export const getDummyHash = () => (dummyHash ??= hashPassword('dummy-password-for-timing'));

const PW_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

/** 生成 16 位、不含易混字符的初始密码 */
export function randomPassword(): string {
  let out = '';
  for (let i = 0; i < 16; i++) out += PW_ALPHABET[randomInt(PW_ALPHABET.length)];
  return out;
}

export const randomHex = (n: number) => randomBytes(n).toString('hex');
export const sha256Hex = (s: string) => createHash('sha256').update(s).digest('hex');

const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

/** 规范化邮箱（小写、去空白）；格式不对时返回 null */
export function normalizeEmail(s: string): string | null {
  const e = s.trim().toLowerCase();
  if (!e || e.length > 191 || !EMAIL_RE.test(e) || e.includes('..')) return null;
  return e;
}

export function validatePassword(pw: string, email: string): string {
  if (Array.from(pw).length < MIN_PASSWORD_LEN) return `新密码至少 ${MIN_PASSWORD_LEN} 位`;
  if (Buffer.byteLength(pw) > 256) return '新密码过长';
  if (pw.toLowerCase() === email.toLowerCase()) return '新密码不能与邮箱相同';
  return '';
}

/** 写入账号并返回一次性展示的初始密码（未指定时随机生成）。 */
export async function createUser(
  email: string,
  name: string,
  role: 'admin' | 'customer',
  orgId: number | null,
  password = '',
): Promise<{ id: number; password: string }> {
  const pw = password || randomPassword();
  const h = await hashPassword(pw);
  const row = await queryOne<{ id: number }>(
    `INSERT INTO users (email, password_hash, role, org_id, display_name, must_change_password)
     VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING id`,
    [email, h, role, orgId, name],
  );
  return { id: row!.id, password: pw };
}

// ---------- 会话 ----------

export interface AuthedUser {
  id: number;
  email: string;
  role: 'admin' | 'customer';
  displayName: string;
  orgId: number | null;
  mustChange: boolean;
  csrf: string;
  sessionId: string;
}

export function userJSON(u: AuthedUser) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    displayName: u.displayName,
    mustChangePassword: u.mustChange,
    csrfToken: u.csrf,
    ...(u.orgId != null ? { orgId: u.orgId } : {}),
  };
}

function sessionCookie(req: NextRequest, token: string, expires: Date) {
  const parts = [`${SESSION_COOKIE}=${token}`, 'Path=/', `Expires=${expires.toUTCString()}`, 'HttpOnly', 'SameSite=Lax'];
  if (isSecure(req)) parts.push('Secure');
  return parts.join('; ');
}

export const clearSessionCookie = (req: NextRequest) => sessionCookie(req, '', new Date(0));

/** 创建会话，返回 CSRF 令牌与要写入响应的 Set-Cookie */
export async function createSession(req: NextRequest, userId: number): Promise<{ csrf: string; cookie: string }> {
  const token = randomHex(32);
  const csrf = randomHex(32);
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  await exec(
    `INSERT INTO sessions (id, user_id, csrf_token, ip, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5, $6)`,
    [sha256Hex(token), userId, csrf, clientIP(req), userAgent(req).slice(0, 255), expires],
  );
  // 顺手清理过期会话（原来由常驻进程每小时清理一次）
  exec(`DELETE FROM sessions WHERE expires_at < now()`).catch(() => {});
  return { csrf, cookie: sessionCookie(req, token, expires) };
}

async function loadUser(req: NextRequest): Promise<AuthedUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const sid = sha256Hex(token);
  const row = await queryOne(
    `SELECT u.id, u.email, u.role, u.org_id, u.display_name, u.must_change_password, s.csrf_token
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.expires_at > now() AND NOT u.disabled`,
    [sid],
  );
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    displayName: row.display_name,
    orgId: row.org_id,
    mustChange: row.must_change_password,
    csrf: row.csrf_token,
    sessionId: sid,
  };
}

/** 可选登录：已登录且改过初始密码时返回用户，否则返回 null。只读身份用，不校验 CSRF，公开接口可以用它放宽限制 */
export async function currentUser(req: NextRequest): Promise<AuthedUser | null> {
  if (!db()) return null;
  const user = await loadUser(req);
  return user && !user.mustChange ? user : null;
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export interface AuthOpts {
  /** 为空表示任意已登录用户 */
  role?: 'admin';
  /** 首次登录未改密时是否仍放行 */
  allowMustChange?: boolean;
}

type AuthedHandler = (req: NextRequest, user: AuthedUser, params: Record<string, string>) => Promise<Response>;

/** 需要登录的接口：校验会话、CSRF、角色，并在未改密时拦截业务接口。 */
export function authed(opts: AuthOpts, fn: AuthedHandler) {
  return route(async (req, ctx) => {
    if (!db()) return dbUnavailable();
    const user = await loadUser(req);
    if (!user) return apiError(401, 'unauthorized', '请先登录');
    if (req.method !== 'GET' && req.method !== 'HEAD' && !safeEqual(req.headers.get('x-csrf-token') ?? '', user.csrf)) {
      return apiError(403, 'csrf', '请求校验失败，请刷新页面后重试');
    }
    if (user.mustChange && !opts.allowMustChange) return apiError(403, 'password_change_required', '请先修改初始密码');
    if (opts.role && user.role !== opts.role) return apiError(403, 'forbidden', '没有权限');
    return fn(req, user, (await ctx.params) ?? {});
  });
}

export const adminOnly: AuthOpts = { role: 'admin' };
export const anyUser: AuthOpts = { allowMustChange: true };

/** 站点访问权：管理员全部，客户只限 site_members 授权的站点。 */
export async function siteAccess(user: AuthedUser, siteId: number): Promise<boolean> {
  const rows =
    user.role === 'admin'
      ? await query(`SELECT 1 FROM sites WHERE id = $1`, [siteId])
      : await query(`SELECT 1 FROM site_members WHERE site_id = $1 AND user_id = $2`, [siteId, user.id]);
  return rows.length > 0;
}
