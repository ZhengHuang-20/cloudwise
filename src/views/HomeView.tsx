import React, { useRef } from 'react';
import { ChevronRight, ListChecks, Lock, Radar } from 'lucide-react';
import { TabId } from '../components/navigation';
import { Reveal } from '../components/ui/Reveal';
import { SERVICE_IDENTITY, ServiceKey } from '../components/ui/serviceIdentity';
import { SERVICE_COUNT_CN, SHOW_FDE } from '../lib/features';
import { VisibilityAudit } from './home/VisibilityAudit';

interface HomeViewProps {
  onNavigate: (tab: TabId) => void;
  openBookingModal: () => void;
}

const ALL_SERVICES: { key: ServiceKey; title: string; desc: string; link: string }[] = [
  {
    key: 'site',
    title: '海外独立站建站',
    desc: '为海外采购主管、技术总监、合规官三类读者设计的独立站：公差、认证编号、技术资料都能在页面上找到，海外访问打开快。',
    link: '了解建站方案',
  },
  {
    key: 'seo',
    title: '外贸 SEO 优化',
    desc: '按买家的真实搜索词，建 60 组采购相关的核心词库，一个词对应一个页面；目标是让买家搜索时能看到你。',
    link: '了解 SEO 词库策略',
  },
  {
    key: 'geo',
    title: '出海 GEO 优化',
    desc: '海外采购商向 ChatGPT、Perplexity、Google AI 概览询问供应商时，提高你的品牌被引用的机会，并每月复测给你看。',
    link: '了解 GEO 信源方案',
  },
  {
    key: 'chat',
    title: 'AI 智能客服与系统对接',
    desc: '依据企业自己的参数库，全天候用多语种解答公差、认证与交期；超出资料范围的问题转给销售；识别询盘意向并同步到 CRM。',
    link: '了解 AI 客服',
  },
  {
    key: 'fde',
    title: 'FDE 驻场工程师',
    desc: '带着 AI 驻场一线，把业务经验写成标准、装进系统、交给 AI 执行。源码、数据和会用的人都留给企业。',
    link: '了解三层建设',
  },
];
const SERVICES = SHOW_FDE ? ALL_SERVICES : ALL_SERVICES.filter((service) => service.key !== 'fde');

// 售前工具：tab 为 'audit' 时滚动到首页的 AI 可见性测评，其余跳转到对应页面
const TOOLS: { tab: TabId | 'audit'; icon: React.ComponentType<{ className?: string }>; title: string; desc: string; link: string }[] = [
  {
    tab: 'audit',
    icon: Radar,
    title: 'AI 可见性测评',
    desc: '输入官网或品牌名，我们以海外买家身份向 AI 搜索提问，看看你会不会被推荐、卡在哪一步。',
    link: '开始测评',
  },
  {
    tab: 'configurator',
    icon: ListChecks,
    title: '方案组合与交付规划',
    desc: `自由组合独立站、SEO、GEO${SHOW_FDE ? '、AI 客服与 FDE 驻场' : ' 与 AI 客服'}，实时得到交付周期、阶段排期与交付物清单。`,
    link: '规划方案',
  },
  {
    tab: 'deal-room',
    icon: Lock,
    title: '专属方案空间',
    desc: '保存的方案自动生成共享空间，双方在这里推进行动计划、答疑讨论与在线签约。',
    link: '进入方案空间',
  },
];

