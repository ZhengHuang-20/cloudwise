/**
 * 每个页面的分享图（Open Graph / Twitter 卡片，1200×630）：按页面标题生成，构建时静态输出到 /og/<lang>/<路径>
 * （app/og/[lang]/[[...slug]]/route.tsx）。只在服务端使用。
 *
 * 字体：assets/og/ 里的 Noto Sans SC（SIL OFL 1.1），按 GB2312 全部汉字 + ASCII + 常用标点裁剪，覆盖页面标题用字。
 * 标题里出现裁剪范围外的生僻字时会显示为空白，按 assets/og/README.md 重新裁剪。
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { pick, type Lang } from '../lib/i18n';
import { SHOW_FDE } from '../lib/features';
import { BRAND, SITE_URL } from '../lib/site';
import { routeMeta } from './meta';
import { allRoutes, hasEnglish, isIndexable, localizePath, routePath, type Route } from './routes';

export const OG_SIZE = { width: 1200, height: 630 };

/** 构建时生成的全部分享图 */
export const ogStaticParams = () =>
  allRoutes()
    .filter(isIndexable)
    .flatMap((route) =>
      (hasEnglish(route) ? (['zh', 'en'] as const) : (['zh'] as const)).map((lang) => ({
        lang,
        slug: routePath(route).split('/').filter(Boolean),
      }))
    );

// 与 src/index.css 的 @theme 对应
const COLOR = {
  canvas: '#f5f7f6',
  label: '#15201b',
  secondary: '#55615c',
  link: '#00774f',
  brand: '#01c886',
  separator: '#e4e9e7',
};

/** 标题上方的栏目名 */
const SECTION: Partial<Record<Route['kind'], { zh: string; en: string }>> = {
  services: { zh: '服务', en: 'Services' },
  service: { zh: '服务', en: 'Services' },
  cases: { zh: '案例', en: 'Case studies' },
  case: { zh: '案例', en: 'Case study' },
  solution: { zh: '行业方案', en: 'Industry plan' },
  academy: { zh: '出海学院', en: 'Academy' },
  course: { zh: '出海学院 · 课程', en: 'Academy · Course' },
  lesson: { zh: '出海学院 · 课时', en: 'Academy · Lesson' },
  insights: { zh: 'GEO 洞察', en: 'GEO insights' },
  insight: { zh: 'GEO 洞察', en: 'GEO insights' },
  glossary: { zh: '术语百科', en: 'Glossary' },
  term: { zh: '术语百科', en: 'Glossary' },
  audit: { zh: '免费工具', en: 'Free tool' },
  about: { zh: '关于我们', en: 'About us' },
  configurator: { zh: '方案规划', en: 'Plan builder' },
};

/** 首页 H1（src/views/HomeView.tsx），改首页标题时同步 */
const HOME_HEADLINE = [
  { zh: '让海外买家找到你', en: 'Help overseas buyers find you' },
  { zh: '让 AI 推荐你的品牌', en: 'Get recommended by AI' },
];

const SERVICE_LINE = {
  zh: ['出海 GEO', '海外独立站', '外贸 SEO', 'AI 客服', ...(SHOW_FDE ? ['FDE 驻场'] : [])].join(' · '),
  en: ['GEO', 'B2B websites', 'SEO', 'AI customer service', ...(SHOW_FDE ? ['FDE'] : [])].join(' · '),
};

// 路径写成字面量：构建工具按它追踪要带上的文件，变量拼接的路径会让它追踪整个项目
let fonts: { name: string; data: Buffer; weight: 400 | 600; style: 'normal' }[] | null = null;
const loadFonts = () =>
  (fonts ??= [
    { name: 'Noto Sans SC', data: readFileSync(join(process.cwd(), 'assets', 'og', 'NotoSansSC-Regular-subset.ttf')), weight: 400, style: 'normal' },
    { name: 'Noto Sans SC', data: readFileSync(join(process.cwd(), 'assets', 'og', 'NotoSansSC-SemiBold-subset.ttf')), weight: 600, style: 'normal' },
  ]);

let logo: string | null = null;
const loadLogo = () => (logo ??= `data:image/png;base64,${readFileSync(join(process.cwd(), 'public', 'brand', 'logo-mark.png')).toString('base64')}`);

/** 标题去掉开头的品牌名（首页标题形如「云端智荐 - …」），品牌已经在图的左上角 */
const stripBrand = (title: string) => title.replace(new RegExp(`^(${BRAND.zh}|${BRAND.en})\\s*[-:：|]\\s*`), '');

/** 按标题长度选字号：中文按字数、英文按字符数，最多约三行 */
function titleSize(title: string, lang: Lang): number {
  const len = lang === 'en' ? title.length : [...title].reduce((n, ch) => n + (/[\u0000-ÿ]/.test(ch) ? 0.55 : 1), 0);
  if (lang === 'en') return len <= 36 ? 72 : len <= 64 ? 60 : len <= 96 ? 50 : 44;
  return len <= 12 ? 76 : len <= 20 ? 64 : len <= 30 ? 54 : 46;
}

export function ogImage(route: Route, lang: Lang): ImageResponse {
  const title = stripBrand(routeMeta(route, lang).title);
  const section = SECTION[route.kind];
  const host = SITE_URL.replace(/^https?:\/\//, '');
  const size = titleSize(title, lang);
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 88px',
          backgroundColor: COLOR.canvas,
          fontFamily: 'Noto Sans SC',
          color: COLOR.label,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <img src={loadLogo()} width={58} height={50} alt="" />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{ fontSize: 36, fontWeight: 600 }}>{BRAND.zh}</span>
            <span style={{ fontSize: 34, fontWeight: 400, color: COLOR.secondary }}>{BRAND.en}</span>
          </div>
        </div>

        {route.kind === 'home' ? (
          // 首页与页面上的 H1 一致：两行，第二行用强调色
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: lang === 'en' ? 64 : 76, fontWeight: 600, lineHeight: 1.2 }}>
            <span>{pick(HOME_HEADLINE[0], lang)}</span>
            <span style={{ color: COLOR.link }}>{pick(HOME_HEADLINE[1], lang)}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {section && <div style={{ display: 'flex', fontSize: 30, fontWeight: 600, color: COLOR.link }}>{pick(section, lang)}</div>}
            <div style={{ display: 'flex', fontSize: size, fontWeight: 600, lineHeight: 1.22, letterSpacing: lang === 'en' ? -0.5 : 0 }}>{title}</div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `2px solid ${COLOR.separator}`,
            paddingTop: 28,
            fontSize: 26,
            color: COLOR.secondary,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: COLOR.brand }} />
            <span>{pick(SERVICE_LINE, lang)}</span>
          </div>
          <span>{lang === 'en' ? `${host}${localizePath('/', 'en')}` : host}</span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: loadFonts() }
  );
}
