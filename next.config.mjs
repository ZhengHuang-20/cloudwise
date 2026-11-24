import { readFileSync } from 'node:fs';

// FDE 展示开关的单一来源是 src/lib/features.ts（next.config 不能引入 TS 模块，这里读取源码里的值）
const SHOW_FDE = /export const SHOW_FDE = true\b/.test(readFileSync(new URL('./src/lib/features.ts', import.meta.url), 'utf8'));

// 关闭 FDE 后，已被收录的 FDE 页面永久跳转到对应的列表页，不留 404；重新打开时这些跳转自动失效
const FDE_REDIRECTS = ['', '/en'].flatMap((prefix) => [
  { source: `${prefix}/services/fde`, destination: `${prefix}/services` },
  { source: `${prefix}/academy/fde`, destination: `${prefix}/academy` },
  { source: `${prefix}/academy/fde/:lesson`, destination: `${prefix}/academy` },
  { source: `${prefix}/glossary/fde`, destination: `${prefix}/glossary` },
]);

// 预览部署（*.vercel.app）不进搜索引擎，正式站才允许收录；robots.txt 也按同一变量区分（app/robots.ts）
const isPreview = process.env.VERCEL_ENV === 'preview';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // 测评报告 PDF（pdfkit）在运行时读取自带的字体数据，不能被打进服务端包里；字体文件要随函数一起部署
  serverExternalPackages: ['pdfkit'],
  outputFileTracingIncludes: { '/api/admin/audits/[id]/download': ['./assets/og/*.ttf'] },
  // 仓库用 TypeScript 7（原生编译器，没有 Next 构建期类型检查需要的 JS API）。
  // 类型检查改由 `bun run lint`（tsc --noEmit）负责。
  typescript: { ignoreBuildErrors: true },
  // 每个内容页的 Markdown 版本（src/site/markdown.ts）：/services/geo.md → app/md-pages/zh/services/geo
  async redirects() {
    // SEO 与建站合并为一项服务：旧的两个服务页地址永久跳转到合并后的页面
    const seoWebsite = ['/services/website', '/services/seo', '/en/services/website', '/en/services/seo'].map((source) => ({
      source,
      destination: source.startsWith('/en') ? '/en/services/seo-website' : '/services/seo-website',
      permanent: true,
    }));
    return [...seoWebsite, ...(SHOW_FDE ? [] : FDE_REDIRECTS.map((r) => ({ ...r, permanent: true })))];
  },
  async rewrites() {
    return [
      { source: '/index.md', destination: '/md-pages/zh' },
      { source: '/en/index.md', destination: '/md-pages/en' },
      { source: '/en/:path*.md', destination: '/md-pages/en/:path*' },
      { source: '/:path*.md', destination: '/md-pages/zh/:path*' },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      ...(isPreview ? [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }] : []),
      // Markdown 版本的内部地址不直接对外，也不进索引
      { source: '/md-pages/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }] },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
      // 课程视频与封面图：文件名不变时内容不变，允许 CDN 长缓存
      { source: '/videos/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=2592000' }] },
      // 嵌入其他网站的采集脚本（public/cw.js）
      {
        source: '/cw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

export default nextConfig;
