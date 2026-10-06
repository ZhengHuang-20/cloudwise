import React, { useMemo, useState } from 'react';
import { App as AntApp, Button, Card, Form, Input, Modal, Table } from 'antd';
import { Plus } from 'lucide-react';
import { api, formatTime } from '../../../lib/api';
import { PageTitle } from '../parts';
import type { Org } from '../types';
import { useAdminData } from './useAdminData';

export const OrgsPanel: React.FC = () => {
  const { message } = AntApp.useApp();
  const { data, loading, reload } = useAdminData();
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm<{ name: string }>();

  const rows = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return (data?.orgs ?? [])
      .filter((o) => !k || o.name.toLowerCase().includes(k))
      .map((o) => ({
        ...o,
        users: data!.users.filter((u) => u.orgId === o.id).length,
        sites: data!.sites.filter((s) => s.orgId === o.id).length,
      }));
  }, [data, keyword]);

  const create = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try {
      await api('/api/admin/organizations', { method: 'POST', body: { name: v.name.trim() } });
      message.success(`已添加「${v.name.trim()}」`);
      setOpen(false);
      reload();
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageTitle
        title="客户公司"
        description="签约客户的公司主体。账号与站点都归属于公司，站点只能授权给同一公司的账号。"
        extra={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            新建公司
          </Button>
        }
      />

      <Card variant="borderless" styles={{ body: { padding: 0 } }}>
        <div className="border-b border-separator p-4">
          <div className="w-full sm:w-72">
            <Input.Search allowClear placeholder="搜索公司名称" onSearch={setKeyword} onChange={(e) => !e.target.value && setKeyword('')} />
          </div>
        </div>
        <Table<Org & { users: number; sites: number }>
          rowKey="id"
          loading={loading}
          dataSource={rows}
          scroll={{ x: 640 }}
          pagination={{ pageSize: 20, hideOnSinglePage: true, showSizeChanger: false }}
          columns={[
            { title: '公司名称', dataIndex: 'name', render: (v: string) => <span className="font-semibold">{v}</span> },
            { title: '账号', dataIndex: 'users', width: 120, align: 'right', className: 'tabular-nums', sorter: (a, b) => a.users - b.users },
            { title: '站点', dataIndex: 'sites', width: 120, align: 'right', className: 'tabular-nums', sorter: (a, b) => a.sites - b.sites },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              width: 200,
              render: (v: string) => <span className="tabular-nums text-label-secondary">{formatTime(v)}</span>,
            },
          ]}
        />
      </Card>

      <Modal title="新建公司" open={open} onCancel={() => setOpen(false)} onOk={create} okText="创建" confirmLoading={busy} destroyOnHidden width={440}>
        <Form form={form} layout="vertical" requiredMark={false} preserve={false} style={{ paddingTop: 8 }}>
          <Form.Item
            name="name"
            label="公司名称"
            rules={[
              { required: true, whitespace: true, message: '请输入公司名称' },
              { max: 128, message: '不超过 128 字' },
            ]}
          >
            <Input placeholder="如：爱康医疗" autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
