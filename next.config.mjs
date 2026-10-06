/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // 仓库用 TypeScript 7（原生编译器，没有 Next 构建期类型检查需要的 JS API）。
  // 类型检查改由 `bun run lint`（tsc --noEmit）负责。
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
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
