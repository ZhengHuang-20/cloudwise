import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { localizePath, splitLocale } from '../site/locale';
import { pick, type Bi, type Lang } from '../lib/i18n';

/**
 * 官网的界面语言（中文 / English）。语言由 URL 决定：中文无前缀，英文在 /en 下，
 * 由 app/(zh) 与 app/(en) 两个根布局分别传入。文案用 t(zh, en) 取值，结构化数据用 { zh, en } 对象配合 tb() 取值，
 * 站内链接用 path('/services') 自动加上当前语言的前缀。后台（登录与客户后台）只有中文。
 */
export type { Lang, Bi } from '../lib/i18n';
export { pick } from '../lib/i18n';

/** 记住访客最近选择的语言（只用于偏好，不做自动跳转，避免爬虫被重定向） */
const STORAGE_KEY = 'cw_lang';

interface LanguageValue {
  lang: Lang;
  /** 切换语言：跳到另一种语言的同一页面 */
  setLang: (lang: Lang) => void;
  t: (zh: string, en: string) => string;
  tb: (text: Bi) => string;
  /** 站内路径加语言前缀：path('/services') → 英文下为 /en/services */
  path: (p: string) => string;
}

const LanguageContext = createContext<LanguageValue | null>(null);

/** 另一种语言下的当前页面地址（保留查询参数与锚点） */
export const switchLanguageHref = (next: Lang) => {
  const { path } = splitLocale(window.location.pathname);
  return localizePath(path, next) + window.location.search + window.location.hash;
};

export const LanguageProvider: React.FC<{ lang: Lang; children: React.ReactNode }> = ({ lang, children }) => {
  const setLang = useCallback(
    (next: Lang) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // 隐私模式或禁用存储时只影响记住偏好，本次切换照常生效
      }
      if (next !== lang) window.location.assign(switchLanguageHref(next));
    },
    [lang]
  );

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      setLang,
      t: (zh, en) => (lang === 'en' ? en : zh),
      tb: (text) => pick(text, lang),
      path: (p) => localizePath(p, lang),
    }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang 必须在 LanguageProvider 内使用');
  return ctx;
};
