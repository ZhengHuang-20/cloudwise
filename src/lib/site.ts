/**
 * 官网的身份信息：正式域名、中英文品牌名与官方账号。canonical、sitemap、llms.txt、JSON-LD 都从这里取，
 * 前后端都可以 import（不含服务端专用代码）。
 */
import { SHOW_FDE } from './features';

/** 正式域名（不带结尾斜杠）。预览环境也输出正式域名的 canonical，避免预览地址被当成正式站点 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://chingeo.com').replace(/\/+$/, '');

export const BRAND = {
  zh: '云端智荐',
  en: 'ChinGEO',
} as const;

/** 一句话定位：页面描述、Organization schema、llms.txt 共用 */
export const TAGLINE = SHOW_FDE
  ? {
      zh: '面向中国出海企业的 AI 售前支持系统：独立站、SEO、GEO、AI 客服与 FDE 驻场',
      en: 'AI pre-sales support for Chinese companies going global: websites, SEO, GEO, AI customer service and FDE on-site engineering',
    }
  : {
      zh: '面向中国出海企业的 AI 售前支持系统：独立站、SEO、GEO 与 AI 客服',
      en: 'AI pre-sales support for Chinese companies going global: websites, SEO, GEO and AI customer service',
    };

export const ICP_RECORD = '苏ICP备20260928号-1';

/** 官方账号（Organization.sameAs）。新开账号后加到这里 */
export const SAME_AS: string[] = ['https://space.bilibili.com/375232709'];

/** 课程视频在 B 站的对应稿件（课时 id → BV 号），清单见 docs/course-videos.md */
export const BILIBILI_VIDEOS: Record<string, string> = {
  'lesson-a-1-1': 'BV1y4aW69EHP',
  'lesson-a-1-2': 'BV12JaW6bEtm',
  'lesson-a-1-4': 'BV14JaW68EvW',
  'lesson-a-7-4': 'BV1mJaW6bERi',
  'lesson-b-1-3': 'BV1mJaW6bER8',
  'lesson-b-3-5': 'BV1mJaW6bE2h',
  'lesson-c-1-1': 'BV12JaW6bEbp',
  'lesson-c-1-2': 'BV12JaW6bEk6',
  'lesson-c-10-2': 'BV12JaW6bEBA',
  'lesson-c-3-1': 'BV14JaW68E4M',
  'lesson-d-1-2': 'BV12naW6ZE5N',
  'lesson-d-9-2': 'BV1qBaW6jE17',
  'lesson-e-1-1': 'BV1qBaW6jEvs',
  'lesson-e-1-2': 'BV1BBaW6jEJL',
  'lesson-e-8-1': 'BV1BiaW6mEsv',
};

export const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;
