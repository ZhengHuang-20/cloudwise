/**
 * AI 可见性测评报告的 PDF（管理员下载）。内容与后台「查看」里的完整报告一致：
 * 概览与指标、分平台表现、声量占比、官网检查、核心发现与建议、每个问题的 AI 回答与引用来源、提问日志。
 * 用 pdfkit 在服务端生成；中文字体用仓库自带的 Noto Sans SC 子集（assets/og，GB2312 + ASCII + 常用标点）。
 */
import path from 'node:path';
import PDFDocument from 'pdfkit';
import type { AuditReport } from './audit';

const FONT_DIR = path.join(process.cwd(), 'assets', 'og');
const REGULAR = path.join(FONT_DIR, 'NotoSansSC-Regular-subset.ttf');
const BOLD = path.join(FONT_DIR, 'NotoSansSC-SemiBold-subset.ttf');

const INK = '#17211c';
const MUTED = '#5b6a62';
const LINE = '#d9e0dc';
const ACCENT = '#0b7a55';
const WARN = '#b45309';
const DANGER = '#b42318';

/** 字体子集之外的字符（表情符号等）会显示成方框，统一去掉 */
const safe = (s: unknown) =>
  String(s ?? '')
    .replace(/\r/g, '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/[^\u0009\u000a -~ -ÿ‐-⁞　-〿㐀-鿿＀-￯←-↓≤≥·]/g, '');

const pct = (v: number) => `${Math.round(v)}%`;
const time = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  // 北京时间
  const b = new Date(d.getTime() + 8 * 3600_000);
  return `${b.toISOString().slice(0, 16).replace('T', ' ')}（北京时间）`;
};
const MODE: Record<string, string> = { live: '真实探测', sample: '示例（未配置模型，AI 部分为示例）', site_only: '仅官网检查（AI 提问全部失败）' };
const SENTIMENT: Record<string, string> = { positive: '正面', neutral: '中性', negative: '负面' };

export function auditPdfName(report: AuditReport, id: string): string {
  const base = (report.domain || report.entity?.brand || report.target || 'report').replace(/[^\w.-]+/g, '_').slice(0, 60);
  return `ai-visibility-audit-${base}-${id.slice(0, 8)}.pdf`;
}

