import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Site } from './types';

const Code: React.FC<{ title: string; code: string }> = ({ title, code }) => {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    });
  };
  return (
    <div className="tile">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-title-3">{title}</h3>
        <button type="button" className="btn btn-secondary btn-sm" onClick={copy}>
          {done ? <Check /> : <Copy />}{done ? '已复制' : '复制'}
        </button>
      </div>
      <pre className="well mt-4 overflow-x-auto text-caption leading-relaxed"><code>{code}</code></pre>
    </div>
  );
};

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
  const curl = `curl -X POST ${origin}/api/public/leads \\
  -H 'Content-Type: application/json' \\
  -d '{"siteKey":"${site.siteKey}","name":"张三","phone":"13800000000","message":"想了解产品"}'`;

  return (
    <div className="space-y-6">
      <div className="tile">
        <p className="text-caption text-label-secondary">站点标识（site key，可公开）</p>
        <p className="mt-2 break-all text-title-3 tabular-nums">{site.siteKey}</p>
        <p className="mt-3 text-caption text-label-secondary">
          线索与访问数据只接受来自 {site.domain}（含子域名）的浏览器请求；服务器之间调用不受此限制。
        </p>
      </div>
      <Code title="① 统计：把脚本放进网站 <head>" code={script} />
      <Code title="② 线索：给表单加 data-cw-lead，提交时自动入库" code={form} />
      <Code title="③ 或者：后端 / 小程序直接调用接口" code={curl} />
      <p className="text-center text-caption text-label-secondary">
        脚本同时提供 <code>CloudWise.submitLead({'{'} name, phone, email, company, message {'}'})</code>，可在自有前端逻辑里调用。
      </p>
    </div>
  );
};
