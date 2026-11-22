/**
 * 原创数据报告的素材：把 audits 表里的真实测评（mode = live）做匿名聚合，输出 Markdown。
 *
 *   bun run audit-stats                          # 最近 90 天，打印到终端
 *   bun run audit-stats --since 2026-07-01 --until 2026-10-01 --min 8 --out report.md
 *
 * 口径：
 * - 每个目标（域名或品牌名）只取统计区间内最后一次完成的真实测评，避免反复测的企业权重过大。
 * - 排除官网自己（chingeo.com）、MONITOR_TARGETS 里的自测目标与 --exclude 指定的目标。
 * - 不输出任何企业名称、域名或 AI 回答原文；分组（行业、有无某项配置）样本少于 --min 时不输出该组。
 * - 样本是主动来做测评的企业，不是随机抽样，报告里要写明这一点（输出的「口径与局限」一节已经写好）。
 *
 * 读取 DATABASE_URL（与迁移脚本一样从 .env.local 读取），只读查询，不写库。
 */
import { writeFileSync } from 'node:fs';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());

// ---------- 参数 ----------

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const DAY = 86_400_000;
const until = arg('until') ? new Date(`${arg('until')}T00:00:00Z`) : new Date();
const since = arg('since') ? new Date(`${arg('since')}T00:00:00Z`) : new Date(until.getTime() - 90 * DAY);
const MIN_GROUP = Math.max(3, Number(arg('min') ?? 5));
const outFile = arg('out');

// ---------- 报告里用到的字段（与 src/server/audit.ts 的 AuditReport 对应，只列聚合需要的） ----------

export interface StatReport {
  domain: string;
  entity: { industry: string };
  metrics: { mentionRate: number; citationRate: number; brandKnowledge: number; avgPosition: number };
  totalScore: number;
  engines: { name: string; answers: number; mentionRate: number; citationRate: number; brandKnowledge: number }[];
  site: {
    reachable: boolean;
    english: boolean;
    hreflangs: number;
    textChars: number;
    schemaTypes: string[];
    hasRobots: boolean;
    crawlers: { agent: string; allowed: boolean }[];
    hasSitemap: boolean;
    hasLlmsTxt: boolean;
    ttfbMs: number;
  } | null;
}

// ---------- 统计工具 ----------

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : '—');
const r1 = (x: number) => (Math.round(x * 10) / 10).toString();

/** 不执行 JS 时拿到的正文少于这个字数，视为「AI 爬虫基本读不到正文」 */
const THIN_TEXT = 300;

/** 行业名统一写法：去空白、全角括号与常见后缀，便于把「医疗器械」「医疗器械行业」归到一组 */
const normIndustry = (s: string) =>
  (s || '未识别')
    .replace(/\s+/g, '')
    .replace(/[（(].*?[)）]/g, '')
    .replace(/(行业|产业|制造业|领域)$/u, '') || '未识别';

// ---------- 聚合 ----------

