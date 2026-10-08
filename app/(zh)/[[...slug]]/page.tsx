import { SitePage, siteMetadata, siteStaticParams } from '../../../src/site/page';

type Props = { params: Promise<{ slug?: string[] }> };

export const generateStaticParams = () => siteStaticParams('zh');

export async function generateMetadata({ params }: Props) {
  return siteMetadata('zh', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <SitePage lang="zh" slug={(await params).slug} />;
}
