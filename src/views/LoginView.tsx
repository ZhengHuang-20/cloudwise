import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';

/**
 * 客户登录。账号由云端智荐开通（不开放自助注册），首次登录必须先修改初始密码。
 */
export const LoginView: React.FC<{ onLoggedIn: () => void; onGoToBooking: () => void }> = ({
  onLoggedIn,
  onGoToBooking,
}) => {
  const { user, loading, login, changePassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [next, setNext] = useState('');
  const [next2, setNext2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const mustChange = !!user?.mustChangePassword;

  useEffect(() => {
    if (user && !user.mustChangePassword) onLoggedIn();
  }, [user, onLoggedIn]);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next !== next2) {
      setError('两次输入的新密码不一致');
      return;
    }
    setBusy(true);
    try {
      await changePassword(password, next);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="section">
      <PageHeader
        eyebrow="客户后台"
        title={mustChange ? '设置新密码' : '登录'}
        intro={
          mustChange
            ? '首次登录需要把初始密码换成您自己的密码，至少 10 位。'
            : '查看您网站的访问统计与客户留下的线索。'
        }
      />
      <div className="layout-reading mt-10">
        <div className="mx-auto max-w-md">
          {loading ? (
            <p className="text-center text-body text-label-secondary">正在检查登录状态…</p>
          ) : mustChange ? (
            <form onSubmit={submitChange} className="space-y-5">
              <div>
                <label htmlFor="cur" className="field-label">当前（初始）密码</label>
                <input id="cur" type="password" autoComplete="current-password" required className="field"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <label htmlFor="new" className="field-label">新密码</label>
                <input id="new" type="password" autoComplete="new-password" required minLength={10} className="field"
                  value={next} onChange={(e) => setNext(e.target.value)} />
              </div>
              <div>
                <label htmlFor="new2" className="field-label">再输入一次新密码</label>
                <input id="new2" type="password" autoComplete="new-password" required minLength={10} className="field"
                  value={next2} onChange={(e) => setNext2(e.target.value)} />
              </div>
              {error && <p role="alert" className="text-caption text-danger">{error}</p>}
              <button type="submit" disabled={busy} className="btn btn-primary btn-lg btn-block">
                {busy ? '提交中…' : '保存并进入后台'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="field-label">邮箱</label>
                <input id="email" type="email" autoComplete="username" required className="field"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="pw" className="field-label">密码</label>
                <input id="pw" type="password" autoComplete="current-password" required className="field"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p role="alert" className="text-caption text-danger">{error}</p>}
              <button type="submit" disabled={busy} className="btn btn-primary btn-lg btn-block">
                {busy ? '登录中…' : '登录'}
              </button>
              <p className="text-center text-caption text-label-secondary">
                账号由我们为签约客户开通，暂不开放自助注册。还没有账号？{' '}
                <button type="button" onClick={onGoToBooking} className="link">预约诊断会</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
