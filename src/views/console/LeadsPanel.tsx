import React, { useCallback, useEffect, useState } from 'react';
import {
  App as AntApp,
  Badge,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Pagination,
  Segmented,
  Select,
  Table,
  Tooltip,
  Typography,
  type TableColumnsType,
} from 'antd';
import { Download } from 'lucide-react';
import { api, formatTime } from '../../lib/api';
import { CHANNEL_LABEL, countryName, prettyPath } from './labels';
import { PageTitle } from './parts';
import { LEAD_BADGE, LEAD_STATUS, LEAD_STATUSES, type Lead, type Site } from './types';

interface Page {
  leads: Lead[];
  total: number;
  pageSize: number;
}

const statusOptions = LEAD_STATUSES.map((s) => ({ value: s, label: <Badge status={LEAD_BADGE[s]} text={LEAD_STATUS[s]} /> }));

const StatusSelect: React.FC<{ value: Lead['status']; onChange: (s: Lead['status']) => void; borderless?: boolean }> = ({
  value,
  onChange,
  borderless,
}) => (
  <Select
    aria-label="线索状态"
    size={borderless ? 'small' : 'middle'}
    variant={borderless ? 'borderless' : 'outlined'}
    value={value}
    onChange={onChange}
    options={statusOptions}
    popupMatchSelectWidth={false}
    style={{ minWidth: 112 }}
    onClick={(e) => e.stopPropagation()}
  />
);

const Contact: React.FC<{ lead: Lead }> = ({ lead }) => (
  <div className="tabular-nums">
    {!lead.phone && !lead.email && <span className="text-label-tertiary">—</span>}
    {lead.phone && (
      <a className="link block" href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()}>
        {lead.phone}
      </a>
    )}
    {lead.email && (
      <a className="link block break-all" href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()}>
        {lead.email}
      </a>
    )}
  </div>
);

/** 线索来源：渠道（来源名）；升级前的线索没有来源信息 */
const sourceText = (l: Lead) =>
  l.channel ? [CHANNEL_LABEL[l.channel] ?? l.channel, l.source && l.source !== CHANNEL_LABEL[l.channel] ? l.source : ''].filter(Boolean).join(' · ') : '';

/** 线索详情：完整信息、状态与跟进备注。 */
const LeadDrawer: React.FC<{
  lead: Lead | null;
  onClose: () => void;
  onPatch: (lead: Lead, body: Partial<Pick<Lead, 'status' | 'note'>>) => Promise<boolean>;
}> = ({ lead, onClose, onPatch }) => {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => setNote(lead?.note ?? ''), [lead?.id, lead?.note]);

  return (
    <Drawer
      open={!!lead}
      onClose={onClose}
      size={Math.min(520, window.innerWidth)}
      title={lead ? lead.name || '未留姓名' : ''}
      extra={lead && <StatusSelect value={lead.status} onChange={(status) => onPatch(lead, { status })} />}
    >
      {lead && (
        <div className="flex flex-col gap-8">
          <Descriptions
            column={1}
            size="small"
            colon={false}
            styles={{ label: { width: 80 } }}
            items={[
              { key: 'company', label: '公司', children: lead.company || '—' },
              {
                key: 'phone',
                label: '手机',
                children: lead.phone ? (
                  <Typography.Text copyable={{ text: lead.phone }} className="tabular-nums">
                    <a className="link" href={`tel:${lead.phone}`}>{lead.phone}</a>
                  </Typography.Text>
                ) : '—',
              },
              {
                key: 'email',
                label: '邮箱',
                children: lead.email ? (
                  <Typography.Text copyable={{ text: lead.email }} className="break-all">
                    <a className="link" href={`mailto:${lead.email}`}>{lead.email}</a>
                  </Typography.Text>
                ) : '—',
              },
              { key: 'time', label: '提交时间', children: <span className="tabular-nums">{formatTime(lead.createdAt)}</span> },
              {
                key: 'source',
                label: '来源页面',
                children: lead.sourcePage ? (
                  <a className="link break-all" href={lead.sourcePage} target="_blank" rel="noreferrer noopener">
                    {lead.sourcePage}
                  </a>
                ) : '—',
              },
              { key: 'channel', label: '来源', children: sourceText(lead) || '—' },
              ...(lead.utmCampaign ? [{ key: 'utm', label: '推广活动', children: lead.utmCampaign }] : []),
              { key: 'landing', label: '落地页', children: lead.landingPath ? <span className="break-all">{prettyPath(lead.landingPath)}</span> : '—' },
              { key: 'country', label: '国家/地区', children: lead.country ? countryName(lead.country) : '—' },
            ]}
          />

          <section>
            <h3 className="mb-2 text-caption text-label-secondary">留言</h3>
            <p className="whitespace-pre-wrap break-words rounded-[10px] bg-surface-raised px-4 py-3">{lead.message || '（未填写）'}</p>
          </section>

          <section>
            <h3 className="mb-2 text-caption text-label-secondary">跟进备注</h3>
            <Input.TextArea
              aria-label="跟进备注"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              showCount
              autoSize={{ minRows: 4, maxRows: 10 }}
              placeholder="记录沟通情况、下一步计划等，仅团队内可见"
            />
            <div className="mt-6 flex justify-end">
              <Button
                type="primary"
                loading={saving}
                disabled={note === lead.note}
                onClick={async () => {
                  setSaving(true);
                  await onPatch(lead, { note });
                  setSaving(false);
                }}
              >
                保存备注
              </Button>
            </div>
          </section>
        </div>
      )}
    </Drawer>
  );
};

