import React from 'react';
import { useLang } from '../context/LanguageContext';

/** 中英文切换按钮：显示的是「切换到的语言」，例如中文界面显示 English */
export const LanguageSwitch: React.FC<{ size?: 'sm' | 'lg'; className?: string }> = ({ size = 'sm', className = '' }) => {
  const { lang, setLang } = useLang();
  const next = lang === 'zh' ? 'en' : 'zh';
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      lang={next === 'en' ? 'en' : 'zh-CN'}
      aria-label={next === 'en' ? 'Switch to English' : '切换为中文'}
      className={`btn btn-neutral ${size === 'lg' ? 'btn-lg' : 'btn-sm'} ${className}`}
    >
      {next === 'en' ? 'English' : '中文'}
    </button>
  );
};
