import { SHOW_FDE } from '../../lib/features';
import type { Insight } from './types';
import { aiSupplierSearchProductPageChecklist } from './ai-supplier-search-product-page-checklist';
import { aiSearchSelfTestDecision } from './ai-search-self-test-decision';
import { aiVisibilityAuditMethodology } from './ai-visibility-audit-methodology';
import { chingeoAssetOwnership } from './chingeo-asset-ownership';
import { b2bWebsitePlatformChoice } from './b2b-website-platform-choice';
import { geo90DayPilot } from './geo-90-day-pilot';
import { geoAutoParts } from './geo-auto-parts';
import { geoElectronicsPcb } from './geo-electronics-pcb';
import { geoEnergyStorageBatteries } from './geo-energy-storage-batteries';
import { geoIndustrialMachinery } from './geo-industrial-machinery';
import { geoSolarPv } from './geo-solar-pv';
import { geoAgencyBlindTest } from './geo-agency-blind-test';
import { geoAgencySelection } from './geo-agency-selection';
import { geoUsCanadaBuyers } from './geo-us-canada-buyers';
import { geoVsSeo } from './geo-vs-seo';
import { googleAiOverviewsB2b } from './google-ai-overviews-b2b';
import { howAiPicksSuppliers } from './how-ai-picks-suppliers';
import { howToMeasureGeoResults } from './how-to-measure-geo-results';
import { inquiryAiAutoReply } from './inquiry-ai-auto-reply';
import { llmsTxtGuide } from './llms-txt-guide';

export type { Insight, InsightContent, InsightTopic } from './types';

/**
 * 全部「GEO 洞察」文章。新增文章：在本目录新建 <slug>.ts，在这里 import 并加入下面的数组。
 * 列表按发布日期倒序；FDE 关闭时不展示 FDE 主题的文章。
 */
const ALL_INSIGHTS: Insight[] = [
  aiSearchSelfTestDecision,
  aiSupplierSearchProductPageChecklist,
  aiVisibilityAuditMethodology,
  b2bWebsitePlatformChoice,
  chingeoAssetOwnership,
  geo90DayPilot,
  geoAutoParts,
  geoElectronicsPcb,
  geoEnergyStorageBatteries,
  geoIndustrialMachinery,
  geoSolarPv,
  geoAgencyBlindTest,
  geoAgencySelection,
  geoUsCanadaBuyers,
  geoVsSeo,
  googleAiOverviewsB2b,
  howAiPicksSuppliers,
  howToMeasureGeoResults,
  inquiryAiAutoReply,
  llmsTxtGuide,
];

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

export { INSIGHT_TOPIC_LABEL } from './topics';
