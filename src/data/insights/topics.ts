import type { InsightTopic } from './types';

/** 文章主题的显示名。单独成文件，客户端组件引入它不会带上文章正文 */
export const INSIGHT_TOPIC_LABEL: Record<InsightTopic, { zh: string; en: string }> = {
  geo: { zh: 'GEO', en: 'GEO' },
  seo: { zh: 'SEO', en: 'SEO' },
  website: { zh: '独立站', en: 'Websites' },
  'ai-customer-service': { zh: 'AI 客服', en: 'AI customer service' },
  fde: { zh: 'FDE 驻场', en: 'FDE on-site' },
  audit: { zh: 'AI 可见性测评', en: 'AI visibility audit' },
};
