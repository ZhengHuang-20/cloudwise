'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { Route } from './links';
import type { PageData } from './pageData';
import { useSite } from './SiteContext';

// 每个页面单独分块：服务端照常预渲染完整 HTML，浏览器只下载当前页面的脚本与数据（课程、术语、服务等不再打进全站脚本）
const HomeView = dynamic(() => import('../views/HomeView').then((m) => m.HomeView));
const ServicesView = dynamic(() => import('../views/ServicesView').then((m) => m.ServicesView));
const ServiceDetailView = dynamic(() => import('../views/ServiceDetailView').then((m) => m.ServiceDetailView));
const CasesView = dynamic(() => import('../views/CasesView').then((m) => m.CasesView));
const CaseDetailView = dynamic(() => import('../views/CaseDetailView').then((m) => m.CaseDetailView));
const SolutionDetailView = dynamic(() => import('../views/SolutionDetailView').then((m) => m.SolutionDetailView));
const AcademyView = dynamic(() => import('../views/AcademyView').then((m) => m.AcademyView));
const CourseView = dynamic(() => import('../views/CourseView').then((m) => m.CourseView));
const LessonView = dynamic(() => import('../views/LessonView').then((m) => m.LessonView));
const InsightsView = dynamic(() => import('../views/InsightsView').then((m) => m.InsightsView));
const InsightView = dynamic(() => import('../views/InsightView').then((m) => m.InsightView));
const GlossaryView = dynamic(() => import('../views/GlossaryView').then((m) => m.GlossaryView));
const TermView = dynamic(() => import('../views/TermView').then((m) => m.TermView));
const AuditView = dynamic(() => import('../views/AuditView').then((m) => m.AuditView));
const AboutView = dynamic(() => import('../views/AboutView').then((m) => m.AboutView));
const ConfiguratorView = dynamic(() => import('../views/ConfiguratorView').then((m) => m.ConfiguratorView));
const DealRoomView = dynamic(() => import('../views/DealRoomView').then((m) => m.DealRoomView));
const NotFoundView = dynamic(() => import('../views/NotFoundView').then((m) => m.NotFoundView));

// 后台（登录与客户后台）使用 antd、依赖登录态，单独分块且只在浏览器端渲染，官网页面不下载
const ConsoleApp = dynamic(() => import('../views/console/ConsoleApp'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-canvas" />,
});

/** 按路由渲染页面。路由由服务端页面解析后传入（可序列化），回调统一从 useSite() 取 */
export function RouteView({ route, data }: { route: Route; data: PageData }) {
  const site = useSite();
  const router = useRouter();

  switch (route.kind) {
    case 'home':
      return <HomeView />;
    case 'services':
      return <ServicesView />;
    case 'service':
      return <ServiceDetailView slug={route.slug} insights={data.insights} />;
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
      return <InsightsView insights={data.insights ?? []} />;
    case 'insight':
      return data.insight ? <InsightView insight={data.insight} /> : <NotFoundView />;
    case 'glossary':
      return <GlossaryView />;
    case 'term':
      return <TermView slug={route.slug} insights={data.insights} />;
    case 'audit':
      return <AuditView method={data.auditMethod} />;
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
