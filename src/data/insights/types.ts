/**
 * 「GEO 洞察」文章：每篇一个文件（src/data/insights/<slug>.ts），在 index.ts 里登记。
 * 页面 /insights/<slug>、/en/insights/<slug>，同时进入 sitemap、llms.txt 与 Article / FAQPage 结构化数据。
 * 写作规则见 docs/geo-content-guide.md：先给答案、写清出处、中英文同时写、不写任何价格。
 */

export interface InsightContent {
  /** 标题（H1 与 <title>）：用读者会搜、会问 AI 的说法，最好是问句 */
  title: string;
  /** 页面描述（meta description）：中文 60～90 字，英文 120～160 字符 */
  description: string;
  /** 开头的直接回答：中文 50～120 字，英文 40～80 词，能单独被 AI 引用 */
  answer: string;
  /** 正文，Markdown 子集（见 src/lib/markdown.ts）；不要再写 H1，从 ## 开始 */
  body: string;
  /** 常见问题 3～5 条，输出为 FAQPage */
  faqs: { q: string; a: string }[];
}

export type InsightTopic = 'geo' | 'seo' | 'website' | 'ai-customer-service' | 'fde' | 'audit';

export interface Insight {
  /** URL slug：小写英文与连字符，例如 what-is-geo */
  slug: string;
  topic: InsightTopic;
  /** YYYY-MM-DD */
  publishedAt: string;
  /** YYYY-MM-DD，内容有实质更新时修改 */
  updatedAt: string;
  /** 文章瞄准的搜索词 / AI 提问（不显示在页面上，用于 keywords 与内部规划） */
  keywords: { zh: string[]; en: string[] };
  /** 相关服务 slug（src/data/servicesData.ts） */
  relatedServices: string[];
  /** 相关术语 id（src/data/glossaryData.ts，例如 term-geo） */
  relatedTerms: string[];
  /** 相关课时 id（src/data/coursesData.ts，例如 lesson-c-1-1） */
  relatedLessons: string[];
  zh: InsightContent;
  en: InsightContent;
}
