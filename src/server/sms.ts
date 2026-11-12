/**
 * 短信发送：阿里云短信服务（Dysmsapi 2017-05-25 SendSms，RPC 风格 + HMAC-SHA1 签名，不依赖 SDK）。
 * 只在服务端使用；AccessKey 只来自环境变量。签名与模板要先在阿里云控制台申请并审核通过。
 */
import { createHmac, randomUUID } from 'node:crypto';
import { config } from './config';

export type SmsResult = { ok: true; bizId: string } | { ok: false; error: string };

/** AccessKey、签名、新线索模板都配齐才算可用 */
export function smsConfigured(): boolean {
  const c = config();
  return !!(c.aliyunAccessKeyId && c.aliyunAccessKeySecret && c.smsSignName && c.smsTemplateLead);
}

/** 阿里云 RPC 签名要求的编码：在 encodeURIComponent 基础上再编码 ! ' ( ) * */
const percentEncode = (s: string) =>
  encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

/** 计算 RPC 签名（SignatureVersion 1.0）：参数按名称排序 → 规范化查询串 → HMAC-SHA1(secret + '&') → Base64 */
export function signRpc(params: Record<string, string>, secret: string, method = 'POST'): string {
  const canonical = Object.keys(params)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`)
    .join('&');
  const stringToSign = `${method}&${percentEncode('/')}&${percentEncode(canonical)}`;
  return createHmac('sha1', secret + '&').update(stringToSign).digest('base64');
}

/** 常见错误码的中文说明，便于在发送记录里直接看懂原因 */
const HINTS: Record<string, string> = {
  'isv.SMS_SIGNATURE_ILLEGAL': '短信签名不存在或未审核通过',
  'isv.SMS_SIGN_ILLEGAL': '短信签名不存在或未审核通过',
  'isv.SMS_TEMPLATE_ILLEGAL': '模板不存在、未审核通过或不属于该账号',
  'isv.TEMPLATE_MISSING_PARAMETERS': '模板变量与 ${sitename} ${customer} ${contact} 不一致',
  'isv.TEMPLATE_PARAMS_ILLEGAL': '模板变量的内容不符合变量属性（如把邮箱填进了「电话号码」类型的变量）',
  'isv.BUSINESS_LIMIT_CONTROL': '触发阿里云对同一号码的发送频率限制',
  'isv.DAY_LIMIT_CONTROL': '触发阿里云的每日发送上限',
  'isv.MOBILE_NUMBER_ILLEGAL': '手机号格式不正确',
  'isv.AMOUNT_NOT_ENOUGH': '阿里云账户余额不足',
  'isv.OUT_OF_SERVICE': '阿里云账户已停机（欠费）',
  'isv.BLACK_KEY_CONTROL_LIMIT': '内容含有阿里云禁止的关键字',
  'isv.DENY_IP_RANGE': '阿里云账号设置了 IP 白名单，Vercel 的出口 IP 不在其中',
  'InvalidAccessKeyId.NotFound': 'AccessKey ID 不存在',
  SignatureDoesNotMatch: 'AccessKey Secret 不正确',
  'Forbidden.RAM': 'AccessKey 所属的 RAM 用户没有短信发送权限（需要 AliyunDysmsFullAccess 或 dysms:SendSms）',
};

/**
 * 用新线索模板给一个号码发短信。params 是模板变量（如 { sitename, customer, contact }），值需符合模板的变量属性。
 * 不抛异常：网络错误、超时与服务商拒绝都返回 { ok: false, error }。
 */
export async function sendSms(phone: string, params: Record<string, string>): Promise<SmsResult> {
  const c = config();
  if (!smsConfigured()) return { ok: false, error: '短信服务未配置' };
  const p: Record<string, string> = {
    AccessKeyId: c.aliyunAccessKeyId,
    Action: 'SendSms',
    Format: 'JSON',
    PhoneNumbers: phone,
    RegionId: 'cn-hangzhou',
    SignName: c.smsSignName,
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: randomUUID(),
    SignatureVersion: '1.0',
    TemplateCode: c.smsTemplateLead,
    TemplateParam: JSON.stringify(params),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: '2017-05-25',
  };
  const body = new URLSearchParams({ ...p, Signature: signRpc(p, c.aliyunAccessKeySecret) });
  try {
    const res = await fetch(`https://${c.smsEndpoint}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as { Code?: string; Message?: string; BizId?: string } | null;
    if (data?.Code === 'OK') return { ok: true, bizId: data.BizId ?? '' };
    const code = data?.Code ?? `HTTP ${res.status}`;
    const hint = HINTS[code] ?? data?.Message ?? '发送失败';
    return { ok: false, error: `${code}：${hint}`.slice(0, 255) };
  } catch (err) {
    const e = err as Error & { cause?: { code?: string; message?: string } };
    if (e?.name === 'TimeoutError') return { ok: false, error: '请求阿里云超时' };
    // Node 的 fetch 只报 "fetch failed"，具体原因（DNS、连接被拒等）在 cause 里
    const detail = e?.cause?.code || e?.cause?.message || e?.message || String(err);
    return { ok: false, error: `请求阿里云失败：${detail}`.slice(0, 255) };
  }
}
