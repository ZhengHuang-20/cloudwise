import { SitePage, siteMetadata, siteStaticParams } from '../../../../src/site/page';

type Props = { params: Promise<{ slug?: string[] }> };

export const generateStaticParams = () => siteStaticParams('en');

export async function generateMetadata({ params }: Props) {
  return siteMetadata('en', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <SitePage lang="en" slug={(await params).slug} />;
}
