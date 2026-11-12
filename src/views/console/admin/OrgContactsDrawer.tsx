import React, { useCallback, useEffect, useState } from 'react';
import { Alert, App as AntApp, Badge, Button, Drawer, Form, Input, Modal, Popconfirm, Switch, Table, Tooltip } from 'antd';
import { MessageSquareText, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, formatTime } from '../../../lib/api';
import { normalizePhone } from '../../../lib/contact';
import type { Org, OrgContact, SmsLog } from '../types';

interface ContactsResponse {
  contacts: OrgContact[];
  smsConfigured: boolean;
  dailyLimit: number;
  logs: SmsLog[];
}

interface FormValues {
  name: string;
  title: string;
  phone: string;
  notifyLeads: boolean;
}

const LOG_STATUS: Record<SmsLog['status'], { text: string; badge: 'success' | 'error' | 'default' }> = {
  sent: { text: '已发送', badge: 'success' },
  failed: { text: '失败', badge: 'error' },
  skipped: { text: '未发送', badge: 'default' },
};

/** 企业联系人：手机号、新线索短信开关、测试短信与最近的发送记录 */
export const OrgContactsDrawer: React.FC<{ org: Org | null; onClose: () => void; onChanged: () => void }> = ({
  org,
  onClose,
  onChanged,
}) => {
  const { message } = AntApp.useApp();
  const [data, setData] = useState<ContactsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<OrgContact | 'new' | null>(null);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState<number | null>(null);
  const [form] = Form.useForm<FormValues>();
  const base = org ? `/api/admin/organizations/${org.id}/contacts` : '';

  const load = useCallback(async () => {
    if (!base) return;
    setLoading(true);
    try {
      setData(await api<ContactsResponse>(base));
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [base, message]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const changed = () => {
    load();
    onChanged();
  };

  const openForm = (c: OrgContact | 'new') => setEditing(c);
  // 弹窗关闭即销毁表单，每次打开按 initialValues 重新填充
  const initialValues: FormValues =
    editing && editing !== 'new'
      ? { name: editing.name, title: editing.title, phone: editing.phone, notifyLeads: editing.notifyLeads }
      : { name: '', title: '', phone: '', notifyLeads: true };

  const save = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try {
      const body = { name: v.name.trim(), title: (v.title ?? '').trim(), phone: v.phone, notifyLeads: v.notifyLeads };
      if (editing === 'new') await api(base, { method: 'POST', body });
      else if (editing) await api(`${base}/${editing.id}`, { method: 'PATCH', body });
      message.success(editing === 'new' ? `已添加联系人「${body.name}」` : '已保存');
      setEditing(null);
      changed();
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (c: OrgContact, notifyLeads: boolean) => {
    try {
      await api(`${base}/${c.id}`, { method: 'PATCH', body: { notifyLeads } });
      message.success(notifyLeads ? `${c.name} 将收到新线索短信` : `已停止给 ${c.name} 发新线索短信`);
      changed();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const remove = async (c: OrgContact) => {
    try {
      await api(`${base}/${c.id}`, { method: 'DELETE' });
      message.success(`已删除联系人「${c.name}」`);
      changed();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const test = async (c: OrgContact) => {
    setTesting(c.id);
    try {
      await api(`${base}/${c.id}/test`, { method: 'POST' });
      message.success(`测试短信已发往 ${c.phone}，一般几秒内到达`);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setTesting(null);
      load();
    }
  };

  return (
    <Drawer
      open={!!org}
      onClose={onClose}
      size={Math.min(720, typeof window === 'undefined' ? 720 : window.innerWidth)}
      title={org ? `联系人与短信：${org.name}` : ''}
      extra={
        <Button type="primary" icon={<Plus size={16} />} onClick={() => openForm('new')}>
          添加联系人
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {data && !data.smsConfigured && (
          <Alert
            type="warning"
            showIcon
            message="短信服务尚未配置"
            description="联系人可以先登记，但不会发出短信。在 Vercel 的环境变量里填写 ALIYUN_ACCESS_KEY_ID、ALIYUN_ACCESS_KEY_SECRET、ALIYUN_SMS_SIGN_NAME、ALIYUN_SMS_TEMPLATE_LEAD 并重新部署后生效。"
          />
        )}
        <p className="text-caption text-label-secondary">
          打开「新线索短信」的联系人，会在该公司任一站点收到新线索（含 AI 可见性测评留资）时立即收到一条短信，内容为站点、称呼与联系方式。
          {data ? `每个号码每天最多 ${data.dailyLimit} 条，超出的只记录不发送。` : ''}
        </p>

        <Table<OrgContact>
          rowKey="id"
          size="middle"
          loading={loading && !data}
          dataSource={data?.contacts ?? []}
          pagination={false}
          scroll={{ x: 440 }}
          locale={{ emptyText: '还没有联系人，点右上角「添加联系人」登记企业负责人的手机号' }}
          columns={[
            {
              title: '联系人',
              key: 'name',
              render: (_, c) => (
                <div className="min-w-0">
                  <p className="truncate">
                    <span className="font-semibold">{c.name}</span>
                    {c.title && <span className="text-label-secondary"> · {c.title}</span>}
                  </p>
                  <p className="text-caption tabular-nums text-label-secondary">{c.phone}</p>
                </div>
              ),
            },
            {
              title: '短信',
              dataIndex: 'notifyLeads',
              width: 72,
              render: (v: boolean, c) => (
                <Switch size="small" checked={v} aria-label={`给 ${c.name} 发新线索短信`} onChange={(on) => toggle(c, on)} />
              ),
            },
            {
              title: '操作',
              key: 'actions',
              width: 168,
              fixed: 'right',
              render: (_, c) => (
                <div className="flex whitespace-nowrap">
                  <Tooltip title={data?.smsConfigured ? '用新线索模板发一条示例短信' : '短信服务未配置'}>
                    <Button
                      type="link"
                      size="small"
                      icon={<MessageSquareText size={14} />}
                      disabled={!data?.smsConfigured}
                      loading={testing === c.id}
                      onClick={() => test(c)}
                    >
                      测试
                    </Button>
                  </Tooltip>
                  <Button type="link" size="small" icon={<Pencil size={14} />} onClick={() => openForm(c)}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="删除联系人"
                    description={`删除后 ${c.name} 不再收到新线索短信。`}
                    okText="删除"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => remove(c)}
                  >
                    <Button type="link" size="small" danger icon={<Trash2 size={14} />} aria-label={`删除 ${c.name}`} />
                  </Popconfirm>
                </div>
              ),
            },
          ]}
        />

        <section>
          <h2 className="mb-2 font-semibold">最近发送记录</h2>
          {data && data.logs.length === 0 ? (
            <p className="text-caption text-label-secondary">暂无发送记录</p>
          ) : (
            <ul className="divide-y divide-separator border-y border-separator">
              {(data?.logs ?? []).map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate">
                      {l.kind === 'test' ? '测试短信' : `新线索${l.leadName ? `：${l.leadName}` : ''}`}
                      <span className="text-label-secondary">
                        {' '}
                        → {l.contactName || '已删除的联系人'} <span className="tabular-nums">{l.phone}</span>
                      </span>
                    </p>
                    <p className="text-caption tabular-nums text-label-secondary">{formatTime(l.createdAt)}</p>
                    {l.error && <p className="text-caption text-label-secondary">{l.error}</p>}
                  </div>
                  <div className="shrink-0">
                    <Badge status={LOG_STATUS[l.status].badge} text={LOG_STATUS[l.status].text} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Modal
        title={editing === 'new' ? '添加联系人' : '编辑联系人'}
        open={!!editing}
        onCancel={() => setEditing(null)}
        onOk={save}
        okText="保存"
        confirmLoading={busy}
        destroyOnHidden
        width={440}
      >
        <Form form={form} layout="vertical" requiredMark={false} preserve={false} initialValues={initialValues} style={{ paddingTop: 8 }}>
          <Form.Item
            name="name"
            label="姓名"
            rules={[
              { required: true, whitespace: true, message: '请输入姓名' },
              { max: 32, message: '不超过 32 字' },
            ]}
          >
            <Input placeholder="如：张伟" autoFocus />
          </Form.Item>
          <Form.Item name="title" label="职务（选填）" rules={[{ max: 32, message: '不超过 32 字' }]}>
            <Input placeholder="如：总经理" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            normalize={(v: string) => normalizePhone(v ?? '')}
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请填写 11 位大陆手机号' },
            ]}
          >
            <Input placeholder="13800000000" inputMode="tel" maxLength={16} className="tabular-nums" />
          </Form.Item>
          <Form.Item name="notifyLeads" label="新线索短信" valuePropName="checked" extra="打开后，该公司的站点每收到一条新线索就发一条短信。">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
};
