import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SERVICE_COUNT_CN, SHOW_FDE } from '../src/lib/features';
import '../src/index.css';

const title = '云端智荐 - AI出海售前支持系统与能力样板间';
const services = SHOW_FDE ? '独立站、SEO、GEO、AI智能客服与FDE驻场' : '独立站、SEO、GEO与AI智能客服';
const description = `专为出海企业打造的AI售前支持系统与能力样板间，涵盖${services}${SERVICE_COUNT_CN}项服务，并提供出海学院、AI可见性测评、方案规划与专属方案空间。`;

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' },
  openGraph: { title, description, type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        {/* Vercel Web Analytics：项目在 Vercel 开启 Web Analytics 后才会上报 */}
        <Analytics />
      </body>
    </html>
  );
}
