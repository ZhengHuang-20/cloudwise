/**
 * 线索表单字段的通用处理：脚本（自动识别或手动调用）上报的是「字段名 → 值」，不要求网站按固定的 name 命名。
 * 这里负责清洗（长度、敏感信息）、识别标准字段（姓名 / 手机 / 邮箱 / 公司 / 留言），其余原样进入 extra。
 */
import { clip } from './http';

export const STD_KEYS = ['name', 'phone', 'email', 'company', 'message'] as const;
export type StdKey = (typeof STD_KEYS)[number];
/** 站点字段映射的取值：标准字段，ignore（丢弃），extra（强制当作自定义字段） */
export type MapTarget = StdKey | 'ignore' | 'extra';

export interface RawField {
  /** 字段名（用户看到的标题） */
  k: string;
  v: string;
  /** 控件类型（tel / email / text ...），可选 */
  t?: string;
  /** 控件的 name / id，可选 */
  n?: string;
}

const MAX_FIELDS = 30;
const MAX_EXTRA = 20;

const SENSITIVE_KEY = /密码|口令|password|passwd|pwd|验证码|captcha|otp|token|身份证|证件号|银行卡|卡号|cvv|cvc|\bcard\b/i;
/** 15 / 18 位身份证号、16～19 位银行卡号 */
const SENSITIVE_VALUE = /^(\d{15}|\d{17}[\dXx]|\d{16,19})$/;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CN_MOBILE_RE = /^1[3-9]\d{9}$/;

const LABEL_RULES: [StdKey, RegExp][] = [
  ['email', /邮箱|邮件|e-?mail/i],
  ['phone', /手机|电话|联系方式|微信号?手机|mobile|phone|\btel\b|cell/i],
  ['company', /公司|企业|单位|机构|company|organi[sz]ation|business/i],
  ['message', /留言|备注|需求|说明|描述|咨询内容|message|comment|remark|note|inquiry|enquiry/i],
  ['name', /姓名|名字|称呼|联系人|真实姓名|^name$|full.?name|first.?name|contact.?name|your.?name|^姓$/i],
];

export function sanitizeValue(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return v === true ? '是' : v === false ? '否' : String(v);
  if (Array.isArray(v)) return v.map(sanitizeValue).filter(Boolean).join('、');
  return '';
}

/** 接受两种形式：`[{k, v, t?, n?}]`（自动识别）或 `{字段名: 值}`（手动调用），统一成数组。 */
export function normalizeFields(input: unknown): RawField[] {
  const out: RawField[] = [];
  const push = (k: unknown, v: unknown, t?: unknown, n?: unknown) => {
    const key = clip(typeof k === 'string' ? k : '', 40);
    const val = clip(sanitizeValue(v), 500);
    if (!key || !val) return;
    out.push({ k: key, v: val, t: clip(typeof t === 'string' ? t : '', 16).toLowerCase(), n: clip(typeof n === 'string' ? n : '', 64) });
  };
  if (Array.isArray(input)) {
    for (const f of input.slice(0, MAX_FIELDS)) {
      if (f && typeof f === 'object') push((f as any).k, (f as any).v, (f as any).t, (f as any).n);
    }
  } else if (input && typeof input === 'object') {
    for (const [k, v] of Object.entries(input).slice(0, MAX_FIELDS)) push(k, v);
  }
  return out.filter((f) => !SENSITIVE_KEY.test(f.k + ' ' + (f.n ?? '')) && !SENSITIVE_VALUE.test(f.v.replace(/[\s-]/g, '')));
}

/** 站点字段映射：只保留合法的「字段名 → 目标」。 */
export function parseFieldMap(raw: unknown): Record<string, MapTarget> {
  const out: Record<string, MapTarget> = {};
  if (!raw || typeof raw !== 'object') return out;
  const targets = new Set<string>([...STD_KEYS, 'ignore', 'extra']);
  for (const [k, v] of Object.entries(raw).slice(0, 100)) {
    if (k && k.length <= 40 && typeof v === 'string' && targets.has(v)) out[k] = v as MapTarget;
  }
  return out;
}

function guess(f: RawField): StdKey | null {
  if (f.t === 'email') return 'email';
  if (f.t === 'tel') return 'phone';
  const text = `${f.k} ${f.n ?? ''}`;
  for (const [key, re] of LABEL_RULES) if (re.test(text)) return key;
  const compact = f.v.replace(/[\s-]/g, '');
  if (EMAIL_RE.test(f.v)) return 'email';
  if (CN_MOBILE_RE.test(compact)) return 'phone';
  return null;
}

export interface ResolvedLead {
  std: Record<StdKey, string>;
  extra: Record<string, string>;
}

/**
 * 把字段分到标准列与 extra。explicit 是请求里直接带的标准字段（旧脚本、手动调用），优先；
 * 同一标准字段只取第一个匹配的，其余进入 extra。
 */
export function resolveLead(fields: RawField[], explicit: Partial<Record<StdKey, string>>, fieldMap: Record<string, MapTarget>): ResolvedLead {
  const std: Record<StdKey, string> = { name: '', phone: '', email: '', company: '', message: '' };
  for (const k of STD_KEYS) std[k] = explicit[k] ?? '';
  const extra: Record<string, string> = {};
  const addExtra = (k: string, v: string) => {
    if (k in extra) extra[k] = clip(`${extra[k]}、${v}`, 500);
    else if (Object.keys(extra).length < MAX_EXTRA) extra[k] = v;
  };
  for (const f of fields) {
    const mapped = fieldMap[f.k];
    if (mapped === 'ignore') continue;
    const target = mapped === 'extra' ? null : mapped ?? guess(f);
    if (target && !std[target]) std[target] = f.v;
    else addExtra(f.k, f.v);
  }
  return { std, extra };
}
