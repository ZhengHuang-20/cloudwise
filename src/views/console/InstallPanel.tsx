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

/** 某个站点的接入代码片段：采集脚本、线索表单、手动调用与服务端接口。 */
export const installSnippets = (site: Site, origin = window.location.origin) => ({
  script: `<script async src="${origin}/cw.js" data-site="${site.siteKey}"></script>`,
  form: `<form data-cw-lead>
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
</script>`,
  js: `CloudWise.submitLead({
  name: '张三',
  phone: '13800000000',
  email: 'zhangsan@example.com',
  company: '示例公司',
  message: '想了解产品',
});`,
  curl: `curl -X POST ${origin}/api/public/leads \\
  -H 'Content-Type: application/json' \\
  -d '{"siteKey":"${site.siteKey}","name":"张三","phone":"13800000000","message":"想了解产品"}'`,
  endpoint: `${origin}/api/public/leads`,
});

/** 纯文本的接入说明：管理员复制后直接发给客户的技术人员。 */
export const installGuideText = (site: Site, origin = window.location.origin) => {
  const s = installSnippets(site, origin);
  return `【${site.name}】网站数据接入说明

站点域名：${site.domain}
site key：${site.siteKey}（公开标识，不是密钥）

一、访问统计（必做）
把下面这行代码放进网站所有页面的 <head> 里：

${s.script}

上线后打开网站任意页面，刷新后台「数据概览」即可看到访问。单页应用切换路由时会自动上报，不需要额外代码。
来源渠道（搜索、AI 助手、社交、广告等）、国家地区、设备与浏览器由服务端自动识别；投放链接请带上 utm_source / utm_medium / utm_campaign 参数，后台会按活动统计。页面地址的查询参数不入库，同一页面不会被参数拆散。
排除自己的访问：在网址后加 ?cw_ignore=1 打开一次（记在这台浏览器上），恢复用 ?cw_ignore=0。
自查：在网址后加 ?cw_debug=1 打开页面，浏览器控制台会打印「[CloudWise] 已上报」；没有上报时控制台会给出原因（脚本标签缺 data-site、来源域名不匹配、被拦截插件或 CSP 拦截等）。

二、线索表单（按网站情况任选一种）
方式 1：给现有表单加上 data-cw-lead 属性，提交时自动入库。字段名用 name / phone / email / company / message，手机与邮箱至少填一项。提交成功会触发 cw:success 事件，失败触发 cw:error（e.detail 为错误说明）。示例：

${s.form}

方式 2：自己写提交逻辑的，在页面已加载上面脚本的前提下调用（返回 Promise）：

${s.js}

方式 3：后端或小程序直接调用接口 POST ${s.endpoint}（JSON，按 IP 限流）：

${s.curl}

注意事项
- 浏览器端只接受来自 ${site.domain}（含子域名，www 与不带 www 均可）的请求；在本地或其他测试域名上提交会被拒绝。服务器之间的调用不做域名校验。
- 访问统计只记录匿名访客标识，不存 IP；国家地区由托管平台按 IP 判断后只保存国家与省 / 州代码。
`;
};

/** 接入代码的分步说明（网站嵌入 / 自有前端 / 服务端接口），后台「接入代码」页与站点管理的抽屉共用。 */
export const InstallGuide: React.FC<{ site: Site }> = ({ site }) => {
  const s = installSnippets(site);
  return (
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
                desc="所有页面都要放。自动上报页面浏览与停留时长，单页应用切换路由也会上报；来源渠道、国家地区、设备由服务端识别。只记录匿名访客标识，不存 IP。"
                code={s.script}
              />
              <div className="flex gap-3">
                <span className="h-6 w-6 shrink-0" />
                <ul className="list-disc space-y-1 pl-4 text-caption text-label-secondary">
                  <li>投放链接带上 utm_source / utm_medium / utm_campaign 参数，「数据概览」的来源渠道里可以按活动查看效果。</li>
                  <li>排除自己和同事的访问：在网址后加 ?cw_ignore=1 打开一次即可（记在当前浏览器），恢复用 ?cw_ignore=0。</li>
                </ul>
              </div>
              <Step
                n={2}
                title="线索：给表单加上 data-cw-lead"
                desc="提交时自动入库，字段名用 name / phone / email / company / message，手机与邮箱至少填一项。"
                code={s.form}
              />
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fill text-caption tabular-nums">3</span>
                <div>
                  <p className="font-semibold">验证</p>
                  <p className="mt-1 text-caption text-label-secondary">
                    上线后在 {site.domain} 打开任意页面、提交一条测试线索，再到「数据概览」「线索管理」查看。本地或其他测试域名上的请求会被拒绝。
                  </p>
                </div>
              </div>
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
                code={s.js}
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
                code={s.curl}
                lang="Shell"
              />
            </div>
          ),
        },
      ]}
    />
  );
};

export const InstallPanel: React.FC<{ site: Site }> = ({ site }) => (
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
        <InstallGuide site={site} />
      </Card>
    </div>
  </>
);
