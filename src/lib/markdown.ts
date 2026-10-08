/**
 * 文章正文用的 Markdown 子集（洞察文章 src/data/insights/*.ts）。只支持下面这些写法，其余按普通段落处理：
 *   ## 二级标题 / ### 三级标题
 *   空行分隔的段落
 *   - 无序列表 / 1. 有序列表（每行一项）
 *   | 表头 | 表头 |（第二行为 |---|---| 分隔线）表格
 *   > 引用
 * 行内：**加粗**、[文字](/站内路径 或 https://外部链接)
 */

export type MdBlock =
  | { type: 'h2' | 'h3' | 'p' | 'quote'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] };

export type MdInline =
  | { type: 'text'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'link'; text: string; href: string };

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());

export function parseMarkdown(src: string): MdBlock[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const blocks: MdBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() });
      i++;
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
      i++;
    } else if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) items.push(lines[i++].trim().slice(2).trim());
      blocks.push({ type: 'ul', items });
    } else if (/^\d+[.、] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.、] /.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^\d+[.、] /, ''));
      blocks.push({ type: 'ol', items });
    } else if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(splitRow(lines[i++]));
      const [head = [], ...rest] = rows;
      blocks.push({ type: 'table', head, rows: rest.filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c))) });
    } else if (line.startsWith('> ')) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) parts.push(lines[i++].trim().slice(2));
      blocks.push({ type: 'quote', text: parts.join(' ') });
    } else {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(#{2,3} |[-*] |\d+[.、] |\||> )/.test(lines[i].trim())) {
        parts.push(lines[i++].trim());
      }
      blocks.push({ type: 'p', text: joinLines(parts) });
    }
  }
  return blocks;
}

// 中文段落换行直接拼接，英文段落换行处补空格
const joinLines = (parts: string[]) =>
  parts.reduce((acc, part) => (acc && /[A-Za-z0-9,.;:!?)]$/.test(acc) && /^[A-Za-z0-9(]/.test(part) ? `${acc} ${part}` : acc + part), '');

export function parseInline(text: string): MdInline[] {
  const out: MdInline[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ type: 'text', text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: 'strong', text: m[1] });
    else out.push({ type: 'link', text: m[2], href: m[3] });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
  return out;
}

/** 去掉行内标记，得到纯文本（摘要、字数统计用） */
export const stripInline = (text: string) =>
  parseInline(text)
    .map((n) => n.text)
    .join('');
