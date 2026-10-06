/**
 * 后台接口封装：同源请求，会话靠 HttpOnly cookie，写操作带 X-CSRF-Token。
 * 接口是 app/api 下的 Next.js Route Handlers；未配置数据库时账号与后台接口返回 503（db_unavailable）。
 */
let csrfToken = '';
export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T = any>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown } = {},
): Promise<T> {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken;
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'network', '网络异常，请稍后重试');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const unavailable = res.status === 404 && !data?.code;
    throw new ApiError(
      res.status,
      data?.code ?? 'http',
      unavailable ? '后台服务未启用' : (data?.error ?? '请求失败'),
    );
  }
  return data as T;
}

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
