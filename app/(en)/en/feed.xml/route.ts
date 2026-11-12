import { feedResponse } from '../../../../src/site/feed';

// GEO insights RSS (English), generated at build time
export const dynamic = 'force-static';

export function GET() {
  return feedResponse('en');
}
