import React, { useCallback, useEffect, useState } from 'react';
import { api, formatTime } from '../../lib/api';
import { Site } from './types';

interface Org { id: number; name: string }
interface User { id: number; email: string; role: string; displayName: string; orgId?: number; disabled: boolean; lastLoginAt?: string }

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="tile">
    <h3 className="text-title-3">{title}</h3>
    <div className="mt-4">{children}</div>
  </section>
);

/** 管理员：开通公司、账号、站点并授权。初始密码只在创建/重置后显示这一次。 */
export const AdminPanel: React.FC<{ onChanged: () => void }> = ({ onChanged }) => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [orgName, setOrgName] = useState('');
  const [u, setU] = useState({ email: '', displayName: '', orgId: '' });
  const [s, setS] = useState({ orgId: '', name: '', domain: '' });
  const [grant, setGrant] = useState({ siteId: '', userId: '' });

  const load = useCallback(async () => {
    try {
      const [o, us, st] = await Promise.all([
        api<{ organizations: Org[] }>('/api/admin/organizations'),
        api<{ users: User[] }>('/api/admin/users'),
        api<{ sites: Site[] }>('/api/admin/sites'),
      ]);
      setOrgs(o.organizations);
      setUsers(us.users);
      setSites(st.sites);
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<string | void>) => {
    setMsg(null);
    try {
      const text = await fn();
      if (text) setMsg({ ok: true, text });
      await load();
      onChanged();
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    }
  };

  const orgName_ = (id?: number) => orgs.find((o) => o.id === id)?.name ?? '—';
  const customers = users.filter((x) => x.role === 'customer');

  return (
    <div className="space-y-6">
      {msg && (
        <p role={msg.ok ? 'status' : 'alert'} className={`well break-all text-body ${msg.ok ? 'text-success' : 'text-danger'}`}>{msg.text}</p>
      )}

      <Section title="客户公司">
        <form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); run(async () => { await api('/api/admin/organizations', { method: 'POST', body: { name: orgName } }); setOrgName(''); }); }}>
          <input className="field" placeholder="公司名称，如 爱康医疗" required value={orgName} onChange={(e) => setOrgName(e.target.value)} aria-label="公司名称" />
          <button className="btn btn-primary shrink-0" type="submit">添加</button>
        </form>
        <p className="mt-3 text-caption text-label-secondary">{orgs.map((o) => o.name).join('、') || '暂无公司'}</p>
      </Section>

      <Section title="开通客户账号">
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const r = await api<{ email: string; initialPassword: string }>('/api/admin/users', {
              method: 'POST', body: { email: u.email, displayName: u.displayName, orgId: Number(u.orgId) },
            });
            setU({ email: '', displayName: '', orgId: u.orgId });
            return `已创建 ${r.email}，初始密码（仅显示一次）：${r.initialPassword}`;
          });
        }}>
          <input className="field" type="email" placeholder="登录邮箱" required value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} aria-label="登录邮箱" />
          <input className="field" placeholder="姓名（可选）" value={u.displayName} onChange={(e) => setU({ ...u, displayName: e.target.value })} aria-label="姓名" />
          <select className="field" required value={u.orgId} onChange={(e) => setU({ ...u, orgId: e.target.value })} aria-label="所属公司">
            <option value="">选择所属公司</option>
            {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <button className="btn btn-primary" type="submit">创建并生成初始密码</button>
        </form>
        <ul className="mt-4 divide-y divide-separator">
          {users.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-body">
              <span className="min-w-0 break-all">
                {x.email} <span className="text-caption text-label-secondary">· {x.role === 'admin' ? '管理员' : orgName_(x.orgId)}{x.disabled ? ' · 已停用' : ''}{x.lastLoginAt ? ` · 上次登录 ${formatTime(x.lastLoginAt)}` : ''}</span>
              </span>
              <span className="flex gap-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => run(async () => {
                  const r = await api<{ initialPassword?: string; password?: string }>(`/api/admin/users/${x.id}/reset-password`, { method: 'POST', body: {} });
                  return `${x.email} 的新初始密码（仅显示一次）：${r.initialPassword ?? r.password}`;
                })}>重置密码</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => run(async () => { await api(`/api/admin/users/${x.id}`, { method: 'PATCH', body: { disabled: !x.disabled } }); })}>
                  {x.disabled ? '启用' : '停用'}
                </button>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="接入站点">
        <form className="grid gap-3 sm:grid-cols-3" onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const r = await api<{ site: Site }>('/api/admin/sites', { method: 'POST', body: { orgId: Number(s.orgId), name: s.name, domain: s.domain } });
            setS({ orgId: s.orgId, name: '', domain: '' });
            return `站点已创建，site key：${r.site.siteKey}`;
          });
        }}>
          <select className="field" required value={s.orgId} onChange={(e) => setS({ ...s, orgId: e.target.value })} aria-label="所属公司">
            <option value="">所属公司</option>
            {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input className="field" placeholder="站点名称" required value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} aria-label="站点名称" />
          <input className="field" placeholder="域名 www.example.com" required value={s.domain} onChange={(e) => setS({ ...s, domain: e.target.value })} aria-label="域名" />
          <button className="btn btn-primary sm:col-span-3" type="submit">创建站点</button>
        </form>
        <ul className="mt-4 divide-y divide-separator">
          {sites.map((x) => (
            <li key={x.id} className="py-3 text-body">{x.name} <span className="text-caption text-label-secondary">· {x.domain} · {orgName_(x.orgId)} · {x.siteKey}</span></li>
          ))}
        </ul>
      </Section>

      <Section title="授权站点给客户账号">
        <form className="grid gap-3 sm:grid-cols-3" onSubmit={(e) => {
          e.preventDefault();
          run(async () => { await api(`/api/admin/sites/${grant.siteId}/members`, { method: 'POST', body: { userId: Number(grant.userId) } }); return '已授权'; });
        }}>
          <select className="field" required value={grant.siteId} onChange={(e) => setGrant({ ...grant, siteId: e.target.value })} aria-label="站点">
            <option value="">选择站点</option>
            {sites.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <select className="field" required value={grant.userId} onChange={(e) => setGrant({ ...grant, userId: e.target.value })} aria-label="客户账号">
            <option value="">选择账号（须同公司）</option>
            {customers.map((x) => <option key={x.id} value={x.id}>{x.email}（{orgName_(x.orgId)}）</option>)}
          </select>
          <button className="btn btn-primary" type="submit">授权</button>
        </form>
      </Section>
    </div>
  );
};
