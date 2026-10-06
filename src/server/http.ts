/** Route Handler 公用工具：统一的 JSON 响应、错误格式、请求体解析与客户端 IP。 */
import type { NextRequest } from 'next/server';
import { config } from './config';

export const json = (data: unknown, status = 200, headers?: HeadersInit) => Response.json(data, { status, headers });

export const apiError = (status: number, code: string, message: string, headers?: HeadersInit) =>
  json({ error: message, code }, status, headers);

export const internalError = () => apiError(500, 'internal', '服务器内部错误');
export const dbUnavailable = () => apiError(503, 'db_unavailable', '数据库未配置');

/** 处理函数里抛出即可直接返回对应的错误响应 */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

type Ctx = { params: Promise<Record<string, string>> };

/** 包装 Route Handler：HttpError 转成错误响应，其他异常记日志并返回 500。 */
export function route(fn: (req: NextRequest, ctx: Ctx) => Promise<Response>) {
  return async (req: NextRequest, ctx: Ctx): Promise<Response> => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) return apiError(err.status, err.code, err.message);
      console.error(`${req.method} ${req.nextUrl.pathname} 失败:`, err);
      return internalError();
    }
  };
}

const MAX_BODY = 10 << 20;

/** 读取 JSON 请求体（不看 Content-Type，sendBeacon 发来的 text/plain 也能解析）。 */
export async function readJSON(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text().catch(() => '');
  if (text.length > MAX_BODY) throw new HttpError(400, 'bad_request', '请求体过大');
  try {
    const v = JSON.parse(text);
    if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  } catch {
    // 落到下面统一报错
  }
  throw new HttpError(400, 'bad_request', '请求体不是有效的 JSON');
}

/** 取字符串字段；类型不对时当作空字符串 */
export const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** 解析正整数路径参数 */
export const pathID = (v: string | undefined) => {
  if (!v || !/^\d{1,15}$/.test(v)) return 0;
  const n = Number(v);
  return n > 0 ? n : 0;
};

/** 客户端 IP：Vercel 会覆盖 x-forwarded-for / x-real-ip，客户端无法伪造；本地开发时没有这两个头。 */
export function clientIP(req: Request): string {
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim().slice(0, 64);
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim().slice(0, 64);
  return '127.0.0.1';
}

export function isSecure(req: NextRequest): boolean {
  return config().cookieSecure || req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
}

export const userAgent = (req: Request) => req.headers.get('user-agent') ?? '';

/** 按字符（非字节）截断并去掉首尾空白 */
export function clip(s: string, n: number): string {
  const t = s.trim();
  const chars = Array.from(t);
  return chars.length > n ? chars.slice(0, n).join('') : t;
}

export const runeLen = (s: string) => Array.from(s).length;