const prefersReducedMotion =() => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, openBookingModal }) => {
  const auditInputRef = useRef<HTMLInputElement>(null);

  const scrollToAudit = () => {
    document.getElementById('audit')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
    auditInputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div>
      {/* ===================== Hero ===================== */}
      <section className="layout-text pt-[clamp(4rem,2rem+6vw,7.5rem)] text-center">
        <p className="eyebrow">云端智荐 · AI 出海售前系统</p>
        <h1 className="mt-4 text-display">
          让海外买家找到你
          <br />
          <span className="text-gradient-ai">让 AI 替你接住生意</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-intro text-label-secondary">
          独立站、SEO、GEO、AI 客服与系统对接{SHOW_FDE && '，以及 FDE 驻场'}。
          帮中国中型制造企业让海外买家找得到、读得懂、信得过，询盘来了有人接。
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button type="button" onClick={scrollToAudit} className="btn btn-primary btn-lg">
            免费做 AI 可见性测评
          </button>
          <button type="button" onClick={openBookingModal} className="btn btn-secondary btn-lg">
            预约诊断会
          </button>
        </div>
      </section>

      {/* ===================== 即时评估工具 ===================== */}
      <section id="audit" className="scroll-mt-20 pt-16 md:pt-20">
        <VisibilityAudit
          inputRef={auditInputRef}
          openBookingModal={openBookingModal}
          onGoToConfigurator={() => onNavigate('configurator')}
        />
      </section>

      {/* ===================== 核心服务 ===================== */}
      <section className="section layout-wide">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">核心服务</p>
          <h2 className="mt-3 text-headline">
            <span className="inline-block">{SERVICE_COUNT_CN}项服务，</span>
            <span className="inline-block">一套获客系统。</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">
            每一项服务都写明：做什么、交什么、怎样验收。
          </p>
        </Reveal>

        <Reveal className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-6">
          {SERVICES.map((service, index) => {
            const identity = SERVICE_IDENTITY[service.key];
            const Icon = identity.icon;
            // 五张：前两张各占 3 列、后三张各占 2 列；四张：2 × 2
            const span =
              index < 2 || SERVICES.length === 4
                ? 'lg:col-span-3'
                : index === 4
                  ? 'md:col-span-2 lg:col-span-2'
                  : 'lg:col-span-2';
            return (
              <button
                key={service.key}
                type="button"
                onClick={() => onNavigate('services')}
                className={`tile interactive group flex flex-col items-start ${span}`}
              >
                <Icon className={`h-8 w-8 ${identity.text}`} />
                <h3 className="mt-6 text-title-2">{service.title}</h3>
                <p className="mt-3 flex-1 text-body text-label-secondary">{service.desc}</p>
                <span className="link mt-6 text-body">
                  {service.link}
                  <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </Reveal>
      </section>

      {/* ===================== 售前工具 ===================== */}
      <section className="section layout-wide pt-0">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">售前工具</p>
          <h2 className="mt-3 text-headline">
            <span className="inline-block">见销售之前，</span>
            <span className="inline-block">先看清问题与方案。</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">面向出海决策人的自助工具，免注册，打开即用。</p>
        </Reveal>

        <Reveal className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.tab}
                type="button"
                onClick={() => (tool.tab === 'audit' ? scrollToAudit() : onNavigate(tool.tab))}
                className="tile interactive group flex flex-col items-start"
              >
                <Icon className="h-8 w-8 text-label" />
                <h3 className="mt-6 text-title-2">{tool.title}</h3>
                <p className="mt-3 flex-1 text-body text-label-secondary">{tool.desc}</p>
                <span className="link mt-6 text-body">
                  {tool.link}
                  <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </Reveal>
      </section>

      {/* ===================== 标杆案例 ===================== */}
      <section className="section layout-wide pt-0">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">标杆案例</p>
          <h2 className="mt-3 text-headline">
            <span className="inline-block">看制造企业怎样走向海外。</span>
          </h2>
          <button type="button" onClick={() => onNavigate('cases')} className="link mt-5 text-intro">
            查看全部案例
            <ChevronRight />
          </button>
        </Reveal>

        <Reveal className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {[
            {
              meta: '港股上市 · 骨科植入物头部企业',
              name: '爱康医疗',
              stat: '47 → 95',
              statUnit: '分',
              statLabel: 'GEO / SEO 评分 · 国内官网 → 新建海外官网',
              desc: '新建英文海外官网，按 4 类海外医疗决策者的提问组织内容，规划 91 项年度技术内容。数月内，ChatGPT 与 Perplexity 持续带来引荐访问。',
              pains: '读不懂 · 不被信',
            },
            {
              meta: '国家级专精特新“小巨人” · 环保水务',
              name: '泰宁科创',
              stat: '60',
              statUnit: '组',
              statLabel: '英文核心词 · Google 欧美排名前两页',
              desc: '围绕英国 SuDS 规范建立 60 组英文核心词，编制英文合规指南，把国内地标工程整理成海外工程师能查证的资料；已进入中东某新城雨水调蓄项目的供应商短名单。',
              pains: '看不见 · 接不住',
            },
          ].map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => onNavigate('cases')}
              className="tile interactive group flex flex-col items-start"
            >
              <p className="text-caption text-label-secondary">{item.meta}</p>
              <h3 className="mt-1 text-title-2">{item.name}</h3>
              <p className="mt-8 text-headline tabular-nums">
                {item.stat}
                <span className="ml-1 text-title-3 text-label-secondary">{item.statUnit}</span>
              </p>
              <p className="mt-1 text-caption text-label-secondary">{item.statLabel}</p>
              <p className="mt-6 flex-1 text-body text-label-secondary">{item.desc}</p>
              <div className="mt-8 flex w-full flex-wrap items-center justify-between gap-3 border-t border-separator pt-5">
                <span className="text-caption text-label-secondary">对应卡点：{item.pains}</span>
                <span className="link text-body">
                  阅读案例
                  <ChevronRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          ))}
        </Reveal>
      </section>

      {/* ===================== 收尾行动 ===================== */}
      <section className="section layout-text pt-0 text-center">
        <Reveal>
          <h2 className="text-headline">
            <span className="inline-block">先看清现状，</span>
            <span className="inline-block">再决定做什么。</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">
            先做免费的 AI 可见性测评；想要人工解读，就预约 30 分钟诊断会，会后给出书面的改进清单。
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button type="button" onClick={scrollToAudit} className="btn btn-primary btn-lg">
              开始 AI 可见性测评
            </button>
            <button type="button" onClick={openBookingModal} className="btn btn-secondary btn-lg">
              预约 30 分钟诊断会
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
