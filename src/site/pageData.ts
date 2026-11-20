/**
 * 页面需要的「GEO 洞察」文章数据，由服务端按路由算好、作为 props 传给 RouteView。
 * 客户端组件不直接 import src/data/insights：文章正文只随当前页面下发，不进全站共用的脚本包，
 * 新增文章也不会让其他页面的脚本变大。只在服务端使用（src/site/page.tsx）。
 */
import { INSIGHTS, moreInsights, type Insight, type InsightContent, type InsightTopic } from '../data/insights';
import type { AuthorId } from '../data/authors';
import type { Lang } from '../lib/i18n';
import { findInsight, findTerm, type Route } from './routes';

/** 文章卡片用的摘要（当前语言） */
export interface InsightSummary {
  slug: string;
  topic: InsightTopic;
  publishedAt: string;
  title: string;
  description: string;
}

/** 文章页的完整数据（当前语言） */
export interface InsightPage {
  slug: string;
  topic: InsightTopic;
  author: AuthorId;
  publishedAt: string;
  updatedAt: string;
  relatedServices: string[];
  relatedTerms: string[];
  relatedLessons: string[];
  content: InsightContent;
  more: InsightSummary[];
}

export interface PageData {
  /** 文章列表（/insights 为全部；服务页、术语页为相关的最多 3 篇） */
  insights?: InsightSummary[];
  /** 文章页 */
  insight?: InsightPage;
  /** /audit 页底部引用的测评方法文章的常见问题；文章不存在时为空 */
  auditMethod?: { slug: string; faqs: InsightContent['faqs'] };
}

/** /audit 页引用的测评方法文章 */
export const AUDIT_METHOD_SLUG = 'ai-visibility-audit-methodology';

const summary = (item: Insight, lang: Lang): InsightSummary => ({
  slug: item.slug,
  topic: item.topic,
  publishedAt: item.publishedAt,
  title: item[lang].title,
  description: item[lang].description,
});

export function pageData(route: Route, lang: Lang): PageData {
  switch (route.kind) {
    case 'insights':
      return { insights: INSIGHTS.map((item) => summary(item, lang)) };
    case 'insight': {
      const item = findInsight(route.slug);
      if (!item) return {};
      return {
        insight: {
          slug: item.slug,
          topic: item.topic,
          author: item.author,
          publishedAt: item.publishedAt,
          updatedAt: item.updatedAt,
          relatedServices: item.relatedServices,
          relatedTerms: item.relatedTerms,
          relatedLessons: item.relatedLessons,
          content: item[lang],
          more: moreInsights(item.slug).map((other) => summary(other, lang)),
        },
      };
    }
    case 'service':
      return {
        insights: INSIGHTS.filter((item) => item.relatedServices.includes(route.slug))
          .slice(0, 3)
          .map((item) => summary(item, lang)),
      };
    case 'term': {
      const id = findTerm(route.slug)?.id;
      return {
        insights: INSIGHTS.filter((item) => !!id && item.relatedTerms.includes(id))
          .slice(0, 3)
          .map((item) => summary(item, lang)),
      };
    }
    case 'audit': {
      const method = findInsight(AUDIT_METHOD_SLUG);
      return method ? { auditMethod: { slug: method.slug, faqs: method[lang].faqs } } : {};
    }
    default:
      return {};
  }
}
