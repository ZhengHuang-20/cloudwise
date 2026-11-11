/**
 * 「GEO 洞察」的 RSS 订阅：/feed.xml（中文）与 /en/feed.xml（英文），构建时生成。
 * 阅读器、Bing 与部分 AI 抓取方用它发现新文章；条目带开头的直接回答。
 */
import type { Lang } from '../lib/i18n';
import { AUTHORS } from '../data/authors';
import { INSIGHTS, INSIGHT_TOPIC_LABEL } from '../data/insights';
import { BRAND, absoluteUrl } from '../lib/site';
import { routeMeta } from './meta';
import { localizePath } from './routes';

const esc = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** YYYY-MM-DD（北京时间）→ RFC 822 */
const rfc822 = (date: string) => new Date(`${date}T00:00:00+08:00`).toUTCString();

export const feedPath = (lang: Lang) => (lang === 'en' ? '/en/feed.xml' : '/feed.xml');

export function insightsFeed(lang: Lang): string {
  const meta = routeMeta({ kind: 'insights' }, lang);
  const self = absoluteUrl(feedPath(lang));
  const latest = INSIGHTS.reduce((max, i) => (i.updatedAt > max ? i.updatedAt : max), INSIGHTS[0]?.updatedAt ?? '2026-01-01');
  const items = INSIGHTS.map((i) => {
    const url = absoluteUrl(localizePath(`/insights/${i.slug}`, lang));
    const content = i[lang];
    return [
      '    <item>',
      `      <title>${esc(content.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${rfc822(i.publishedAt)}</pubDate>`,
      `      <dc:creator>${esc(AUTHORS[i.author].name[lang])}</dc:creator>`,
      `      <category>${esc(INSIGHT_TOPIC_LABEL[i.topic][lang])}</category>`,
      `      <description>${esc(content.answer)}</description>`,
      '    </item>',
    ].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${esc(`${BRAND[lang]} - ${meta.title}`)}</title>`,
    `    <link>${absoluteUrl(localizePath('/insights', lang))}</link>`,
    `    <description>${esc(meta.description)}</description>`,
    `    <language>${lang === 'en' ? 'en' : 'zh-CN'}</language>`,
    `    <lastBuildDate>${rfc822(latest)}</lastBuildDate>`,
    `    <atom:link href="${self}" rel="self" type="application/rss+xml" />`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

export const feedResponse = (lang: Lang) =>
  new Response(insightsFeed(lang), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
