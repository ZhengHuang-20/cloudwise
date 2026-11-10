import { SHOW_FDE } from '../../lib/features';
import type { Insight } from './types';
import { aiSupplierSearchProductPageChecklist } from './ai-supplier-search-product-page-checklist';
import { aiSearchSelfTestDecision } from './ai-search-self-test-decision';
import { aiVisibilityAuditMethodology } from './ai-visibility-audit-methodology';
import { geoAgencySelection } from './geo-agency-selection';
import { geoVsSeo } from './geo-vs-seo';
import { llmsTxtGuide } from './llms-txt-guide';

export type { Insight, InsightContent, InsightTopic } from './types';

/**
 * 全部「GEO 洞察」文章。新增文章：在本目录新建 <slug>.ts，在这里 import 并加入下面的数组。
 * 列表按发布日期倒序；FDE 关闭时不展示 FDE 主题的文章。
 */
const ALL_INSIGHTS: Insight[] = [aiSearchSelfTestDecision, aiSupplierSearchProductPageChecklist, aiVisibilityAuditMethodology, geoAgencySelection, geoVsSeo, llmsTxtGuide];

export const INSIGHTS: Insight[] = ALL_INSIGHTS.filter((item) => SHOW_FDE || item.topic !== 'fde').sort(
  (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug)
);

/**
 * 文章页底部的「更多文章」：前一篇与后一篇（按发布日期，首尾相连），再补主题最接近的一篇。
 * 这样每篇文章至少有两篇文章链向它，旧文章不会因为不在最新三篇里而失去入口。
 */
export function moreInsights(slug: string, count = 3): Insight[] {
  const index = INSIGHTS.findIndex((item) => item.slug === slug);
  if (index < 0) return INSIGHTS.slice(0, count);
  const n = INSIGHTS.length;
  const picked: Insight[] = [];
  const add = (item?: Insight) => {
    if (item && item.slug !== slug && !picked.includes(item) && picked.length < count) picked.push(item);
  };
  add(INSIGHTS[(index - 1 + n) % n]);
  add(INSIGHTS[(index + 1) % n]);
  const self = INSIGHTS[index];
  const overlap = (item: Insight) =>
    (item.topic === self.topic ? 2 : 0) +
    item.relatedTerms.filter((id) => self.relatedTerms.includes(id)).length +
    item.relatedServices.filter((id) => self.relatedServices.includes(id)).length;
  INSIGHTS.filter((item) => item.slug !== slug)
    .sort((a, b) => overlap(b) - overlap(a))
    .forEach(add);
  return picked;
}

export const INSIGHT_TOPIC_LABEL: Record<Insight['topic'], { zh: string; en: string }> = {
  geo: { zh: 'GEO', en: 'GEO' },
  seo: { zh: 'SEO', en: 'SEO' },
  website: { zh: '独立站', en: 'Websites' },
  'ai-customer-service': { zh: 'AI 客服', en: 'AI customer service' },
  fde: { zh: 'FDE 驻场', en: 'FDE on-site' },
  audit: { zh: 'AI 可见性测评', en: 'AI visibility audit' },
};
