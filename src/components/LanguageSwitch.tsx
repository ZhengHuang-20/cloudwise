import React from 'react';
import { usePathname } from 'next/navigation';
import { useLang } from '../context/LanguageContext';
import { localizePath, splitLocale } from '../site/locale';

/** 中英文切换：显示的是「切换到的语言」，例如中文界面显示 English。是指向另一语言同一页面的链接。
 * 导航栏里用 variant="text"（安静的文字链接），移动端菜单里用按钮样式 */
export const LanguageSwitch: React.FC<{ size?: 'sm' | 'lg'; variant?: 'button' | 'text'; className?: string }> = ({
  size = 'sm',
  variant = 'button',
  className = '',
}) => {
  const { lang, setLang } = useLang();
  const pathname = usePathname() ?? '/';
  const next = lang === 'zh' ? 'en' : 'zh';
  return (
    <a
      href={localizePath(splitLocale(pathname).path, next)}
      hrefLang={next === 'en' ? 'en' : 'zh-CN'}
      onClick={(e) => {
        e.preventDefault();
        setLang(next);
      }}
      lang={next === 'en' ? 'en' : 'zh-CN'}
      aria-label={next === 'en' ? 'Switch to English' : '切换为中文'}
      className={`${variant === 'text' ? 'nav-text-link' : `btn btn-neutral ${size === 'lg' ? 'btn-lg' : 'btn-sm'}`} ${className}`}
    >
      {next === 'en' ? 'English' : '中文'}
    </a>
  );
};
