import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Lang } from '../lib/i18n';
import { BRAND } from '../lib/site';
import { routeMeta } from './meta';
import { allRoutes, hasEnglish, isIndexable, localizePath, resolveRoute, routePath, type Route } from './routes';
import { pageSchema } from './schema';
import { TITLE_LIMIT, fitTitle, titleWidth } from './title';
import { hasMarkdown, markdownPath } from './markdown';
import { feedPath } from './feed';
import { RouteView } from './RouteView';
import { pageData } from './pageData';
import { ogImagePath } from './ogPath';

/**
 * 官网页面的服务端入口：app/(zh)/[[...slug]] 与 app/(en)/en/[[...slug]] 都只是转发到这里。
 * 解析路由 → 输出 metadata 与 JSON-LD → 由 RouteView（客户端组件，服务端预渲染）渲染页面。
 * 文章数据由 pageData 按路由算好、作为 props 传入，客户端组件不直接引入文章数据（见 pageData.ts）。
 */

const resolve = (lang: Lang, slug?: string[]): Route | null => {
  const route = resolveRoute(slug ?? []);
  if (!route || (lang === 'en' && !hasEnglish(route))) return null;
  return route;
};

/** 构建时预渲染的全部页面 */
export const siteStaticParams = (lang: Lang) =>
  allRoutes()
    .filter((route) => lang === 'zh' || hasEnglish(route))
    .map((route) => ({ slug: routePath(route).split('/').filter(Boolean) }));

export function siteMetadata(lang: Lang, slug?: string[]): Metadata {
  const route = resolve(lang, slug);
  if (!route) return {};
  const meta = routeMeta(route, lang);
  const path = routePath(route);
  const canonical = localizePath(path, lang);
  const candidates = [meta.title, ...(meta.shortTitles ?? [])];
  const title = meta.absoluteTitle
    ? { absolute: candidates.find((text) => titleWidth(text, lang) <= TITLE_LIMIT[lang]) ?? candidates[candidates.length - 1] }
    : fitTitle(candidates, lang);
  const ogTitle = meta.absoluteTitle ? meta.title : `${meta.title} - ${lang === 'en' ? BRAND.en : BRAND.zh}`;
  return {
    title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical,
      languages: hasEnglish(route)
        ? { 'zh-CN': localizePath(path, 'zh'), en: localizePath(path, 'en'), 'x-default': localizePath(path, 'zh') }
        : undefined,
      // 机器可读的替代版本：页面的 Markdown 全文与文章 RSS
      types: {
        ...(hasMarkdown(route) ? { 'text/markdown': markdownPath(route, lang) } : {}),
        'application/rss+xml': [{ url: feedPath(lang), title: lang === 'en' ? `${BRAND.en} GEO insights` : `${BRAND.zh} GEO 洞察` }],
      },
    },
    robots: isIndexable(route) ? undefined : { index: false, follow: false },
    openGraph: {
      type: meta.article ? 'article' : 'website',
      url: canonical,
      siteName: lang === 'en' ? BRAND.en : BRAND.zh,
      title: ogTitle,
      description: meta.description,
      locale: lang === 'en' ? 'en_US' : 'zh_CN',
      alternateLocale: hasEnglish(route) ? [lang === 'en' ? 'zh_CN' : 'en_US'] : undefined,
      images: [{ url: ogImagePath(route, lang), width: 1200, height: 630, type: 'image/png', alt: ogTitle }],
      ...(meta.article ? { publishedTime: meta.article.publishedTime, modifiedTime: meta.article.modifiedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description: meta.description, images: [ogImagePath(route, lang)] },
  };
}

/** JSON-LD：转义 <，避免内容里出现 </script> */
const JsonLd = ({ data }: { data: unknown }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
);

export function SitePage({ lang, slug }: { lang: Lang; slug?: string[] }) {
  const route = resolve(lang, slug);
  if (!route) notFound();
  return (
    <>
      {isIndexable(route) && <JsonLd data={pageSchema(route, lang)} />}
      <RouteView route={route} data={pageData(route, lang)} />
    </>
  );
}
