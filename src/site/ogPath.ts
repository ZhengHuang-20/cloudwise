import type { Lang } from '../lib/i18n';
import { isIndexable, routePath, type Route } from './links';

/**
 * 页面分享图的地址（图由 src/site/og.tsx 在构建时生成）。不收录的页面（登录、后台、方案空间）沿用通用的 /og.png。
 * 单独放一个文件，元数据与 JSON-LD 引用它时不会把图片渲染代码打进页面。
 */
export const ogImagePath = (route: Route, lang: Lang) =>
  isIndexable(route) ? `/og/${lang}${routePath(route) === '/' ? '' : routePath(route)}` : '/og.png';
