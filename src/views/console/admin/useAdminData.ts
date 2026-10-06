import { useCallback, useEffect, useState } from 'react';
import { App as AntApp } from 'antd';
import { api } from '../../../lib/api';
import type { AdminUser, Org, Site } from '../types';

export interface AdminData {
  orgs: Org[];
  users: AdminUser[];
  sites: Site[];
}

/** 管理页共用：公司、账号、站点三张表一起加载，任何写操作后整体刷新。 */
export function useAdminData() {
  const { message } = AntApp.useApp();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [o, u, s] = await Promise.all([
        api<{ organizations: Org[] }>('/api/admin/organizations'),
        api<{ users: AdminUser[] }>('/api/admin/users'),
        api<{ sites: Site[] }>('/api/admin/sites'),
      ]);
      setData({ orgs: o.organizations, users: u.users, sites: s.sites });
    } catch (e: any) {
      message.error(e.message);
      setData((d) => d ?? { orgs: [], users: [], sites: [] });
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    reload();
  }, [reload]);

  const orgName = useCallback((id?: number) => data?.orgs.find((o) => o.id === id)?.name ?? '—', [data]);

  return { data, loading, reload, orgName };
}
