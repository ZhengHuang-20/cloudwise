/**
 * 官网的身份信息：正式域名、中英文品牌名与官方账号。canonical、sitemap、llms.txt、JSON-LD 都从这里取，
 * 前后端都可以 import（不含服务端专用代码）。
 */
import { SHOW_FDE } from './features';

/** 正式域名（不带结尾斜杠）。预览环境也输出正式域名的 canonical，避免预览地址被当成正式站点 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://chingeo.com').replace(/\/+$/, '');

/** IndexNow 密钥：公开的，对应文件 public/<key>.txt（见 scripts/indexnow.ts）。换密钥要同时换文件名与内容 */
export const INDEXNOW_KEY = 'f787532cd2eeb8ca71dccdac74ae3c37';

export const BRAND = {
  zh: '云端智荐',
  en: 'ChinGEO',
} as const;

/**
 * 一句话定位：页面描述、Organization schema、llms.txt 共用。
 * 定位已定为「专注中国 B2B 出海 GEO 的服务商」，未经用户明确要求不要修改措辞，也不要改回“AI 售前支持系统”。
 */
export const TAGLINE = SHOW_FDE
  ? {
      zh: '专注中国 B2B 出海 GEO 的服务商：让 ChatGPT、Perplexity、Gemini 等 AI 推荐你的品牌，并配套独立站、SEO、AI 客服与 FDE 驻场',
      en: 'GEO specialist for Chinese B2B exporters: get your brand recommended by ChatGPT, Perplexity and Gemini, backed by websites, SEO, AI customer service and FDE on-site engineering',
    }
  : {
      zh: '专注中国 B2B 出海 GEO 的服务商：让 ChatGPT、Perplexity、Gemini 等 AI 推荐你的品牌，并配套独立站、SEO 与 AI 客服',
      en: 'GEO specialist for Chinese B2B exporters: get your brand recommended by ChatGPT, Perplexity and Gemini, backed by websites, SEO and AI customer service',
    };

/**
 * 实体消歧：品牌名里的 GEO 容易被理解成地理信息，ChinGEO 也和测绘展会 ChinterGEO、中国地质工程集团等名称相近，
 * 英文名还和北京的云智慧（Cloudwise）相近。Organization.disambiguatingDescription、llms.txt 与关于页共用这段话，
 * 帮助搜索引擎与 AI 把本站识别成一家 GEO 服务商。全网资料的统一写法见 docs/entity-profiles.md。
 */
export const DISAMBIGUATION = {
  zh: '云端智荐（ChinGEO）是位于深圳的中国 B2B 出海 GEO 服务商，这里的 GEO 指生成式引擎优化（Generative Engine Optimization），不是地理信息。云端智荐与测绘地理信息展会 ChinterGEO、中国地质工程集团（China Geo-Engineering）以及北京的 IT 运维公司云智慧（Cloudwise）均无关联。',
  en: 'ChinGEO (云端智荐) is a Shenzhen-based GEO agency for Chinese B2B exporters. GEO here means generative engine optimization, not geography or geospatial data. ChinGEO is not affiliated with the ChinterGEO surveying and mapping exhibition, China Geo-Engineering Corporation, or the Beijing IT operations company Cloudwise (云智慧).',
};

/** 品牌的其他写法（Organization.alternateName）：各平台资料出现的写法都列在这里，帮助 AI 把它们归到同一个实体 */
export const ALTERNATE_NAMES = ['云端智荐', 'ChinGEO', '云端智荐（ChinGEO）', 'ChinGEO 云端智荐', 'chingeo.com'];

/**
 * 公司主体信息，以营业执照为准：Organization schema、页脚、关于页、llms.txt 共用。
 * 英文名与英文地址是译名（执照上只有中文），schema 的 legalName 与 address 一律用中文原文。
 */
export const COMPANY = {
  legalName: { zh: '深圳市云端智荐科技有限公司', en: 'Shenzhen Cloudwise Zhijian Technology Co., Ltd.' },
  /** 统一社会信用代码 */
  creditCode: '91440300MADPJ0KN2H',
  foundingDate: '2024-06-26',
  address: {
    country: 'CN',
    region: '广东省',
    locality: '深圳市',
    street: '罗湖区黄贝街道深南东路1133号长安大厦510',
    full: {
      zh: '中国广东省深圳市罗湖区黄贝街道深南东路1133号长安大厦510',
      en: 'Room 510, Chang’an Building, 1133 Shennan East Road, Huangbei Subdistrict, Luohu District, Shenzhen, Guangdong, China',
    },
  },
  email: 'bluu110@gmail.com',
  /** 身份背书：只写确认过的身份，不扩大成「合作伙伴」「认证」 */
  endorsement: { zh: '腾讯 WorkBuddy 生态共建企业', en: 'Tencent WorkBuddy ecosystem co-builder' },
};

/** 官网自己的访问统计站点标识（公开，写在页面的 cw.js 标签里），对应客户后台「站点与授权」中的官网 */
export const ANALYTICS_SITE_KEY = 'sk_b7b2303ec24b731047210b7e';

/** Microsoft Clarity 的项目 ID（公开，写在页面脚本里），在 Bing Webmaster Tools 里为 chingeo.com 创建，见 src/site/Clarity.tsx */
export const CLARITY_PROJECT_ID = 'zhipeemm3k';

/** 官方账号（Organization.sameAs 与关于页）。新开账号后加到这里；没有主页地址的账号不要加 */
export const OFFICIAL_ACCOUNTS: { url: string; label: { zh: string; en: string } }[] = [
  { url: 'https://space.bilibili.com/375232709', label: { zh: 'B 站 · 云端智荐出海学院', en: 'Bilibili · ChinGEO Export Academy' } },
  { url: 'https://www.zhihu.com/people/dou-dou-15-34-65', label: { zh: '知乎', en: 'Zhihu' } },
];

export const SAME_AS: string[] = OFFICIAL_ACCOUNTS.map((a) => a.url);

/** 小红书账号：暂无可公开的主页地址，只在关于页以文字提及，不进 sameAs */
export const XIAOHONGSHU = { name: 'David爱肥鱼', id: '49237272147' };

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

/**
 * 文章以外各类页面正文最近一次实质更新的日期（YYYY-MM-DD），按页面类别分开记：sitemap 的 lastmod、
 * JSON-LD 的 dateModified、Markdown 版页面共用（src/site/routes.ts 的 routeModified）。文章用自己的 updatedAt，
 * 「GEO 洞察」列表页自动取 insights 与最新文章日期中较晚的一个。
 *
 * 只改实际改动了正文的那一类：Google 与 Bing 只在 lastmod 持续准确时才采信它，一处改动让全站日期一起变，
 * 会让搜索引擎不再信任本站的 lastmod。改样式、页脚、脚本这类非正文改动不要改日期。
 */
export const PAGE_UPDATED = {
  /** 首页 */
  home: '2026-11-23',
  /** 服务列表与服务详情页 */
  services: '2026-11-23',
  /** 案例列表、案例详情与行业方案页 */
  cases: '2026-11-22',
  /** 学院、课程与课时页 */
  academy: '2026-11-22',
  /** 「GEO 洞察」列表页自身的文案（不含文章） */
  insights: '2026-11-20',
  /** 术语列表与术语页 */
  glossary: '2026-11-20',
  /** AI 可见性测评页 */
  audit: '2026-11-20',
  /** 关于页 */
  about: '2026-11-22',
  /** 方案规划页（/configurator）与方案空间 */
  configurator: '2026-11-22',
} as const;

export type PageGroup = keyof typeof PAGE_UPDATED;

export const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;
