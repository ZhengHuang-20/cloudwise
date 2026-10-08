import React from 'react';
import Link from 'next/link';
import { parseInline, parseMarkdown } from '../lib/markdown';
import { useLang } from '../context/LanguageContext';

/** 渲染文章正文（Markdown 子集，见 src/lib/markdown.ts）。站内链接自动加语言前缀，外部链接新窗口打开 */
const Inline: React.FC<{ text: string }> = ({ text }) => {
  const { path } = useLang();
  return (
    <>
      {parseInline(text).map((node, i) => {
        if (node.type === 'strong') return <strong key={i}>{node.text}</strong>;
        if (node.type === 'text') return <React.Fragment key={i}>{node.text}</React.Fragment>;
        if (node.href.startsWith('/')) {
          // 带扩展名的是静态文件（/llms.txt），不加语言前缀，也不走客户端路由
          return /\.[a-z]+$/i.test(node.href) ? (
            <a key={i} href={node.href} className="link">
              {node.text}
            </a>
          ) : (
            <Link key={i} href={path(node.href)} className="link">
              {node.text}
            </Link>
          );
        }
        return (
          <a key={i} href={node.href} target="_blank" rel="noopener noreferrer" className="link">
            {node.text}
          </a>
        );
      })}
    </>
  );
};

export const Markdown: React.FC<{ source: string; className?: string }> = ({ source, className = '' }) => (
  <div className={`prose-article ${className}`}>
    {parseMarkdown(source).map((block, i) => {
      switch (block.type) {
        case 'h2':
          return (
            <h2 key={i}>
              <Inline text={block.text} />
            </h2>
          );
        case 'h3':
          return (
            <h3 key={i}>
              <Inline text={block.text} />
            </h3>
          );
        case 'quote':
          return (
            <blockquote key={i}>
              <Inline text={block.text} />
            </blockquote>
          );
        case 'ul':
        case 'ol': {
          const List = block.type;
          return (
            <List key={i}>
              {block.items.map((item, j) => (
                <li key={j}>
                  <Inline text={item} />
                </li>
              ))}
            </List>
          );
        }
        case 'table':
          return (
            <div key={i} className="prose-table">
              <table>
                <thead>
                  <tr>
                    {block.head.map((cell, j) => (
                      <th key={j} scope="col">
                        <Inline text={cell} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, j) => (
                    <tr key={j}>
                      {row.map((cell, k) => (
                        <td key={k}>
                          <Inline text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        default:
          return (
            <p key={i}>
              <Inline text={block.text} />
            </p>
          );
      }
    })}
  </div>
);
