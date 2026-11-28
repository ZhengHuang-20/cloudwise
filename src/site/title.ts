/**
 * <title> 的宽度与截断规则，浏览器端（page.tsx）与检查脚本（scripts/seo-audit.ts）共用一份，
 * 避免两处各写一套导致「检查通过但线上被截断」。
 *
 * 搜索结果大约显示 30 个汉字或 60 个英文字符（约 600px）。汉字与全角标点按 1 计，
 * 其余按 0.5 计（中文）；英文按字符数计。
 */
import type { Lang } from '../lib/i18n';
import { BRAND } from '../lib/site';

export const TITLE_LIMIT: Record<Lang, number> = { zh: 30, en: 60 };

export const titleWidth = (text: string, lang: Lang) =>
  lang === 'en' ? text.length : [...text].reduce((n, ch) => n + (/[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? 1 : 0.5), 0);

/** 英文标题都放不下时的兜底：优先取冒号前的主题（不少于 25 个字符），否则按词截断，并去掉结尾的虚词，不加省略号 */
const TRAILING_WORDS = /\s+(a|an|the|and|or|of|to|for|from|with|on|in|at|by|how|what|when|is|are|vs)$/i;
export function shortenEnglish(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const head = text.split(/[:\u2014]/)[0].trim();
  if (head.length >= 25 && head.length <= limit) return head;
  let cut = text.slice(0, limit + 1).replace(/\s+\S*$/, '').replace(/[,;:\s]+$/, '');
  while (TRAILING_WORDS.test(cut)) cut = cut.replace(TRAILING_WORDS, '');
  return cut;
}

/** 依次尝试完整标题与 shortTitles：带「 - 品牌」放得下就带上，放不下就去掉品牌；都放不下时用最短的一个 */
export function fitTitle(candidates: string[], lang: Lang): string | { absolute: string } {
  const suffix = ` - ${lang === 'en' ? BRAND.en : BRAND.zh}`;
  const limit = TITLE_LIMIT[lang];
  for (const text of candidates) {
    if (titleWidth(text + suffix, lang) <= limit) return text;
    if (titleWidth(text, lang) <= limit) return { absolute: text };
  }
  const shortest = candidates.reduce((a, b) => (titleWidth(b, lang) < titleWidth(a, lang) ? b : a));
  return { absolute: lang === 'en' ? shortenEnglish(shortest, limit) : shortest };
}

/** 页面最终会写进 <title> 的文本（含品牌后缀或 absolute 判定），供检查脚本比对 */
export function resolveTitleText(
  meta: { title: string; shortTitles?: string[]; absoluteTitle?: boolean },
  lang: Lang
): { text: string; fitted: boolean } {
  const candidates = [meta.title, ...(meta.shortTitles ?? [])];
  if (meta.absoluteTitle) {
    const chosen = candidates.find((text) => titleWidth(text, lang) <= TITLE_LIMIT[lang]);
    return { text: chosen ?? candidates[candidates.length - 1], fitted: chosen !== undefined };
  }
  const suffix = ` - ${lang === 'en' ? BRAND.en : BRAND.zh}`;
  for (const text of candidates) {
    if (titleWidth(text + suffix, lang) <= TITLE_LIMIT[lang]) return { text: text + suffix, fitted: true };
    if (titleWidth(text, lang) <= TITLE_LIMIT[lang]) return { text, fitted: true };
  }
  const shortest = candidates.reduce((a, b) => (titleWidth(b, lang) < titleWidth(a, lang) ? b : a));
  return { text: lang === 'en' ? shortenEnglish(shortest, TITLE_LIMIT.en) : shortest, fitted: false };
}
