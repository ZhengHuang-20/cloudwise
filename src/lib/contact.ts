/**
 * 测评表单的联系方式校验。前端表单与服务端 /api/public/audits 共用，规则只写这一处。
 */
export const CONTACT_NAME_MAX = 20;

/** 去掉多余空格，得到展示与入库用的姓名 */
export const normalizeName = (raw: string) => raw.trim().split(/\s+/).join(' ');

/** 去掉空格、连字符与 +86 前缀，得到 11 位大陆手机号 */
export const normalizePhone = (raw: string) => raw.replace(/[\s-]/g, '').replace(/^\+?86(?=1)/, '');

/** 返回错误文案；空字符串表示通过 */
export const contactNameError = (raw: string) => {
  const name = normalizeName(raw);
  if (!name || [...name].length > CONTACT_NAME_MAX || /[<>{}\\/@]/.test(name)) {
    return `请填写联系人姓名（${CONTACT_NAME_MAX} 个字以内）`;
  }
  return '';
};

export const contactPhoneError = (raw: string) =>
  /^1[3-9]\d{9}$/.test(normalizePhone(raw)) ? '' : '请填写 11 位手机号码';

export type ContactResult = { ok: true; name: string; phone: string } | { ok: false; message: string };

export function parseContact(rawName: string, rawPhone: string): ContactResult {
  const message = contactNameError(rawName) || contactPhoneError(rawPhone);
  if (message) return { ok: false, message };
  return { ok: true, name: normalizeName(rawName), phone: normalizePhone(rawPhone) };
}
