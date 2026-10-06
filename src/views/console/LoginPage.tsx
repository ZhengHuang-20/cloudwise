import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Spin } from 'antd';
import { ArrowLeft, ChartColumn, Inbox, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { confirmRules, newPasswordRules } from './ChangePasswordModal';
import { CONSOLE_COLORS } from './theme';

const FEATURES = [
  { icon: ChartColumn, title: '访问统计', desc: '按北京时间分天统计浏览量、访客、来源与设备。' },
  { icon: Inbox, title: '线索管理', desc: '官网表单的留资实时入库，跟进状态与备注集中管理。' },
  { icon: ShieldCheck, title: '数据隔离', desc: '账号由我们开通，每个账号只能查看授权给它的站点。' },
];

const Brand: React.FC = () => (
  <div className="flex items-center gap-2.5">
    <img src="/brand/logo-mark.png" alt="" className="h-7 w-auto" />
    <span className="text-body font-semibold">云端智荐</span>
    <span className="text-caption text-label-tertiary">客户后台</span>
  </div>
);

/**
 * 客户登录。账号由云端智荐开通（不开放自助注册），首次登录必须先修改初始密码。
 */
export const LoginPage: React.FC<{ onLoggedIn: () => void; onGoHome: () => void; onGoToBooking: () => void }> = ({
  onLoggedIn,
  onGoHome,
  onGoToBooking,
}) => {
  const { user, loading, login, changePassword } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const mustChange = !!user?.mustChangePassword;

  useEffect(() => {
    if (user && !user.mustChangePassword) onLoggedIn();
  }, [user, onLoggedIn]);

  const run = async (fn: () => Promise<unknown>) => {
    setError('');
    setBusy(true);
    try {
      await fn();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-canvas text-label lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* 品牌面板：仅大屏 */}
      <aside
        className="relative hidden overflow-hidden border-r border-separator p-12 lg:flex lg:flex-col"
        style={{ background: CONSOLE_COLORS.sider }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgb(0 113 227 / 0.28), transparent)' }}
        />
        <div className="relative">
          <Brand />
        </div>
        <div className="relative my-auto max-w-[30rem]">
          <p className="text-caption text-label-secondary">网站数据与线索，一处查看</p>
          <h2 className="mt-4 text-[2.5rem] font-semibold leading-[1.15] tracking-tight">
            看清每一位访客，
            <br />
            接住每一条线索。
          </h2>
          <ul className="mt-12 space-y-7">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex gap-4">
                <Icon size={20} className="mt-0.5 shrink-0 text-link" aria-hidden="true" />
                <div>
                  <p className="text-body font-semibold">{title}</p>
                  <p className="mt-1 text-caption text-label-secondary">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-caption text-label-tertiary">© {new Date().getFullYear()} 云端智荐</p>
      </aside>

      {/* 表单 */}
      <main className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Brand />
          </div>
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={onGoHome} className="ml-auto">
            返回官网
          </Button>
        </div>

        <div className="mx-auto my-auto w-full max-w-[380px] py-12">
          {loading ? (
            <div className="flex justify-center">
              <Spin />
            </div>
          ) : (
            <>
              <h1 className="text-[1.75rem] font-semibold tracking-tight">{mustChange ? '设置新密码' : '登录客户后台'}</h1>
              <p className="mt-2 text-caption text-label-secondary">
                {mustChange ? '首次登录需要把初始密码换成您自己的密码。' : '查看您网站的访问统计与客户留下的线索。'}
              </p>

              {error && <Alert style={{ marginTop: 24 }} type="error" showIcon title={error} />}

              {mustChange ? (
                <Form
                  key="change"
                  layout="vertical"
                  requiredMark={false}
                  size="large"
                  style={{ marginTop: 32 }}
                  onFinish={(v: { current: string; next: string }) => run(() => changePassword(v.current, v.next))}
                >
                  <Form.Item name="current" label="当前（初始）密码" rules={[{ required: true, message: '请输入初始密码' }]}>
                    <Input.Password autoComplete="current-password" prefix={<Lock size={16} />} />
                  </Form.Item>
                  <Form.Item name="next" label="新密码" rules={newPasswordRules} extra="至少 10 位，不能与邮箱相同">
                    <Input.Password autoComplete="new-password" prefix={<Lock size={16} />} />
                  </Form.Item>
                  <Form.Item name="next2" label="确认新密码" dependencies={['next']} rules={confirmRules()}>
                    <Input.Password autoComplete="new-password" prefix={<Lock size={16} />} />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={busy} style={{ marginTop: 8 }}>
                    保存并进入后台
                  </Button>
                </Form>
              ) : (
                <Form
                  key="login"
                  layout="vertical"
                  requiredMark={false}
                  size="large"
                  style={{ marginTop: 32 }}
                  onFinish={(v: { email: string; password: string }) => run(() => login(v.email, v.password))}
                >
                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '邮箱格式不正确' },
                    ]}
                  >
                    <Input autoComplete="username" prefix={<Mail size={16} />} placeholder="name@company.com" />
                  </Form.Item>
                  <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password autoComplete="current-password" prefix={<Lock size={16} />} />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={busy} style={{ marginTop: 8 }}>
                    登录
                  </Button>
                </Form>
              )}

              {!mustChange && (
                <p className="mt-8 text-center text-caption text-label-secondary">
                  账号由我们为签约客户开通，暂不开放自助注册。
                  <br />
                  还没有账号？
                  <button type="button" onClick={onGoToBooking} className="link">
                    预约诊断会
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
