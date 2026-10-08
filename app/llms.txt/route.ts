import { llmsTxt, textResponse } from '../../src/site/llms';

// 写给大模型的网站导读（https://llmstxt.org/），构建时生成
export const dynamic = 'force-static';

export function GET() {
  return textResponse(llmsTxt());
}
