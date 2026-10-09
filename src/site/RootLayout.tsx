import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import type { Lang } from '../lib/i18n';
import { ANALYTICS_SITE_KEY, BRAND, SITE_URL } from '../lib/site';
import { SiteShell } from './SiteShell';
import '../index.css';

/**
 * 中英文两个根布局（app/(zh)/layout.tsx、app/(en)/layout.tsx）共用的外壳。
 * 两种语言各有自己的 <html lang>，切换语言是整页跳转。
 */

// 站长平台的验证码：在 Vercel 环境变量里配置，改了要重新部署
const env = (name: string) => process.env[name] || undefined;
const verificationOther = Object.fromEntries(
  [
    ['msvalidate.01', env('BING_SITE_VERIFICATION')],
    ['baidu-site-verification', env('BAIDU_SITE_VERIFICATION')],
    ['bytedance-verification-code', env('TOUTIAO_SITE_VERIFICATION')],
    ['360-site-verification', env('SO360_SITE_VERIFICATION')],
    ['sogou_site_verification', env('SOGOU_SITE_VERIFICATION')],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))
);

export const rootMetadata = (lang: Lang): Metadata => ({
  metadataBase: new URL(SITE_URL),
  title: { default: lang === 'en' ? BRAND.en : BRAND.zh, template: `%s - ${lang === 'en' ? BRAND.en : BRAND.zh}` },
  applicationName: lang === 'en' ? BRAND.en : BRAND.zh,
  icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' },
  formatDetection: { telephone: false },
  verification: {
    google: env('GOOGLE_SITE_VERIFICATION'),
    other: Object.keys(verificationOther).length ? verificationOther : undefined,
  },
});

export const rootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
  colorScheme: 'dark',
};

// 脚本可用时给 <html> 加 js 类：.reveal 动画只在有脚本时先隐藏（src/index.css）
const JS_FLAG = "document.documentElement.classList.add('js')";

// 访问统计（public/cw.js）只在正式部署上报：本地开发与预览部署的域名不在站点登记里，上报会被拒绝
const ANALYTICS_ON = process.env.VERCEL_ENV === 'production';

export function RootLayout({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang === 'en' ? 'en' : 'zh-CN'} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
        {ANALYTICS_ON && <script async src="/cw.js" data-site={ANALYTICS_SITE_KEY} />}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
      </head>
      <body>
        <SiteShell lang={lang}>{children}</SiteShell>
        {/* Vercel Web Analytics：项目在 Vercel 开启 Web Analytics 后才会上报 */}
        <Analytics />
      </body>
    </html>
  );
}
