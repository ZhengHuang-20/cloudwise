import type { MetadataRoute } from 'next';
import { SITE_URL } from '../src/lib/site';

/**
 * robots.txt：明确放行搜索引擎与 AI 爬虫（含训练用爬虫，进入模型的长期知识对 GEO 有利），只挡接口。
 * 预览部署（VERCEL_ENV=preview）整站禁止抓取，避免 *.vercel.app 被当成重复站点收录。
 */
const CRAWLERS = [
  // 搜索引擎
  'Googlebot',
  'Bingbot',
  'Baiduspider',
  'Sogou web spider',
  '360Spider',
  'YisouSpider',
  'Bytespider',
  'Applebot',
  'DuckDuckBot',
  'YandexBot',
  // AI 搜索与问答
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
  'Applebot-Extended',
  'Doubaobot',
  'meta-externalagent',
  'MistralAI-User',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === 'preview') {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  const disallow = ['/api/'];
  return {
    rules: [
      { userAgent: CRAWLERS, allow: '/', disallow },
      { userAgent: '*', allow: '/', disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
