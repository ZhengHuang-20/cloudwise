import React, { useCallback, useEffect, useState } from 'react';
import { api, formatTime } from '../../lib/api';
import { Lead, LEAD_STATUS } from './types';

const STATUSES = Object.keys(LEAD_STATUS) as Lead['status'][];

const LeadCard: React.FC<{ siteId: number; lead: Lead; onChange: (l: Lead) => void }> = ({ siteId, lead, onChange }) => {
  const [note, setNote] = useState(lead.note);
  const [error, setError] = useState('');

  const patch = async (body: { status?: string; note?: string }) => {
    setError('');
    try {
      await api(`/api/sites/${siteId}/leads/${lead.id}`, { method: 'PATCH', body });
      onChange({ ...lead, ...(body as Partial<Lead>) });
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <li className="tile">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-title-3">{lead.name || '未留姓名'}{lead.company && <span className="text-label-secondary"> · {lead.company}</span>}</p>
          <p className="mt-1 text-body tabular-nums">
            {lead.phone && <a className="link" href={`tel:${lead.phone}`}>{lead.phone}</a>}
            {lead.phone && lead.email && <span className="text-label-secondary"> · </span>}
            {lead.email && <a className="link" href={`mailto:${lead.email}`}>{lead.email}</a>}
          </p>
        </div>
        <div className="text-right">
          <p className="text-caption tabular-nums text-label-secondary">{formatTime(lead.createdAt)}</p>
          <label className="sr-only" htmlFor={`st-${lead.id}`}>线索状态</label>
          <select id={`st-${lead.id}`} className="field mt-2 min-h-10 w-auto py-1.5 text-body" value={lead.status}
            onChange={(e) => patch({ status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS[s]}</option>)}
          </select>
        </div>
      </div>
      {lead.message && <p className="mt-3 whitespace-pre-wrap break-words text-body">{lead.message}</p>}
      {lead.sourcePage && <p className="mt-2 truncate text-caption text-label-secondary">来自页面：{lead.sourcePage}</p>}
      <div className="mt-3">
        <label className="sr-only" htmlFor={`nt-${lead.id}`}>跟进备注</label>
        <input id={`nt-${lead.id}`} className="field min-h-10 py-1.5" placeholder="跟进备注（失焦自动保存）" maxLength={1000}
          value={note} onChange={(e) => setNote(e.target.value)}
          onBlur={() => note !== lead.note && patch({ note })} />
      </div>
      {error && <p role="alert" className="mt-2 text-caption text-danger">{error}</p>}
    </li>
  );
};

export const LeadsPanel: React.FC<{ siteId: number }> = ({ siteId }) => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ leads: Lead[]; total: number; pageSize: number } | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    api(`/api/sites/${siteId}/leads?page=${page}${status ? `&status=${status}` : ''}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [siteId, page, status]);
  useEffect(load, [load]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const filter = (s: string) => {
    setStatus(s);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={status === ''} onClick={() => filter('')}>全部</button>
          {STATUSES.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={status === s} onClick={() => filter(s)}>{LEAD_STATUS[s]}</button>
          ))}
        </div>
        <a className="btn btn-secondary btn-sm" href={`/api/sites/${siteId}/leads.csv`}>导出 CSV</a>
      </div>

      {error && <p role="alert" className="text-center text-caption text-danger">{error}</p>}
      {!data ? (
        !error && <p className="text-center text-body text-label-secondary">加载中…</p>
      ) : data.leads.length === 0 ? (
        <div className="well text-center">
          <p className="text-body">暂无线索。</p>
          <p className="mt-2 text-caption text-label-secondary">访客在您网站的表单里留下联系方式后，会实时出现在这里。接入方式见「接入」页。</p>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {data.leads.map((l) => (
              <LeadCard key={l.id} siteId={siteId} lead={l}
                onChange={(n) => setData((d) => d && { ...d, leads: d.leads.map((x) => (x.id === n.id ? n : x)) })} />
            ))}
          </ul>
          <div className="flex items-center justify-center gap-4">
            <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
            <span className="text-caption tabular-nums text-label-secondary">第 {page} / {pages} 页，共 {data.total} 条</span>
            <button type="button" className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button>
          </div>
        </>
      )}
    </div>
  );
};
