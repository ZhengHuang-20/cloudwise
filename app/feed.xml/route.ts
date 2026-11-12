import { feedResponse } from '../../src/site/feed';

// 「GEO 洞察」RSS（中文），构建时生成
export const dynamic = 'force-static';

export function GET() {
  return feedResponse('zh');
}
