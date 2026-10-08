import { llmsFullTxt, textResponse } from '../../../../src/site/llms';

// 网站内容全文版（英文），构建时生成
export const dynamic = 'force-static';

export function GET() {
  return textResponse(llmsFullTxt('en'));
}
