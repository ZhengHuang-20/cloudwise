import type { Lang } from '../lib/i18n';

/** 给路径加语言前缀：中文原样，英文加 /en */
export const localizePath = (path: string, lang: Lang) => {
  if (lang === 'zh') return path;
  return path === '/' ? '/en' : `/en${path}`;
};

/** 从地址栏路径解析出语言与不带前缀的路径 */
export const splitLocale = (pathname: string): { lang: Lang; path: string } => {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return { lang: 'en', path: pathname.slice(3) || '/' };
  }
  return { lang: 'zh', path: pathname || '/' };
};
