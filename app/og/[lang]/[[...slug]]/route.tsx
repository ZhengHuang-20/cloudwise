import type { Lang } from '../../../../src/lib/i18n';
import { ogImage, ogStaticParams } from '../../../../src/site/og';
import { hasEnglish, isIndexable, resolveRoute } from '../../../../src/site/routes';

/**
 * 每个页面的分享图，构建时生成：/og/zh（首页）、/og/zh/services/geo、/og/en/insights/<slug> ……
 * 页面的 og:image 与 twitter:image 指向这里（src/site/page.tsx）。
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export const generateStaticParams = () => ogStaticParams();

export async function GET(_: Request, { params }: { params: Promise<{ lang: string; slug?: string[] }> }) {
  const { lang, slug } = await params;
  const route = lang === 'zh' || lang === 'en' ? resolveRoute(slug ?? []) : null;
  if (!route || !isIndexable(route) || (lang === 'en' && !hasEnglish(route))) return new Response('Not found\n', { status: 404 });
  return ogImage(route, lang as Lang);
}
