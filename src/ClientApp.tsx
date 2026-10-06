'use client';

import dynamic from 'next/dynamic';

// 整个站点是一个依赖 window / localStorage 的单页应用（hash 路由），只在浏览器端渲染。
const App = dynamic(() => import('./App'), { ssr: false });

export default function ClientApp() {
  return <App />;
}
