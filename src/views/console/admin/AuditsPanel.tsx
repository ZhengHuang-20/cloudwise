import React, { useCallback, useEffect, useState } from 'react';
import { App as AntApp, Button, Card, Drawer, Dropdown, Empty, Input, Skeleton, Table, Tag } from 'antd';
import { ChevronDown, Download, Eye } from 'lucide-react';
import { api, formatTime } from '../../../lib/api';
import type { AuditJob } from '../../../lib/audit';
import { AuditResult } from '../../home/VisibilityAudit';
import { PageTitle } from '../parts';

interface AuditRow {
  id: string;
  target: string;
  brand: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  mode: 'live' | 'sample' | 'site_only' | null;
  score: number | null;
  level: string;
  error: string;
  contactName: string;
  contactPhone: string;
  createdAt: string;
}

const STATUS: Record<AuditRow['status'], { text: string; color?: string }> = {
  queued: { text: '排队中' },
  running: { text: '进行中', color: 'processing' },
  done: { text: '已完成', color: 'success' },
  failed: { text: '失败', color: 'error' },
};

const PAGE_SIZE = 20;

const ReportDrawer: React.FC<{ id: string | null; onClose: () => void }> = ({ id, onClose }) => {
  const [job, setJob] = useState<AuditJob | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    setJob(null);
    setError('');
    let alive = true;
    api<AuditJob>(`/api/admin/audits/${id}`)
      .then((j) => alive && setJob(j))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);
  return (
    <Drawer open={!!id} onClose={onClose} size={Math.min(1100, window.innerWidth)} title="AI 可见性测评报告">
      {error ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={error} />
      ) : !job ? (
        <Skeleton active />
      ) : job.report ? (
        <AuditResult report={job.report} />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={job.status === 'failed' ? `测评未完成：${job.error || '失败'}` : '测评仍在进行中'} />
      )}
    </Drawer>
  );
};

/** 管理员：全部测评项目，查看并下载每份报告。 */
export const AuditsPanel: React.FC = () => {
  const { message } = AntApp.useApp();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api<{ audits: AuditRow[]; total: number }>(
        `/api/admin/audits?page=${page}&pageSize=${PAGE_SIZE}&q=${encodeURIComponent(keyword)}`,
      );
      setRows(r.audits);
      setTotal(r.total);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, message]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageTitle title="测评报告" description="全部 AI 可见性测评项目。可查看每份报告，并下载为 Markdown 或 JSON。" />
      <Card variant="borderless" styles={{ body: { padding: 0 } }}>
        <div className="border-b border-separator p-4">
          <div className="w-full sm:w-72">
            <Input.Search
              allowClear
              placeholder="搜索域名或品牌"
              onSearch={(v) => {
                setPage(1);
                setKeyword(v);
              }}
            />
          </div>
        </div>
        <Table<AuditRow>
          rowKey="id"
          loading={loading}
          dataSource={rows}
          scroll={{ x: 900 }}
          pagination={{ current: page, pageSize: PAGE_SIZE, total, showSizeChanger: false, hideOnSinglePage: true, onChange: setPage }}
          columns={[
            {
              title: '测评对象',
              render: (_, r) => (
                <div>
                  <div className="font-semibold">{r.brand || r.target}</div>
                  {r.brand && <div className="text-caption text-label-secondary">{r.target}</div>}
                </div>
              ),
            },
            {
              title: '状态',
              width: 100,
              render: (_, r) => <Tag color={STATUS[r.status].color}>{STATUS[r.status].text}</Tag>,
            },
            {
              title: '得分',
              width: 120,
              className: 'tabular-nums',
              render: (_, r) => (r.score == null ? '-' : `${r.score}${r.level ? ` · ${r.level}` : ''}`),
            },
            {
              title: '联系人',
              width: 160,
              render: (_, r) => (r.contactName ? `${r.contactName} ${r.contactPhone}` : '-'),
            },
            {
              title: '测评时间',
              dataIndex: 'createdAt',
              width: 180,
              render: (v: string) => <span className="tabular-nums text-label-secondary">{formatTime(v)}</span>,
            },
            {
              title: '操作',
              width: 200,
              render: (_, r) => (
                <div className="flex gap-2">
                  <Button size="small" icon={<Eye size={14} />} disabled={r.status !== 'done'} onClick={() => setViewId(r.id)}>
                    查看
                  </Button>
                  <Dropdown
                    disabled={r.status !== 'done'}
                    menu={{
                      items: [
                        { key: 'md', label: <a href={`/api/admin/audits/${r.id}/download`}>Markdown</a> },
                        { key: 'json', label: <a href={`/api/admin/audits/${r.id}/download?format=json`}>JSON</a> },
                      ],
                    }}
                  >
                    <Button size="small" icon={<Download size={14} />} disabled={r.status !== 'done'}>
                      下载 <ChevronDown size={12} />
                    </Button>
                  </Dropdown>
                </div>
              ),
            },
          ]}
        />
      </Card>
      <ReportDrawer id={viewId} onClose={() => setViewId(null)} />
    </>
  );
};
