// 预览部署（*.vercel.app）不进搜索引擎，正式站才允许收录；robots.txt 也按同一变量区分（app/robots.ts）
const isPreview = process.env.VERCEL_ENV === 'preview';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // 仓库用 TypeScript 7（原生编译器，没有 Next 构建期类型检查需要的 JS API）。
  // 类型检查改由 `bun run lint`（tsc --noEmit）负责。
  typescript: { ignoreBuildErrors: true },
  // 每个内容页的 Markdown 版本（src/site/markdown.ts）：/services/geo.md → app/md-pages/zh/services/geo
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
