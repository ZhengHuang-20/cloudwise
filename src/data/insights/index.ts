import { SHOW_FDE } from '../../lib/features';
import type { Insight } from './types';
import { aiVisibilityAuditMethodology } from './ai-visibility-audit-methodology';
import { geoVsSeo } from './geo-vs-seo';
import { llmsTxtGuide } from './llms-txt-guide';

export type { Insight, InsightContent, InsightTopic } from './types';

/**
 * 全部「GEO 洞察」文章。新增文章：在本目录新建 <slug>.ts，在这里 import 并加入下面的数组。
 * 列表按发布日期倒序；FDE 关闭时不展示 FDE 主题的文章。
 */
const ALL_INSIGHTS: Insight[] = [aiVisibilityAuditMethodology, geoVsSeo, llmsTxtGuide];

export const INSIGHTS: Insight[] = ALL_INSIGHTS.filter((item) => SHOW_FDE || item.topic !== 'fde').sort(
  (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug)
);

export const INSIGHT_TOPIC_LABEL: Record<Insight['topic'], { zh: string; en: string }> = {
  geo: { zh: 'GEO', en: 'GEO' },
  seo: { zh: 'SEO', en: 'SEO' },
  website: { zh: '独立站', en: 'Websites' },
  'ai-customer-service': { zh: 'AI 客服', en: 'AI customer service' },
  fde: { zh: 'FDE 驻场', en: 'FDE on-site' },
  audit: { zh: 'AI 可见性测评', en: 'AI visibility audit' },
};