export const LeadsPanel: React.FC<{ site: Site }> = ({ site }) => {
  const { message } = AntApp.useApp();
  const [status, setStatus] = useState<'' | Lead['status']>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    api<Page>(`/api/sites/${site.id}/leads?${params}`)
      .then(setData)
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [site.id, page, status, q, message]);
  useEffect(load, [load]);

  const patch = async (lead: Lead, body: Partial<Pick<Lead, 'status' | 'note'>>) => {
    try {
      await api(`/api/sites/${site.id}/leads/${lead.id}`, { method: 'PATCH', body });
      setData((d) => d && { ...d, leads: d.leads.map((x) => (x.id === lead.id ? { ...x, ...body } : x)) });
      message.success(body.status ? `已标记为「${LEAD_STATUS[body.status]}」` : '备注已保存');
      return true;
    } catch (e: any) {
      message.error(e.message);
      return false;
    }
  };

  const columns: TableColumnsType<Lead> = [
    {
      title: '提交时间 / 来源',
      dataIndex: 'createdAt',
      width: 200,
      render: (v: string, l) => {
        const src = [sourceText(l), l.country && countryName(l.country)].filter(Boolean).join(' · ');
        return (
          <div className="min-w-0">
            <p className="tabular-nums text-label-secondary">{formatTime(v)}</p>
            {src && <p className="truncate text-caption text-label-tertiary" title={src}>{src}</p>}
          </div>
        );
      },
    },
    {
      title: '联系人',
      key: 'name',
      width: 200,
      render: (_, l) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{l.name || '未留姓名'}</p>
          {l.company && <p className="truncate text-caption text-label-secondary">{l.company}</p>}
        </div>
      ),
    },
    { title: '联系方式', key: 'contact', width: 220, render: (_, l) => <Contact lead={l} /> },

    {
      title: '留言',
      dataIndex: 'message',
      ellipsis: { showTitle: false },
      render: (v: string) =>
        v ? (
          <Tooltip title={v} placement="topLeft" styles={{ root: { maxWidth: 420 } }}>
            <span>{v}</span>
          </Tooltip>
        ) : (
          <span className="text-label-tertiary">—</span>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
      render: (_, l) => <StatusSelect borderless value={l.status} onChange={(s) => patch(l, { status: s })} />,
    },
    {
      title: '跟进备注',
      dataIndex: 'note',
      width: 200,
      ellipsis: true,
      render: (v: string) => (v ? <span className="text-label-secondary">{v}</span> : <span className="text-label-tertiary">—</span>),
    },
  ];

  const search = (value: string) => {
    setQ(value.trim());
    setPage(1);
  };
  const open = data?.leads.find((l) => l.id === openId) ?? null;
  const filtered = !!status || !!q;

  return (
    <>
      <PageTitle
        title="线索管理"
        description={`${site.name} · 访客在您网站表单里留下的联系方式`}
        extra={
          <Button icon={<Download size={16} />} href={`/api/sites/${site.id}/leads.csv`}>
            导出 CSV
          </Button>
        }
      />

      <Card variant="borderless" styles={{ body: { padding: 0 } }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-separator p-4">
          <div className="no-scrollbar -mx-1 max-w-full overflow-x-auto px-1">
            <Segmented
              aria-label="按状态筛选"
              value={status}
              onChange={(v) => {
                setStatus(v as '' | Lead['status']);
                setPage(1);
              }}
              options={[{ value: '', label: '全部' }, ...LEAD_STATUSES.map((s) => ({ value: s, label: LEAD_STATUS[s] }))]}
            />
          </div>
          <div className="w-full sm:w-80">
            <Input.Search
              aria-label="搜索线索"
              allowClear
              placeholder="搜索姓名、手机、邮箱、公司或留言"
              onSearch={search}
            />
          </div>
        </div>

        {/* 大屏：表格 */}
        <div className="hidden md:block">
          <Table<Lead>
            rowKey="id"
            columns={columns}
            dataSource={data?.leads ?? []}
            loading={loading}
            tableLayout="fixed"
            onRow={(l) => ({ onClick: () => setOpenId(l.id), className: 'cursor-pointer' })}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={filtered ? '没有符合条件的线索' : '暂无线索。访客提交表单后会实时出现在这里。'}
                  style={{ paddingBlock: 32 }}
                />
              ),
            }}
            pagination={false}
          />
        </div>

        {/* 小屏：卡片列表 */}
        <ul className="divide-y divide-separator md:hidden">
          {data?.leads.length === 0 && (
            <li style={{ paddingBlock: 40 }}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={filtered ? '没有符合条件的线索' : '暂无线索'} />
            </li>
          )}
          {data?.leads.map((l) => (
            <li key={l.id}>
              <button type="button" className="w-full p-4 text-left" onClick={() => setOpenId(l.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {l.name || '未留姓名'}
                      {l.company && <span className="font-normal text-label-secondary"> · {l.company}</span>}
                    </p>
                    <p className="mt-0.5 truncate text-caption text-label-secondary tabular-nums">
                      {[l.phone, l.email].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Badge status={LEAD_BADGE[l.status]} text={LEAD_STATUS[l.status]} className="shrink-0" />
                </div>
                {l.message && <p className="mt-2 line-clamp-2 text-caption text-label-secondary">{l.message}</p>}
                <p className="mt-2 text-caption text-label-tertiary tabular-nums">
                  {[formatTime(l.createdAt), sourceText(l), l.country && countryName(l.country)].filter(Boolean).join(' · ')}
                </p>
              </button>
            </li>
          ))}
        </ul>

        {data && data.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-separator px-4 py-3">
            <span className="text-caption text-label-secondary tabular-nums">共 {data.total.toLocaleString()} 条</span>
            <Pagination
              current={page}
              pageSize={data.pageSize}
              total={data.total}
              onChange={setPage}
              showSizeChanger={false}
              hideOnSinglePage
              size="small"
            />
          </div>
        )}
      </Card>

      <LeadDrawer lead={open} onClose={() => setOpenId(null)} onPatch={patch} />
    </>
  );
};
