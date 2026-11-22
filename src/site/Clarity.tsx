'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CLARITY_PROJECT_ID } from '../lib/site';
import { splitLocale } from './locale';

/**
 * Microsoft Clarity（热力图与会话回放）。只在正式部署加载（RootLayout 控制），挂载后再插入脚本，不影响首屏。
 * - 登录与后台（/login、/console/*）不加载：后台有客户线索的姓名与手机号。站内跳进后台时脚本已在运行，
 *   所以 SiteShell 给后台整体加了 data-clarity-mask，内容在回放里被遮住。
 * - 与 cw.js 一样遵守 ?cw_ignore=1（记在 localStorage 的 cw_ignore），排除自己的访问。
 */
declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

const isPrivate = (pathname: string) => {
  const section = splitLocale(pathname).path.split('/')[1];
  return section === 'login' || section === 'console';
};

const ignored = () => {
  try {
    const param = /[?&]cw_ignore=([01])/.exec(window.location.search);
    return (param ? param[1] : localStorage.getItem('cw_ignore')) === '1';
  } catch {
    return false;
  }
};

export function Clarity() {
  const pathname = usePathname() ?? '/';
  const skip = isPrivate(pathname);

  useEffect(() => {
    if (skip || window.clarity || ignored()) return;
    // 官方嵌入代码的等价写法：先放一个排队函数，脚本加载后接管
    const queue = (...args: unknown[]) => {
      (queue.q = queue.q || []).push(args);
    };
    queue.q = [] as unknown[][];
    window.clarity = queue;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}?ref=bwt`;
    document.head.appendChild(script);
  }, [skip]);

  return null;
}
