import type { Lang } from '../../../../src/lib/i18n';
import { absoluteUrl } from '../../../../src/lib/site';
import { markdownResponse, markdownStaticParams, pageMarkdown } from '../../../../src/site/markdown';
import { localizePath, resolveRoute, routePath } from '../../../../src/site/routes';

/**
 * 每个内容页的 Markdown 版本，构建时生成。对外地址是 /<路径>.md（next.config.mjs 的 rewrites 改写到这里），
 * 例如 /services/geo.md → /md-pages/zh/services/geo。
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export const generateStaticParams = () => markdownStaticParams();

export async function GET(_: Request, { params }: { params: Promise<{ lang: string; slug?: string[] }> }) {
  const { lang, slug } = await params;
  const route = lang === 'zh' || lang === 'en' ? resolveRoute(slug ?? []) : null;
  const text = route && pageMarkdown(route, lang as Lang);
  if (!route || !text) return new Response('Not found\n', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  return markdownResponse(text, absoluteUrl(localizePath(routePath(route), lang as Lang)));
}
