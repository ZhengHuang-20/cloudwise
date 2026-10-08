/**
 * 中英文的基础类型与取值函数。不依赖 React，服务端（metadata、JSON-LD、llms.txt）与前端都可以 import；
 * 组件里用 useLang()（src/context/LanguageContext.tsx）。
 */
export type Lang = 'zh' | 'en';

/** 双语文本：数据文件里的标题、描述等用它，避免为每个字段另起一套英文字段 */
export interface Bi {
  zh: string;
  en: string;
}

/** 在非组件代码（数据文件、工具函数）里按语言取文本 */
export const pick = (text: Bi, lang: Lang) => (lang === 'en' ? text.en : text.zh);
