import { RootLayout, rootMetadata, rootViewport } from '../../src/site/RootLayout';

// 中文站（默认，无路径前缀）的根布局
export const metadata = rootMetadata('zh');
export const viewport = rootViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout lang="zh">{children}</RootLayout>;
}
