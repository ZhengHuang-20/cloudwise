import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * 官网的界面语言（中文 / English）。文案用 t(zh, en) 取值，结构化数据用 { zh, en } 对象配合 tb() 取值。
 * 语言偏好保存在 localStorage，切换后同步 <html lang> 与页面标题。后台（登录与客户后台）只有中文。
 */
export type Lang = 'zh' | 'en';

/** 双语文本：数据文件里的标题、描述等用它，避免为每个字段另起一套英文字段 */
export interface Bi {
  zh: string;
  en: string;
}

const STORAGE_KEY = 'cw_lang';

/** 在非组件代码（数据文件、工具函数）里按语言取文本 */
export const pick = (text: Bi, lang: Lang) => (lang === 'en' ? text.en : text.zh);

const readStoredLang = (): Lang => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
};

interface LanguageValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (zh: string, en: string) => string;
  tb: (text: Bi) => string;
}

const LanguageContext = createContext<LanguageValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => (typeof window === 'undefined' ? 'zh' : readStoredLang()));

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 隐私模式或禁用存储时只影响记住偏好，本次切换照常生效
    }
  }, []);

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      setLang,
      t: (zh, en) => (lang === 'en' ? en : zh),
      tb: (text) => pick(text, lang),
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