export function summarize(reports: StatReport[], minGroup: number): string[] {
  const n = reports.length;
  const out: string[] = [];
  const push = (...lines: string[]) => out.push(...lines);

  if (n < minGroup) {
    push(`样本只有 ${n} 个，少于最小样本数 ${minGroup}，不输出统计。`);
    return out;
  }

  const mention = reports.map((r) => r.metrics.mentionRate);
  const citation = reports.map((r) => r.metrics.citationRate);
  const knowledge = reports.map((r) => r.metrics.brandKnowledge);
  const neverMentioned = reports.filter((r) => r.metrics.mentionRate === 0).length;

  push(
    '## 核心结论（AI 部分）',
    '',
    '| 指标 | 平均 | 中位数 |',
    '|---|---|---|',
    `| 提及率：不带品牌名的采购问题中，回答提到该品牌的比例 | ${r1(mean(mention))}% | ${r1(median(mention))}% |`,
    `| 官网引用率：回答引用该企业官网的比例 | ${r1(mean(citation))}% | ${r1(median(citation))}% |`,
    `| 品牌认知：直接问到品牌时，AI 能正确介绍的比例 | ${r1(mean(knowledge))}% | ${r1(median(knowledge))}% |`,
    '',
    `- ${pct(neverMentioned, n)} 的企业（${neverMentioned} / ${n}）在所有不带品牌名的采购问题里一次都没有被 AI 提到。`,
    '',
  );

  // 分平台
  const engineNames = [...new Set(reports.flatMap((r) => r.engines.filter((e) => e.answers > 0).map((e) => e.name)))];
  if (engineNames.length) {
    push('## 分平台', '', '| 平台 | 样本 | 平均提及率 | 平均官网引用率 | 平均品牌认知 |', '|---|---|---|---|---|');
    for (const name of engineNames) {
      const rows = reports.flatMap((r) => r.engines.filter((e) => e.name === name && e.answers > 0));
      if (rows.length < minGroup) continue;
      push(
        `| ${name} | ${rows.length} | ${r1(mean(rows.map((e) => e.mentionRate)))}% | ${r1(mean(rows.map((e) => e.citationRate)))}% | ${r1(mean(rows.map((e) => e.brandKnowledge)))}% |`,
      );
    }
    push('');
  }

  // 官网技术检查
  const sites = reports.filter((r) => r.site?.reachable);
  const has = (f: (s: NonNullable<StatReport['site']>) => boolean) => sites.filter((r) => f(r.site!)).length;
  if (sites.length >= minGroup) {
    const blocksAI = (s: NonNullable<StatReport['site']>) => s.crawlers.some((c) => !c.allowed);
    push(
      '## 官网能不能被 AI 读到',
      '',
      `有可访问官网的样本：${sites.length} 个。`,
      '',
      '| 检查项 | 比例 |',
      '|---|---|',
      `| robots.txt 屏蔽了至少一个 AI 爬虫 | ${pct(has(blocksAI), sites.length)} |`,
      `| 不执行 JS 时首页正文少于 ${THIN_TEXT} 字（AI 爬虫基本读不到） | ${pct(has((s) => s.textChars < THIN_TEXT), sites.length)} |`,
      `| 有 JSON-LD 结构化数据 | ${pct(has((s) => s.schemaTypes.length > 0), sites.length)} |`,
      `| 有 sitemap | ${pct(has((s) => s.hasSitemap), sites.length)} |`,
      `| 有 llms.txt | ${pct(has((s) => s.hasLlmsTxt), sites.length)} |`,
      `| 首页是英文 | ${pct(has((s) => s.english), sites.length)} |`,
      `| 声明了多语言版本（hreflang） | ${pct(has((s) => s.hreflangs > 0), sites.length)} |`,
      '',
      `- 首字节耗时中位数：${Math.round(median(sites.map((r) => r.site!.ttfbMs)))} ms（从测评服务器访问，仅供参考）。`,
      '',
    );

    // 有无某项配置时的提及率对比（两组都达到样本门槛才输出）
    const compare: [string, (s: NonNullable<StatReport['site']>) => boolean][] = [
      ['有 JSON-LD', (s) => s.schemaTypes.length > 0],
      ['首页是英文', (s) => s.english],
      [`不执行 JS 也有 ${THIN_TEXT} 字以上正文`, (s) => s.textChars >= THIN_TEXT],
      ['有 llms.txt', (s) => s.hasLlmsTxt],
      ['没有屏蔽 AI 爬虫', (s) => !blocksAI(s)],
    ];
    const rows: string[] = [];
    for (const [label, f] of compare) {
      const yes = sites.filter((r) => f(r.site!));
      const no = sites.filter((r) => !f(r.site!));
      if (yes.length < minGroup || no.length < minGroup) continue;
      rows.push(
        `| ${label} | ${yes.length} / ${no.length} | ${r1(mean(yes.map((r) => r.metrics.mentionRate)))}% / ${r1(mean(no.map((r) => r.metrics.mentionRate)))}% | ${r1(mean(yes.map((r) => r.metrics.citationRate)))}% / ${r1(mean(no.map((r) => r.metrics.citationRate)))}% |`,
      );
    }
    if (rows.length) {
      push(
        '## 官网配置与 AI 表现（是 / 否）',
        '',
        '| 配置 | 样本数 | 平均提及率 | 平均官网引用率 |',
        '|---|---|---|---|',
        ...rows,
        '',
        '这是相关性，不是因果：配置更完善的企业往往品牌本身也更知名。写进报告时要保留这句说明。',
        '',
      );
    }
  }

  // 行业
  const byIndustry = new Map<string, StatReport[]>();
  for (const r of reports) {
    const k = normIndustry(r.entity?.industry ?? '');
    byIndustry.set(k, [...(byIndustry.get(k) ?? []), r]);
  }
  const industries = [...byIndustry.entries()].filter(([k, v]) => k !== '未识别' && v.length >= minGroup).sort((a, b) => b[1].length - a[1].length);
  if (industries.length) {
    push('## 分行业', '', '| 行业 | 样本 | 平均提及率 | 平均官网引用率 | 平均总分 |', '|---|---|---|---|---|');
    for (const [k, v] of industries) {
      push(
        `| ${k} | ${v.length} | ${r1(mean(v.map((r) => r.metrics.mentionRate)))}% | ${r1(mean(v.map((r) => r.metrics.citationRate)))}% | ${Math.round(mean(v.map((r) => r.totalScore)))} |`,
      );
    }
    push('', `行业由测评时的文本模型识别，样本少于 ${minGroup} 个的行业没有列出。`, '');
  }
  return out;
}

