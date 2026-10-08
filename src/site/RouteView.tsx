'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { Route } from './routes';
import { useSite } from './SiteContext';
import { HomeView } from '../views/HomeView';
import { ServicesView } from '../views/ServicesView';
import { ServiceDetailView } from '../views/ServiceDetailView';
import { CasesView } from '../views/CasesView';
import { CaseDetailView } from '../views/CaseDetailView';
import { SolutionDetailView } from '../views/SolutionDetailView';
import { AcademyView } from '../views/AcademyView';
import { CourseView } from '../views/CourseView';
import { LessonView } from '../views/LessonView';
import { InsightsView } from '../views/InsightsView';
import { InsightView } from '../views/InsightView';
import { GlossaryView } from '../views/GlossaryView';
import { TermView } from '../views/TermView';
import { AuditView } from '../views/AuditView';
import { AboutView } from '../views/AboutView';
import { ConfiguratorView } from '../views/ConfiguratorView';
import { DealRoomView } from '../views/DealRoomView';
import { NotFoundView } from '../views/NotFoundView';

// 后台（登录与客户后台）使用 antd、依赖登录态，单独分块且只在浏览器端渲染，官网页面不下载
const ConsoleApp = dynamic(() => import('../views/console/ConsoleApp'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-canvas" />,
});

/** 按路由渲染页面。路由由服务端页面解析后传入（可序列化），回调统一从 useSite() 取 */
export function RouteView({ route }: { route: Route }) {
  const site = useSite();
  const router = useRouter();

  switch (route.kind) {
    case 'home':
      return <HomeView />;
    case 'services':
      return <ServicesView />;
    case 'service':
      return <ServiceDetailView slug={route.slug} />;
    case 'cases':
      return <CasesView />;
    case 'case':
      return <CaseDetailView slug={route.slug} />;
    case 'solution':
      return <SolutionDetailView slug={route.slug} />;
    case 'academy':
      return <AcademyView />;
    case 'course':
      return <CourseView slug={route.slug} />;
    case 'lesson':
      return <LessonView course={route.course} slug={route.slug} />;
    case 'insights':
      return <InsightsView />;
    case 'insight':
      return <InsightView slug={route.slug} />;
    case 'glossary':
      return <GlossaryView />;
    case 'term':
      return <TermView slug={route.slug} />;
    case 'audit':
      return <AuditView />;
    case 'about':
      return <AboutView />;
    case 'configurator':
      return (
        <ConfiguratorView
          onGoToDealRoom={() => site.navigate('/deal-room')}
          onGoToBooking={site.openBooking}
          initialParams={site.configuratorPrefill}
        />
      );
    case 'deal-room':
      return <DealRoomView onGoToBooking={site.openBooking} />;
    case 'login':
    case 'console':
      // 后台只有中文，不加语言前缀
      return (
        <ConsoleApp
          tab={route.kind}
          onNavigate={(tab) => router.push(tab === 'home' ? '/' : `/${tab}`)}
          onGoToBooking={site.openBooking}
        />
      );
    default:
      return <NotFoundView />;
  }
}
