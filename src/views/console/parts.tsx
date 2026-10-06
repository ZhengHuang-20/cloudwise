import React from 'react';
import { App as AntApp, Button, Typography } from 'antd';
import { Check, Copy, TriangleAlert } from 'lucide-react';

/** 功能页标题行：标题 + 说明，右侧放主操作。 */
export const PageTitle: React.FC<{ title: string; description?: React.ReactNode; extra?: React.ReactNode }> = ({
  title,
  description,
  extra,
}) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div className="min-w-0">
      <h1 className="text-[1.5rem] font-semibold leading-tight tracking-tight">{title}</h1>
      {description && <p className="mt-1.5 text-caption text-label-secondary">{description}</p>}
    </div>
    {extra && <div className="flex flex-wrap items-center gap-2">{extra}</div>}
  </div>
);

export const useCopy = () => {
  const { message } = AntApp.useApp();
  return (text: string, label = '已复制') =>
    navigator.clipboard
      ?.writeText(text)
      .then(() => message.success(label))
      .catch(() => message.error('复制失败，请手动选择复制'));
};

/** 代码块：顶栏放复制按钮，代码横向滚动。 */
export const CodeBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang = 'HTML' }) => {
  const copy = useCopy();
  const [done, setDone] = React.useState(false);
  return (
    <div className="overflow-hidden rounded-[10px] bg-canvas">
      <div className="flex items-center justify-between border-b border-separator py-1.5 pl-4 pr-2">
        <span className="text-caption text-label-tertiary">{lang}</span>
        <Button
          size="small"
          type="text"
          icon={done ? <Check size={14} /> : <Copy size={14} />}
          onClick={() => {
            copy(code, '代码已复制')?.then(() => {
              setDone(true);
              setTimeout(() => setDone(false), 1500);
            });
          }}
        >
          {done ? '已复制' : '复制'}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-caption leading-relaxed text-label-secondary">
        <code>{code}</code>
      </pre>
    </div>
  );
};

/** 初始密码只在创建 / 重置后显示这一次：用弹窗展示并提供复制。 */
export const showPassword = (
  modal: ReturnType<typeof AntApp.useApp>['modal'],
  { title, email, password }: { title: string; email: string; password: string },
) => {
  modal.success({
    title,
    width: 460,
    okText: '我已妥善保存',
    content: (
      <div className="mt-2 space-y-3">
        <p className="text-label-secondary">账号 {email}</p>
        <div className="flex items-center justify-between gap-3 rounded-[10px] bg-canvas px-4 py-3">
          <Typography.Text copyable={{ text: password, tooltips: ['复制', '已复制'] }} style={{ fontSize: 18 }} className="tabular-nums">
            {password}
          </Typography.Text>
        </div>
        <p className="flex items-start gap-2 text-caption text-warning">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          初始密码只显示这一次，关闭后无法再查看。请通过安全渠道发给客户，对方首次登录时需改成自己的密码。
        </p>
      </div>
    ),
  });
};
