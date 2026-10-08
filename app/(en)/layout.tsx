import { RootLayout, rootMetadata, rootViewport } from '../../src/site/RootLayout';

// 英文站（/en/*）的根布局
export const metadata = rootMetadata('en');
export const viewport = rootViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout lang="en">{children}</RootLayout>;
}
