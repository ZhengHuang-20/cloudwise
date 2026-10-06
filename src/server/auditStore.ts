/**
 * 测评任务的存储。Vercel 上创建任务（POST）与轮询进度（GET）可能落在不同的函数实例，
 * 所以配置了数据库时任务状态全部写在 audits 表；未配置数据库（本地开发）时退化为进程内存储。
 */
import { db, exec, query, queryOne } from './db';
import type { AuditReport, ProbeLogEntry } from './audit';

export interface AuditJob {
  id: string;
  key: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  step: number;
  done: number;
  total: number;
  engines: string[];
  log: ProbeLogEntry[];
  error: string;
  report: AuditReport | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 同一目标 7 天内复用 live 结果 */
export const AUDIT_CACHE_TTL_MS = 7 * 24 * 3600 * 1000;
/** 超过这么久没有进度更新的任务视为已中断（函数超时或实例被回收） */
export const AUDIT_STALE_MS = 6 * 60 * 1000;
const STALE_ERROR = '测评超时，请重新测评';
const MEM_TTL_MS = 24 * 3600 * 1000;

export interface AuditStore {
  /** 7 天内平台组合相同的 live 结果 */
  findCached(key: string, engineSet: string): Promise<string | null>;
  /** 创建任务；同一目标已有进行中的任务时返回该任务的 id（created=false） */
  create(id: string, key: string): Promise<{ id: string; created: boolean }>;
  get(id: string): Promise<AuditJob | null>;
  setStep(id: string, step: number, extra?: { engines?: string[]; total?: number }): Promise<void>;
  addLog(id: string, entry: ProbeLogEntry): Promise<void>;
  finish(id: string, report: AuditReport): Promise<void>;
  fail(id: string, message: string): Promise<void>;
}

/** 已中断的任务在读取时按失败展示 */
export function withStale(job: AuditJob): AuditJob {
  if ((job.status === 'queued' || job.status === 'running') && Date.now() - job.updatedAt.getTime() > AUDIT_STALE_MS) {
    return { ...job, status: 'failed', error: STALE_ERROR };
  }
  return job;
}

// ---------- 内存实现 ----------

class MemoryStore implements AuditStore {
  private jobs = new Map<string, AuditJob>();

  private prune() {
    const now = Date.now();
    for (const [id, j] of this.jobs) {
      if ((j.status === 'done' || j.status === 'failed') && now - j.createdAt.getTime() > MEM_TTL_MS) this.jobs.delete(id);
    }
  }

  private touch(id: string, f: (j: AuditJob) => void) {
    const j = this.jobs.get(id);
    if (!j) return;
    f(j);
    j.updatedAt = new Date();
  }

  async findCached(key: string, engineSet: string) {
    this.prune();
    for (const j of this.jobs.values()) {
      if (
        j.key === key &&
        j.status === 'done' &&
        j.report?.mode === 'live' &&
        j.report.engineSet === engineSet &&
        Date.now() - j.createdAt.getTime() < AUDIT_CACHE_TTL_MS
      ) {
        return j.id;
      }
    }
    return null;
  }

  async create(id: string, key: string) {
    for (const j of this.jobs.values()) {
      const cur = withStale(j);
      if (cur.key === key && (cur.status === 'queued' || cur.status === 'running')) return { id: cur.id, created: false };
    }
    const now = new Date();
    this.jobs.set(id, {
      id,
      key,
      status: 'queued',
      step: 0,
      done: 0,
      total: 0,
      engines: [],
      log: [],
      error: '',
      report: null,
      createdAt: now,
      updatedAt: now,
    });
    return { id, created: true };
  }

  async get(id: string) {
    const j = this.jobs.get(id);
    return j ? { ...j, log: [...j.log] } : null;
  }

  async setStep(id: string, step: number, extra: { engines?: string[]; total?: number } = {}) {
    this.touch(id, (j) => {
      j.status = 'running';
      j.step = step;
      if (extra.engines) j.engines = extra.engines;
      if (extra.total !== undefined) {
        j.total = extra.total;
        j.done = 0;
      }
    });
  }

