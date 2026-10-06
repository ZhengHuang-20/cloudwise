import React, { useMemo, useState } from 'react';
import { App as AntApp, Avatar, Badge, Button, Card, Form, Input, Modal, Popconfirm, Radio, Select, Table, Tag, Tooltip } from 'antd';
import { Plus } from 'lucide-react';
import { api, formatTime } from '../../../lib/api';
import { useConsole } from '../ConsoleContext';
import { PageTitle, showPassword } from '../parts';
import type { AdminUser } from '../types';
import { useAdminData } from './useAdminData';

interface CreateValues {
  role: 'customer' | 'admin';
  email: string;
  displayName?: string;
  orgId?: number;
  siteIds?: number[];
}

const StatusBadge: React.FC<{ u: AdminUser }> = ({ u }) =>
  u.disabled ? (
    <Badge status="default" text="已停用" />
  ) : u.mustChangePassword ? (
    <Badge status="warning" text="待首次改密" />
  ) : (
    <Badge status="success" text="正常" />
  );

export const UsersPanel: React.FC = () => {
  const { user: me, reloadSites } = useConsole();
  const { message, modal } = AntApp.useApp();
  const { data, loading, reload, orgName } = useAdminData();
  const [keyword, setKeyword] = useState('');
  const [orgFilter, setOrgFilter] = useState<number | undefined>();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm<CreateValues>();
  const role = Form.useWatch('role', form);
  const orgId = Form.useWatch('orgId', form);

  const rows = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return (data?.users ?? []).filter(
      (u) =>
        (!k || u.email.includes(k) || u.displayName.toLowerCase().includes(k)) &&
        (orgFilter === undefined || u.orgId === orgFilter),
    );
  }, [data, keyword, orgFilter]);

  const sitesOf = (u: AdminUser) => (data?.sites ?? []).filter((s) => s.memberIds?.includes(u.id));

  const act = async (fn: () => Promise<void>) => {
    try {
      await fn();
      await reload();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const create = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try {
      const r = await api<{ id: number; email: string; initialPassword: string }>('/api/admin/users', {
        method: 'POST',
        body: { email: v.email.trim(), displayName: v.displayName?.trim() ?? '', role: v.role, ...(v.role === 'customer' ? { orgId: v.orgId } : {}) },
      });
      let grantError = '';
      for (const siteId of v.role === 'customer' ? (v.siteIds ?? []) : []) {
        try {
          await api(`/api/admin/sites/${siteId}/members`, { method: 'POST', body: { userId: r.id } });
        } catch (e: any) {
          grantError = e.message;
        }
      }
      setOpen(false);
      showPassword(modal, { title: '账号已创建', email: r.email, password: r.initialPassword });
      if (grantError) message.warning(`部分站点授权失败：${grantError}`);
      reload();
      reloadSites();
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageTitle
        title="账号"
        description="账号由管理员开通，不开放注册。初始密码只显示一次，客户首次登录时需改成自己的密码。"
        extra={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            新建账号
          </Button>
        }
      />

      <Card variant="borderless" styles={{ body: { padding: 0 } }}>
        <div className="flex flex-wrap gap-3 border-b border-separator p-4">
          <div className="w-full sm:w-72">
            <Input.Search
              allowClear
              placeholder="搜索邮箱或姓名"
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
        <Table<AdminUser>
          rowKey="id"
          loading={loading}
          dataSource={rows}
          scroll={{ x: 1040 }}
          pagination={{ pageSize: 20, hideOnSinglePage: true, showSizeChanger: false }}
          columns={[
            {
              title: '账号',
              key: 'account',
              width: 260,
              render: (_, u) => (
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar size={32} className="shrink-0">{(u.displayName || u.email).slice(0, 1).toUpperCase()}</Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{u.displayName || u.email.split('@')[0]}</p>
                    <p className="truncate text-caption text-label-secondary">{u.email}</p>
                  </div>
                </div>
              ),
            },
            {
              title: '角色',
              dataIndex: 'role',
              width: 100,
              render: (r: string) => (r === 'admin' ? <Tag color="blue">管理员</Tag> : <Tag>客户</Tag>),
            },
            { title: '所属公司', dataIndex: 'orgId', width: 160, render: (id?: number) => (id ? orgName(id) : <span className="text-label-tertiary">—</span>) },
            {
              title: '可访问站点',
              key: 'sites',
              width: 120,
              render: (_, u) => {
                if (u.role === 'admin') return <span className="text-label-secondary">全部</span>;
                const list = sitesOf(u);
                return list.length ? (
                  <Tooltip title={list.map((s) => s.name).join('、')}>
                    <span className="tabular-nums">{list.length} 个</span>
                  </Tooltip>
                ) : (
                  <span className="text-warning">未授权</span>
                );
              },
            },
            { title: '状态', key: 'status', width: 130, render: (_, u) => <StatusBadge u={u} /> },
            {
              title: '上次登录',
              dataIndex: 'lastLoginAt',
              width: 190,
              render: (v?: string) =>
                v ? <span className="tabular-nums text-label-secondary">{formatTime(v)}</span> : <span className="text-label-tertiary">从未登录</span>,
            },
            {
              title: '操作',
              key: 'actions',
              width: 170,
              fixed: 'right',
              render: (_, u) => (
                <div className="flex gap-1">
                  <Popconfirm
                    title="重置密码"
                    description="将生成新的初始密码，并让该账号退出所有已登录设备。"
                    okText="重置"
                    onConfirm={() =>
                      act(async () => {
                        const r = await api<{ initialPassword: string }>(`/api/admin/users/${u.id}/reset-password`, { method: 'POST', body: {} });
                        showPassword(modal, { title: '密码已重置', email: u.email, password: r.initialPassword });
                      })
                    }
                  >
                    <Button type="link" size="small">重置密码</Button>
                  </Popconfirm>
                  {u.id !== me.id &&
                    (u.disabled ? (
                      <Button
                        type="link"
                        size="small"
                        onClick={() =>
                          act(async () => {
                            await api(`/api/admin/users/${u.id}`, { method: 'PATCH', body: { disabled: false } });
                            message.success(`已启用 ${u.email}`);
                          })
                        }
                      >
                        启用
                      </Button>
                    ) : (
                      <Popconfirm
                        title="停用账号"
                        description="停用后该账号立即退出登录，且无法再登录。"
                        okText="停用"
                        okButtonProps={{ danger: true }}
                        onConfirm={() =>
                          act(async () => {
                            await api(`/api/admin/users/${u.id}`, { method: 'PATCH', body: { disabled: true } });
                            message.success(`已停用 ${u.email}`);
                          })
                        }
                      >
                        <Button type="link" size="small" danger>停用</Button>
                      </Popconfirm>
                    ))}
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal title="新建账号" open={open} onCancel={() => setOpen(false)} onOk={create} okText="创建并生成初始密码" confirmLoading={busy} destroyOnHidden width={480}>
        <Form form={form} layout="vertical" requiredMark={false} preserve={false} style={{ paddingTop: 8 }} initialValues={{ role: 'customer' }}>
          <Form.Item name="role" label="角色">
            <Radio.Group
              optionType="button"
              options={[
                { value: 'customer', label: '客户' },
                { value: 'admin', label: '管理员' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="登录邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input autoComplete="off" placeholder="name@company.com" />
          </Form.Item>
          <Form.Item name="displayName" label="姓名（可选）" rules={[{ max: 64, message: '不超过 64 字' }]}>
            <Input />
          </Form.Item>
          {role !== 'admin' && (
            <>
              <Form.Item name="orgId" label="所属公司" rules={[{ required: true, message: '请选择所属公司' }]}>
                <Select
                  placeholder="选择公司"
                  showSearch={{ optionFilterProp: 'label' }}
                  options={(data?.orgs ?? []).map((o) => ({ value: o.id, label: o.name }))}
                  onChange={() => form.setFieldValue('siteIds', [])}
                />
              </Form.Item>
              <Form.Item name="siteIds" label="授权站点（可选）" extra="只能选择该公司名下的站点，之后也可在「站点与授权」里调整。">
                <Select
                  mode="multiple"
                  disabled={!orgId}
                  placeholder={orgId ? '选择站点' : '先选择所属公司'}
                  options={(data?.sites ?? []).filter((s) => s.orgId === orgId).map((s) => ({ value: s.id, label: `${s.name}（${s.domain}）` }))}
                />
              </Form.Item>
            </>
          )}
          {role === 'admin' && (
            <p className="text-caption text-warning">管理员可以查看全部站点并管理所有账号，请谨慎开通。</p>
          )}
        </Form>
      </Modal>
    </>
  );
};
