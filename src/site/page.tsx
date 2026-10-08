import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Lang } from '../lib/i18n';
import { BRAND } from '../lib/site';
import { routeMeta } from './meta';
import { allRoutes, hasEnglish, isIndexable, localizePath, resolveRoute, routePath, type Route } from './routes';
import { pageSchema } from './schema';
import { RouteView } from './RouteView';

/**
 * 官网页面的服务端入口：app/(zh)/[[...slug]] 与 app/(en)/en/[[...slug]] 都只是转发到这里。
 * 解析路由 → 输出 metadata 与 JSON-LD → 由 RouteView（客户端组件，服务端预渲染）渲染页面。
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
  const title = meta.absoluteTitle ? { absolute: meta.title } : meta.title;
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
      images: [{ url: '/og.png', width: 1200, height: 630, alt: lang === 'en' ? BRAND.en : BRAND.zh }],
      ...(meta.article ? { publishedTime: meta.article.publishedTime, modifiedTime: meta.article.modifiedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description: meta.description, images: ['/og.png'] },
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
      <RouteView route={route} />
    </>
  );
}
