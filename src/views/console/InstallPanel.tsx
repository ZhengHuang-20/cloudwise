import React from 'react';
import { Card, Descriptions, Tabs, Typography } from 'antd';
import { CodeBlock, PageTitle } from './parts';
import { HOSTING, type Site } from './types';

const Step: React.FC<{ n: number; title: string; desc: React.ReactNode; code: string; lang?: string }> = ({ n, title, desc, code, lang }) => (
  <div className="space-y-4">
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fill text-caption tabular-nums">{n}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-caption text-label-secondary">{desc}</p>
      </div>
    </div>
    <CodeBlock code={code} lang={lang} />
  </div>
);

export const InstallPanel: React.FC<{ site: Site }> = ({ site }) => {
  const origin = window.location.origin;
  const script = `<script async src="${origin}/cw.js" data-site="${site.siteKey}"></script>`;
  const form = `<form data-cw-lead>
  <input name="name" placeholder="姓名">
  <input name="phone" placeholder="手机号">
  <input name="email" placeholder="邮箱">
  <textarea name="message" placeholder="想了解什么"></textarea>
  <!-- 蜜罐：用 CSS 隐藏，机器人才会填 -->
  <input name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px">
  <button type="submit">提交</button>
</form>
<script>
  document.addEventListener('cw:success', () => alert('已收到，我们会尽快联系您'));
  document.addEventListener('cw:error', (e) => alert(e.detail));
</script>`;
  const js = `CloudWise.submitLead({
  name: '张三',
  phone: '13800000000',
  email: 'zhangsan@example.com',
  company: '示例公司',
  message: '想了解产品',
});`;
  const curl = `curl -X POST ${origin}/api/public/leads \\
  -H 'Content-Type: application/json' \\
  -d '{"siteKey":"${site.siteKey}","name":"张三","phone":"13800000000","message":"想了解产品"}'`;

  return (
    <>
      <PageTitle title="接入代码" description="把采集脚本与线索表单接到您的网站，数据会实时进入后台。" />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card variant="borderless" className="xl:order-2 xl:self-start" title="站点信息">
          <Descriptions
            column={1}
            size="small"
            colon={false}
            styles={{ label: { width: 80 } }}
            items={[
              { key: 'name', label: '站点', children: site.name },
              { key: 'domain', label: '域名', children: site.domain },
              { key: 'hosting', label: '接入方式', children: HOSTING[site.hosting] ?? site.hosting },
              {
                key: 'key',
                label: 'site key',
                children: (
                  <Typography.Text copyable={{ text: site.siteKey }} className="break-all tabular-nums">
                    {site.siteKey}
                  </Typography.Text>
                ),
              },
            ]}
          />
          <p className="mt-4 text-caption text-label-secondary">
            site key 是公开标识，不是密钥。线索与访问数据只接受来自 {site.domain}（含子域名）的浏览器请求；服务器之间的调用不受此限制。
          </p>
        </Card>

        <Card variant="borderless" className="min-w-0 xl:order-1" styles={{ body: { paddingTop: 4 } }}>
          <Tabs
            items={[
              {
                key: 'web',
                label: '网站嵌入',
                children: (
                  <div className="space-y-8 pt-2">
                    <Step
                      n={1}
                      title="统计：把脚本放进网站的 <head>"
                      desc="自动上报页面浏览，只记录匿名访客标识，不存 IP。"
                      code={script}
                    />
                    <Step
                      n={2}
                      title="线索：给表单加上 data-cw-lead"
                      desc="提交时自动入库，字段名用 name / phone / email / company / message，手机与邮箱至少填一项。"
                      code={form}
                    />
                  </div>
                ),
              },
              {
                key: 'js',
                label: '自有前端',
                children: (
                  <div className="pt-2">
                    <Step
                      n={1}
                      title="在自己的提交逻辑里调用"
                      desc="页面已加载采集脚本时可用，返回 Promise。"
                      code={js}
                      lang="JavaScript"
                    />
                  </div>
                ),
              },
              {
                key: 'api',
                label: '服务端接口',
                children: (
                  <div className="pt-2">
                    <Step
                      n={1}
                      title="后端 / 小程序直接调用"
                      desc="POST /api/public/leads，按 IP 限流；不带 Origin 的服务端请求不做域名校验。"
                      code={curl}
                      lang="Shell"
                    />
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </>
  );
};