export function renderAuditPdf(r: AuditReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true, info: { Title: `AI 可见性测评报告：${safe(r.entity?.brand || r.target || r.domain)}`, Author: '云端智荐 ChinGEO' } });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.registerFont('R', REGULAR);
    doc.registerFont('B', BOLD);

    const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;
    const bottom = () => doc.page.height - doc.page.margins.bottom;
    const need = (h: number) => {
      if (doc.y + h > bottom()) doc.addPage();
    };

    const h1 = (s: string) => {
      need(60);
      doc.moveDown(0.8).font('B').fontSize(14).fillColor(INK).text(safe(s), left, doc.y, { width: W });
      doc.moveTo(left, doc.y + 3).lineTo(left + W, doc.y + 3).strokeColor(LINE).lineWidth(0.8).stroke();
      doc.moveDown(0.6);
    };
    const para = (s: string, o: { color?: string; size?: number; bold?: boolean; indent?: number } = {}) => {
      doc.font(o.bold ? 'B' : 'R').fontSize(o.size ?? 10).fillColor(o.color ?? INK);
      doc.text(safe(s), left + (o.indent ?? 0), doc.y, { width: W - (o.indent ?? 0), lineGap: 2.5 });
    };
    const kv = (k: string, v: string) => {
      need(18);
      const y = doc.y;
      doc.font('R').fontSize(10).fillColor(MUTED).text(safe(k), left, y, { width: 96 });
      doc.font('R').fontSize(10).fillColor(INK).text(safe(v), left + 100, y, { width: W - 100, lineGap: 2 });
      doc.moveDown(0.25);
    };
    /** 简单表格：列宽为比例，表头加粗，行内自动换行并避免跨页断行 */
    const table = (head: string[], rows: string[][], ratios: number[]) => {
      const total = ratios.reduce((a, b) => a + b, 0);
      const cw = ratios.map((x) => (x / total) * W);
      const draw = (cells: string[], bold: boolean) => {
        doc.font(bold ? 'B' : 'R').fontSize(9);
        const hs = cells.map((c, i) => doc.heightOfString(safe(c), { width: cw[i] - 8, lineGap: 1.5 }));
        const h = Math.max(...hs) + 8;
        need(h + 2);
        const y = doc.y;
        let x = left;
        cells.forEach((c, i) => {
          doc.font(bold ? 'B' : 'R').fontSize(9).fillColor(bold ? MUTED : INK).text(safe(c), x + 4, y + 4, { width: cw[i] - 8, lineGap: 1.5 });
          x += cw[i];
        });
        doc.moveTo(left, y + h).lineTo(left + W, y + h).strokeColor(LINE).lineWidth(0.5).stroke();
        doc.y = y + h;
      };
      draw(head, true);
      rows.forEach((row) => draw(row, false));
      doc.moveDown(0.4);
    };

    // ---- 封面信息 ----
    doc.font('B').fontSize(9).fillColor(ACCENT).text('云端智荐 ChinGEO · AI 可见性测评', left, doc.y, { width: W });
    doc.moveDown(0.3).font('B').fontSize(22).fillColor(INK).text(safe(`AI 可见性测评报告：${r.entity?.brand || r.target || r.domain}`), left, doc.y, { width: W, lineGap: 3 });
    doc.moveDown(0.5);
    kv('测评对象', r.target || r.domain || '-');
    kv('官网', r.domain ? `${r.domain}${r.domainSource === 'resolved' ? '（由品牌名联网查找）' : ''}` : '未找到官网');
    kv('测评时间', time(r.createdAt));
    kv('测评方式', MODE[r.mode] ?? r.mode);
    kv('探测平台', r.engine || '-');
    kv('提问规模', `${r.questions} 个买家问题，每题 ${r.samples} 次，共 ${r.answers} 条回答`);
    const e = r.entity;
    if (e) {
      kv('识别到的品牌', [e.brand, e.aliases?.length ? `别名：${e.aliases.join('、')}` : ''].filter(Boolean).join('；'));
      kv('行业与产品', [e.industry, e.products?.length ? e.products.join('、') : ''].filter(Boolean).join(' · ') || '-');
      kv('目标市场', e.market || '-');
    }

    // ---- 综合得分与指标 ----
    h1('综合得分与核心指标');
    need(60);
    const sy = doc.y;
    doc.font('B').fontSize(30).fillColor(ACCENT).text(`${r.totalScore}`, left, sy, { lineBreak: false });
    const sw = doc.widthOfString(`${r.totalScore}`);
    doc.font('R').fontSize(11).fillColor(MUTED).text(`/ 100　${safe(r.level)}`, left + sw + 8, sy + 18, { lineBreak: false });
    doc.y = sy + 42;
    const m = r.metrics;
    table(
      ['指标', '结果', '说明'],
      [
        ['AI 推荐时提到你（提及率）', pct(m.mentionRate), m.avgPosition > 0 ? `不带品牌名的问题；平均排第 ${m.avgPosition} 位` : '不带品牌名的问题'],
        ['官网被引用（引用率）', pct(m.citationRate), '回答列出的来源里包含官网'],
        ['品牌认知', pct(m.brandKnowledge), '直接问品牌时，AI 是否了解'],
        ['AI 可读取性', `${Math.round(m.readability)} / 100`, r.site ? '官网检查' : '本次未检查官网'],
      ],
      [4, 2, 5],
    );
    if (r.mode === 'sample') para('说明：本次未配置文本模型，AI 部分为示例数据，仅官网检查是真实的。', { color: WARN });

    // ---- 分平台 ----
    if (r.engines?.length) {
      h1('各平台表现');
      table(
        ['平台', '回答数', '失败', '提及率', '引用率', '品牌认知', '平均排位'],
        r.engines.map((x) => [x.name, String(x.answers), String(x.failed), pct(x.mentionRate), pct(x.citationRate), pct(x.brandKnowledge), x.avgPosition > 0 ? String(x.avgPosition) : '-']),
        [3, 1.5, 1.2, 1.5, 1.5, 1.8, 1.6],
      );
    }

    // ---- 声量占比 ----
    if (r.shareOfVoice?.length) {
      h1('声量占比（AI 回答里各品牌被提到的次数）');
      table(['品牌', '被提到次数'], r.shareOfVoice.map((v) => [`${v.name}${v.isSelf ? '（本品牌）' : ''}`, String(v.mentions)]), [6, 2]);
    }

    // ---- 官网检查 ----
    h1('官网能否被 AI 读取');
    if (!r.site) {
      para(r.domainSource === 'none' && r.mode !== 'sample' ? '联网搜索没有找到这家企业的官网，所以没有做官网检查，综合得分只按 AI 部分计算。' : '本次未做官网检查。');
    } else {
      const s = r.site;
      if (!s.reachable) {
        para(`官网无法访问：${s.error || '未知原因'}`, { color: DANGER });
      } else {
        const blocked = s.crawlers.filter((c) => !c.allowed);
        const rows: [boolean, string, string][] = [
          [blocked.length === 0, 'AI 爬虫权限', blocked.length === 0 ? `robots.txt 未屏蔽 ${s.crawlers.map((c) => c.agent).join('、')}` : `已屏蔽 ${blocked.map((c) => `${c.agent}（${c.product}）`).join('、')}`],
          [s.textChars >= 500, '不执行 JavaScript 时的正文', `约 ${s.textChars} 字`],
          [s.english, '英文内容', s.lang ? `页面语言 ${s.lang}` : '未声明页面语言'],
          [s.schemaTypes.length > 0, '结构化数据', s.schemaTypes.length ? s.schemaTypes.slice(0, 12).join('、') : '未发现 Schema 标记'],
          [s.hasLlmsTxt, 'llms.txt', s.hasLlmsTxt ? '已提供' : '未提供'],
          [s.hasSitemap, '站点地图', s.hasSitemap ? '已提供' : '未发现 sitemap'],
          [s.https, 'HTTPS', s.https ? '已启用' : '未启用'],
          [s.ttfbMs < 2000, '首字节耗时', `约 ${(s.ttfbMs / 1000).toFixed(1)} 秒（从测评服务器访问）`],
        ];
        kv('检查的地址', s.finalUrl || r.domain);
        if (s.title) kv('页面标题', s.title);
        if (s.description) kv('页面描述', s.description);
        doc.moveDown(0.3);
        table(['检查项', '结果', '详情'], rows.map(([ok, label, detail]) => [label, ok ? '通过' : '待改进', detail]), [3.2, 1.3, 6]);
        para(`官网检查得分：${s.score} / 100`, { color: MUTED });
      }
    }

    // ---- 发现与建议 ----
    if (r.findings?.length || r.recommendation) {
      h1('核心发现与建议');
      r.findings?.forEach((f) => {
        need(30);
        para(`- ${f}`);
        doc.moveDown(0.2);
      });
      if (r.recommendation) {
        doc.moveDown(0.4);
        para('建议方案', { bold: true });
        doc.moveDown(0.15);
        para(r.recommendation);
      }
    }

    // ---- 每个问题的 AI 回答 ----
    if (r.evidence?.length) {
      h1(`AI 的真实回答（共 ${r.evidence.length} 条，英文原文）`);
      para('下面是向各平台提出的买家问题与 AI 的完整回答。「提及」指回答里点名了本品牌；排位指在推荐名单里的位置；「引用官网」指回答的来源里有官网。', { color: MUTED, size: 9 });
      doc.moveDown(0.5);
      r.evidence.forEach((ev, i) => {
        need(70);
        doc.font('B').fontSize(10).fillColor(INK).text(safe(`${i + 1}. ${ev.engine} · ${ev.branded ? '带品牌名' : '不带品牌名'}的问题`), left, doc.y, { width: W });
        doc.font('B').fontSize(9.5).fillColor(INK).text(safe(`Q: ${ev.question}`), left + 8, doc.y + 1, { width: W - 8, lineGap: 2 });
        const flags = [ev.mentioned ? (ev.position > 0 ? `提及，排第 ${ev.position} 位` : '提及') : '未提及', `态度：${SENTIMENT[ev.sentiment] ?? ev.sentiment}`, ev.ownCited ? '引用官网' : '未引用官网'].join('　');
        doc.font('R').fontSize(9).fillColor(ev.mentioned ? ACCENT : WARN).text(safe(flags), left + 8, doc.y + 2, { width: W - 8 });
        doc.moveDown(0.2);
        doc.font('R').fontSize(9).fillColor(INK).text(safe(ev.answer || '（无回答文本）'), left + 8, doc.y, { width: W - 8, lineGap: 2 });
        if (ev.sources?.length) {
          doc.moveDown(0.25);
          doc.font('B').fontSize(8.5).fillColor(MUTED).text('引用来源', left + 8, doc.y, { width: W - 8 });
          ev.sources.forEach((src) => {
            doc.font('R').fontSize(8.5).fillColor(MUTED).text(safe(`- ${src.title ? `${src.title} ` : ''}${src.uri || src.domain}`), left + 8, doc.y, { width: W - 8, lineGap: 1.5 });
          });
        }
        doc.moveDown(0.7);
      });
    }

    // ---- 提问日志 ----
    if (r.probeLog?.length) {
      h1(`提问日志（共 ${r.probeLog.length} 次提问）`);
      table(
        ['平台', '问题', '结果', '耗时', '来源数', '失败原因'],
        r.probeLog.map((p) => [p.engine, `Q${p.question}${p.branded ? '（带品牌）' : ''} #${p.sample + 1}：${p.text}`, p.ok ? '成功' : '失败', `${(p.ms / 1000).toFixed(1)} 秒`, String(p.sources), p.ok ? '' : [p.reason, p.detail].filter(Boolean).join('：')]),
        [1.6, 6, 1.1, 1.2, 1, 3],
      );
    }

    // ---- 页脚：页码与说明 ----
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.page.margins.bottom = 0;
      doc.font('R').fontSize(8).fillColor(MUTED).text(safe(`云端智荐 ChinGEO · chingeo.com　　第 ${i - range.start + 1} / ${range.count} 页`), left, doc.page.height - 32, { width: W, align: 'center', lineBreak: false });
    }
    doc.end();
  });
}
