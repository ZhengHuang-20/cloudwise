import React, { useMemo, useState } from 'react';
import { App as AntApp, Button, Card, Form, Input, Modal, Select, Table, Tag, Typography } from 'antd';
import { ChartColumn, Plus } from 'lucide-react';
import { api } from '../../../lib/api';
import { useConsole } from '../ConsoleContext';
import { PageTitle } from '../parts';
import { HOSTING, type Site } from '../types';
import { useAdminData } from './useAdminData';

interface CreateValues {
  orgId: number;
  name: string;
  domain: string;
  hosting: string;
}

export const SitesPanel: React.FC = () => {
  const { selectSite, go, reloadSites } = useConsole();
  const { message, modal } = AntApp.useApp();
  const { data, loading, reload, orgName } = useAdminData();
  const [keyword, setKeyword] = useState('');
  const [orgFilter, setOrgFilter] = useState<number | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [grantSite, setGrantSite] = useState<Site | null>(null);
  const [grantIds, setGrantIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm<CreateValues>();

  const rows = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return (data?.sites ?? []).filter(
      (s) =>
        (!k || s.name.toLowerCase().includes(k) || s.domain.includes(k)) && (orgFilter === undefined || s.orgId === orgFilter),
    );
  }, [data, keyword, orgFilter]);

  const userById = (id: number) => data?.users.find((u) => u.id === id);

  const refresh = async () => {
    await reload();
    reloadSites();
  };

  const create = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try {
      await api('/api/admin/sites', { method: 'POST', body: { ...v, name: v.name.trim(), domain: v.domain.trim() } });
      message.success(`站点「${v.name.trim()}」已接入`);
      setCreateOpen(false);
      refresh();
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const grant = async () => {
    if (!grantSite || grantIds.length === 0) return;
    setBusy(true);
    try {
      for (const userId of grantIds) {
        await api(`/api/admin/sites/${grantSite.id}/members`, { method: 'POST', body: { userId } });
      }
      message.success('已授权');
      setGrantSite(null);
      refresh();
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const revoke = (site: Site, userId: number) => {
    const email = userById(userId)?.email ?? `#${userId}`;
    modal.confirm({
      title: '撤销授权',
      content: `${email} 将无法再查看「${site.name}」的数据。`,
      okText: '撤销',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api(`/api/admin/sites/${site.id}/members/${userId}`, { method: 'DELETE' });
          message.success('已撤销授权');
          refresh();
        } catch (e: any) {
          message.error(e.message);
        }
      },
    });
  };

  const grantable = grantSite
    ? (data?.users ?? []).filter((u) => u.role === 'customer' && u.orgId === grantSite.orgId && !grantSite.memberIds?.includes(u.id))
    : [];

  return (
    <>
      <PageTitle
        title="站点与授权"
        description="接入客户网站并授权给客户账号。site key 是公开标识，用于采集脚本与线索接口。"
        extra={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            接入站点
          </Button>
        }
      />

      <Card variant="borderless" styles={{ body: { padding: 0 } }}>
        <div className="flex flex-wrap gap-3 border-b border-separator p-4">
          <div className="w-full sm:w-72">
            <Input.Search
              allowClear
              placeholder="搜索站点名称或域名"
              onSearch={setKeyword}
              onChange={(e) => !e.target.value && setKeyword('')}
            />
          </div>
          <div className="w-full sm:w-52">
            <Select
              allowClear
              placeholder="全部公司"
              aria-label="按公司筛选"
              value={orgFilter}
              onChange={setOrgFilter}
              options={(data?.orgs ?? []).map((o) => ({ value: o.id, label: o.name }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <Table<Site>
          rowKey="id"
          loading={loading}
          dataSource={rows}
          scroll={{ x: 1080 }}
          pagination={{ pageSize: 20, hideOnSinglePage: true, showSizeChanger: false }}
          columns={[
            {
              title: '站点',
              key: 'site',
              width: 220,
              render: (_, s) => (
                <div className="min-w-0">
                  <p className="truncate font-semibold">{s.name}</p>
                  <a className="link block truncate text-caption" href={`https://${s.domain}`} target="_blank" rel="noreferrer noopener">
                    {s.domain}
                  </a>
                </div>
              ),
            },
            { title: '所属公司', dataIndex: 'orgId', width: 130, render: (id: number) => orgName(id) },
            {
              title: 'site key',
              dataIndex: 'siteKey',
              width: 260,
              render: (k: string, s) => (
                <div>
                  <Typography.Text copyable={{ text: k }} className="whitespace-nowrap tabular-nums">
                    {k}
                  </Typography.Text>
                  <p className="text-caption text-label-tertiary">{HOSTING[s.hosting] ?? s.hosting}</p>
                </div>
              ),
            },
            {
              title: '已授权账号',
              key: 'members',
              render: (_, s) => (
                <div className="flex flex-wrap gap-y-1.5">
                  {(s.memberIds ?? []).map((id) => (
                    <Tag
                      key={id}
                      closable
                      onClose={(e) => {
                        e.preventDefault();
                        revoke(s, id);
                      }}
                    >
                      {userById(id)?.email ?? `#${id}`}
                    </Tag>
                  ))}
                  <Button
                    size="small"
                    type="dashed"
                    icon={<Plus size={14} />}
                    onClick={() => {
                      setGrantIds([]);
                      setGrantSite(s);
                    }}
                  >
                    授权
                  </Button>
                </div>
              ),
            },
            {
              title: '操作',
              key: 'actions',
              width: 120,
              fixed: 'right',
              render: (_, s) => (
                <Button
                  type="link"
                  size="small"
                  icon={<ChartColumn size={14} />}
                  onClick={() => {
                    selectSite(s.id);
                    go('overview');
                  }}
                >
                  看数据
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal title="接入站点" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={create} okText="创建" confirmLoading={busy} destroyOnHidden width={480}>
        <Form form={form} layout="vertical" requiredMark={false} preserve={false} style={{ paddingTop: 8 }} initialValues={{ hosting: 'script' }}>
          <Form.Item name="orgId" label="所属公司" rules={[{ required: true, message: '请选择所属公司' }]}>
            <Select
              placeholder="选择公司"
              showSearch={{ optionFilterProp: 'label' }}
              options={(data?.orgs ?? []).map((o) => ({ value: o.id, label: o.name }))}
            />
          </Form.Item>
          <Form.Item name="name" label="站点名称" rules={[{ required: true, whitespace: true, message: '请输入站点名称' }, { max: 128, message: '不超过 128 字' }]}>
            <Input placeholder="如：爱康医疗官网" />
          </Form.Item>
          <Form.Item
            name="domain"
            label="域名"
            extra="填主域名即可，子域名与 www 会自动匹配。"
            rules={[{ required: true, whitespace: true, message: '请输入域名' }]}
          >
            <Input placeholder="www.example.com" />
          </Form.Item>
          <Form.Item name="hosting" label="接入方式">
            <Select options={Object.entries(HOSTING).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={grantSite ? `授权「${grantSite.name}」` : ''}
        open={!!grantSite}
        onCancel={() => setGrantSite(null)}
        onOk={grant}
        okText="授权"
        okButtonProps={{ disabled: grantIds.length === 0 }}
        confirmLoading={busy}
        destroyOnHidden
        width={480}
      >
        <p className="mb-3 text-caption text-label-secondary">
          只能授权给「{grantSite ? orgName(grantSite.orgId) : ''}」的客户账号。
        </p>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          aria-label="选择账号"
          placeholder={grantable.length ? '选择账号' : '该公司没有可授权的客户账号'}
          disabled={grantable.length === 0}
          value={grantIds}
          onChange={setGrantIds}
          options={grantable.map((u) => ({ value: u.id, label: u.displayName ? `${u.displayName}（${u.email}）` : u.email }))}
        />
      </Modal>
    </>
  );
};