// ---------- 主流程 ----------

async function main() {
  const { db, query } = await import('../src/server/db');
  const { config } = await import('../src/server/config');
  const { parseAuditInput } = await import('../src/server/auditSite');
  const { SITE_URL } = await import('../src/lib/site');
  if (!db()) {
    console.error('未配置 DATABASE_URL，无法读取测评数据');
    process.exit(1);
  }

  const keyOf = (raw: string) => {
    const input = parseAuditInput(raw);
    if (!input) return '';
    return input.domain ? input.domain.replace(/^www\./, '') : 'brand:' + input.brand.toLowerCase();
  };
  const excluded = new Set(
    [new URL(SITE_URL).host, ...config().monitorTargets, ...(arg('exclude') ?? '').split(',')].map((s) => keyOf(s.trim())).filter(Boolean),
  );

  const rows = await query(
    `SELECT DISTINCT ON (target_key) target_key, report
       FROM audits
      WHERE status = 'done' AND mode = 'live' AND report IS NOT NULL
        AND created_at >= $1 AND created_at < $2
      ORDER BY target_key, created_at DESC`,
    [since, until],
  );
  const reports = rows.filter((r) => !excluded.has(r.target_key)).map((r) => r.report as StatReport);

  const engines = [...new Set(reports.flatMap((r) => r.engines.filter((e) => e.answers > 0).map((e) => e.name)))];
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const lines = [
    `# 中国 B2B 出海企业 AI 可见性统计（${day(since)} 至 ${day(new Date(until.getTime() - 1))}）`,
    '',
    '> 内部素材，由 scripts/audit-stats.ts 生成。发布前人工核对，并保留「口径与局限」一节。',
    '',
    ...summarize(reports, MIN_GROUP),
    '## 口径与局限',
    '',
    `- 样本：统计区间内完成真实测评的 ${reports.length} 个企业（每个企业只取最后一次测评），已排除本站与自测目标。`,
    `- 测评平台：${engines.join('、') || '—'}。每次测评向每个平台提出 6 个不带品牌名的采购问题与 2 个带品牌名的问题，回答由文本模型抽取「是否提及、是否引用官网」后计算。`,
    '- 样本是主动来做 AI 可见性测评的企业，不是随机抽样，更可能是已经在关注海外获客的企业。',
    '- AI 的回答本身有随机性，单次测评的结果会波动；这里看的是群体平均，不代表任何单个企业的长期表现。',
    `- 分组样本少于 ${MIN_GROUP} 个时不输出，不披露任何企业名称、域名或回答原文。`,
    '',
  ];
  const md = lines.join('\n');
  if (outFile) {
    writeFileSync(outFile, md);
    console.log(`已写入 ${outFile}（样本 ${reports.length} 个）`);
  } else {
    console.log(md);
  }
  process.exit(0);
}

if (process.argv[1]?.endsWith('audit-stats.ts')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
