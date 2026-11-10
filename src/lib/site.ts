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

/** 一句话定位：页面描述、Organization schema、llms.txt 共用 */
export const TAGLINE = SHOW_FDE
  ? {
      zh: '面向中国出海企业的 AI 售前支持系统：GEO、FDE 驻场、独立站、SEO 与 AI 客服',
      en: 'AI pre-sales support for Chinese companies going global: GEO, FDE on-site engineering, websites, SEO and AI customer service',
    }
  : {
      zh: '面向中国出海企业的 AI 售前支持系统：GEO、独立站、SEO 与 AI 客服',
      en: 'AI pre-sales support for Chinese companies going global: GEO, websites, SEO and AI customer service',
    };

export const ICP_RECORD = '苏ICP备20260928号-1';

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

export const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;