  async addLog(id: string, entry: ProbeLogEntry) {
    this.touch(id, (j) => {
      j.done++;
      j.log.push(entry);
    });
  }

  async finish(id: string, report: AuditReport) {
    this.touch(id, (j) => {
      j.status = 'done';
      j.step = 5;
      j.report = report;
    });
  }

  async fail(id: string, message: string) {
    this.touch(id, (j) => {
      j.status = 'failed';
      j.error = message;
    });
  }
}

// ---------- 数据库实现 ----------

function rowToJob(r: any): AuditJob {
  return {
    id: r.id,
    key: r.target_key,
    status: r.status,
    step: r.step,
    done: r.done,
    total: r.total,
    engines: r.engines ?? [],
    log: r.log ?? [],
    error: r.error ?? '',
    report: r.report ?? null,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

class DbStore implements AuditStore {
  async findCached(key: string, engineSet: string) {
    // 只复用真实探测（live）且探测平台相同的结果，示例与失败结果不缓存。
    const row = await queryOne(
      `SELECT id FROM audits
       WHERE target_key = $1 AND status = 'done' AND mode = 'live' AND engine_set = $2 AND created_at > $3
       ORDER BY created_at DESC LIMIT 1`,
      [key, engineSet, new Date(Date.now() - AUDIT_CACHE_TTL_MS)],
    );
    return row?.id ?? null;
  }

  async create(id: string, key: string): Promise<{ id: string; created: boolean }> {
    // 先把已中断的任务标为失败，免得它挡住新的测评
    await exec(
      `UPDATE audits SET status = 'failed', error = $2, updated_at = now()
       WHERE target_key = $1 AND status IN ('queued', 'running') AND updated_at < $3`,
      [key, STALE_ERROR, new Date(Date.now() - AUDIT_STALE_MS)],
    );
    const inserted = await query(
      `INSERT INTO audits (id, target_key) VALUES ($1, $2)
       ON CONFLICT (target_key) WHERE status IN ('queued', 'running') DO NOTHING RETURNING id`,
      [id, key],
    );
    if (inserted.length > 0) return { id, created: true };
    const running = await queryOne(`SELECT id FROM audits WHERE target_key = $1 AND status IN ('queued', 'running')`, [key]);
    if (running) return { id: running.id as string, created: false };
    // 极少见：刚好结束，重试一次
    return this.create(id, key);
  }

  async get(id: string) {
    const row = await queryOne(`SELECT * FROM audits WHERE id = $1`, [id]);
    return row ? rowToJob(row) : null;
  }

  async setStep(id: string, step: number, extra: { engines?: string[]; total?: number } = {}) {
    await exec(
      `UPDATE audits SET status = 'running', step = $2,
         engines = COALESCE($3::jsonb, engines),
         total = COALESCE($4, total),
         done = CASE WHEN $4::int IS NULL THEN done ELSE 0 END,
         updated_at = now()
       WHERE id = $1`,
      [id, step, extra.engines ? JSON.stringify(extra.engines) : null, extra.total ?? null],
    );
  }

  async addLog(id: string, entry: ProbeLogEntry) {
    await exec(`UPDATE audits SET done = done + 1, log = log || $2::jsonb, updated_at = now() WHERE id = $1`, [
      id,
      JSON.stringify([entry]),
    ]);
  }

  async finish(id: string, report: AuditReport) {
    await exec(
      `UPDATE audits SET status = 'done', step = 5, mode = $2, engine_set = $3, total_score = $4, report = $5::jsonb, updated_at = now()
       WHERE id = $1`,
      [id, report.mode, report.engineSet, report.totalScore, JSON.stringify(report)],
    );
  }

  async fail(id: string, message: string) {
    await exec(`UPDATE audits SET status = 'failed', error = $2, updated_at = now() WHERE id = $1`, [id, message]);
  }
}

let memory: MemoryStore | null = null;
let database: DbStore | null = null;

export function auditStore(): AuditStore {
  if (db()) return (database ??= new DbStore());
  return (memory ??= new MemoryStore());
}
