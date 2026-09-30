import React from 'react';
import { Check } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SERVICE_IDENTITY, ServiceKey } from '../components/ui/serviceIdentity';
import { FdeBuildLayers } from '../components/FdeBuildLayers';
import { SERVICE_COUNT_CN, SHOW_FDE } from '../lib/features';

interface ServicesViewProps {
  onGoToCourse: (courseCode: string) => void;
  onGoToAudit: () => void;
  onGoToConfigurator: (combo: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onGoToCourse,
  onGoToAudit,
  onGoToConfigurator,
}) => {
  const allSubsystems: {
    key: ServiceKey;
    code: string;
    title: string;
    friction: string;
    oneLiner: string;
    desc: string;
    deliverables: string[];
    courseId: string;
    caseName: string;
    judgement: string;
  }[] = [
    {
      key: 'site',
      code: 'A',
      title: '海外独立站（三读者架构）',
      friction: '读不懂',
      oneLiner: '为采购主管、技术总监、合规官各自准备他们要找的页面。',
      desc: '很多企业的英文站是中文画册直译，海外工程师找不到公差、标准编号和可下载的资料，也就无从判断你是否可靠。我们把制造能力整理成参数与公差范围、国际标准合规编号和可下载的工程白皮书，让每类读者一眼找到自己要的。',
      deliverables: [
        '按采购、技术、合规三类读者分流的页面结构',
        'Core Web Vitals 优化，目标：海外主要地区 LCP ≤ 1.8 秒',
        'Schema.org 结构化数据，便于搜索引擎与 AI 读取',
        '访客行为与表单线索同步到企业自己的 CRM'
      ],
      courseId: 'A',
      caseName: '爱康医疗：新建海外官网 GEO / SEO 评分 95 分（国内官网为 47 分，是两个不同站点）',
      judgement: '工程师核对不了的参数，不会被当作依据。所以先把能核对的东西摆出来：公差、标准编号、检测报告。'
    },
    {
      key: 'seo',
      code: 'B',
      title: '外贸 SEO：采购级核心词库',
      friction: '看不见',
      oneLiner: '买家搜什么词，你的页面就出现在那个词下面。',
      desc: '不堆泛词，不买流量。遵循 Google Search Essentials 与 E-E-A-T，建立信息型、对比型、采购型共 60 组核心词，一个词对应一个页面，让欧美买家在采购搜索中有机会看到你。',
      deliverables: [
        '60 组外贸核心采购词，一词一页',
        '技术白皮书与工程规格主题内容',
        '行业协会与专业媒体的外部链接（不买卖链接）',
        '用 GA4 追踪询盘来源与转化流失的位置'
      ],
      courseId: 'B',
      caseName: '泰宁科创：60 组英文核心词在 Google 欧美主要地区排名前两页',
      judgement: '买家搜不到你，就不会知道你。所以先弄清他们搜什么词，再让页面对得上。'
    },
    {
      key: 'geo',
      code: 'C',
      title: '出海 GEO：让 AI 引用你的资料',
      friction: '不被信',
      oneLiner: '把企业的专利、认证与工程案例整理成 AI 能查证、愿意引用的公开资料。',
      desc: '海外买家向 ChatGPT、Perplexity 或 Google AI 概览询问推荐供应商时，AI 会引用它能查到的公开资料。我们通过第三方学术索引、认证与评测机构、真实工程案例，整理你的证据链，提高被引用的机会。我们无法保证 AI 一定推荐你，所以每月用同一组问题复测并汇报。',
      deliverables: [
        '整理海外决策者会问 AI 的问题（问题簇）',
        '全年技术资料与第三方背书规划',
        '在行业媒体与评测报告中建立可被引用的公开来源',
        '每月用固定问题集测试主流 AI 平台，并与竞品对比的月报'
      ],
      courseId: 'C',
      caseName: '爱康医疗：ChatGPT、Perplexity 数月持续带来引荐访问',
      judgement: '没有出处的说法，AI 不会引用，采购方也不会采信。'
    },
    {
      key: 'chat',
      code: 'D',
      title: 'AI 智能客服与系统对接',
      friction: '接不住',
      oneLiner: '欧美买家深夜来信，也能在几秒内得到第一次回复。',
      desc: '欧美买家在他们的工作时间来信，往往正是北京时间的深夜；等第二天人工回复，买家可能已经联系了别的供应商。AI 客服依据企业自己的技术参数库，用多语种回答公差、认证、交期等问题，提取采购信息并判断意向等级；超出资料范围的问题转给销售。',
      deliverables: [
        '整理企业参数与资质资料，建立多语种知识库',
        '官网、邮件、WhatsApp 等渠道接入',
        '抽取采购数量、交期、目标港等 12 项询盘信息',
        '高意向线索即时推送到企业微信与 CRM'
      ],
      courseId: 'D',
      caseName: '示例：凌晨 03:12 收到欧美采购询问，03:14 完成回复并生成线索档案',
      judgement: '买家等不到回复，就会去问别人。所以第一次回复要快，而且要答对。'
    },
    {
      key: 'fde',
      code: 'E',
      title: 'AI 驱动的三层建设（FDE 驻场）',
      friction: '连不上',
      oneLiner: '带着 AI 下到业务一线，把经验写成标准，把标准装进系统，再让 AI 在系统上干活',
      desc: 'FDE（前线部署工程师）源自 Palantir，如今 OpenAI、Anthropic 也在用它跨越“演示惊艳、上线艰难”的鸿沟。多数外贸企业的流程写在老业务员的经验和微信里，直接上 AI 只能做出演示。FDE 驻场跟岗，用 AI 加速完成标准化、信息化、智能化三层建设，对业务结果负责，离场时把标准、系统、数据和会用的人一起留给企业。',
      deliverables: [
        '从一个高价值场景切入，2 ~ 4 周跑通第一个闭环',
        '每周一轮“观察-原型-试用-沉淀”，每周都有可用成果',
        '按层验收：规则经业务审定、数据自动入库、AI 达到评测指标',
        '源码、数据与文档归企业，同步培养内部 AI 骨干'
      ],
      courseId: 'E',
      caseName: '示例：一周内，询盘分级从凭经验判断变为 AI 按规则打标',
      judgement: '没有标准化的智能化，只是把混乱自动化。AI 只会放大企业已有的秩序。'
    },
  ];
  const subsystems = SHOW_FDE ? allSubsystems : allSubsystems.filter((svc) => svc.key !== 'fde');

  const scrollToService = (code: string) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`service-${code}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div>
      <PageHeader
        eyebrow={`${SERVICE_COUNT_CN}项服务`}
        title={`${SERVICE_COUNT_CN}项服务，各解决一个卡点`}
        intro={`${SERVICE_COUNT_CN}项服务共用同一套企业资料：独立站、搜索、AI 推荐、客服和内部系统，各解决一个卡点，内容可以互相复用。`}
      >
        {/* 页内索引 */}
        <nav aria-label="服务索引" className="flex flex-wrap justify-center gap-2">
          {subsystems.map((svc) => {
            const identity = SERVICE_IDENTITY[svc.key];
            return (
              <button key={svc.code} type="button" onClick={() => scrollToService(svc.code)} className="chip">
                <span className={`h-2 w-2 rounded-full ${identity.dot}`} aria-hidden="true" />
                {identity.name}
              </button>
            );
          })}
        </nav>
      </PageHeader>

      <div className="layout-wide space-y-5 pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {subsystems.map((svc) => {
          const identity = SERVICE_IDENTITY[svc.key];
          const Icon = identity.icon;
          return (
            <article
              key={svc.code}
              id={`service-${svc.code}`}
              aria-labelledby={`service-${svc.code}-title`}
              className="tile grid scroll-mt-20 gap-10 lg:grid-flow-row-dense lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14"
            >
              <div>
                <div className="flex items-center gap-3">
                  <Icon className={`h-8 w-8 ${identity.text}`} />
                  <span className="text-caption text-label-secondary">
                    服务 {svc.code} · 对应卡点：{svc.friction}
                  </span>
                </div>
                <h2 id={`service-${svc.code}-title`} className="mt-5 text-title-1">
                  {/* 在括注前断行，避免窄屏把词组拆开 */}
                  {svc.title.split(/(?=（)/).map((part) => (
                    <span key={part} className="inline-block">
                      {part}
                    </span>
                  ))}
                </h2>
                <p className="mt-4 text-intro">{svc.oneLiner}</p>
                <p className="mt-4 text-body text-label-secondary">{svc.desc}</p>

                <blockquote className="mt-6 border-l-2 border-separator-strong pl-4 text-body text-label-secondary">
                  <span className="font-semibold text-label">我们的判断　</span>
                  {svc.judgement}
                </blockquote>

                <h3 className="mt-10 text-title-3">交付标准</h3>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {svc.deliverables.map((item) => (
                    <li key={item} className="flex gap-3 text-body">
                      <Check className="mt-1 h-5 w-5 shrink-0 text-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FDE 需要讲清方法论：三层图横跨两栏，dense 排布让右侧栏回填第一行 */}
              {svc.key === 'fde' && <FdeBuildLayers className="lg:col-span-2" />}

              <aside className="well self-start" aria-label={`${svc.title}：案例与下一步`}>
                <dl>
                  <dt className="text-caption text-label-secondary">案例</dt>
                  <dd className="mt-1 text-body">{svc.caseName}</dd>
                </dl>
                <button type="button" onClick={() => onGoToCourse(svc.courseId)} className="btn btn-secondary btn-block mt-6">
                  学习课程 {svc.code}
                </button>
              </aside>
            </article>
          );
        })}

        {/* 收尾：引导到组合配置 */}
        <section className="pt-[clamp(3.5rem,2rem+4vw,6rem)] text-center">
          <h2 className="text-headline">
            <span className="inline-block">不确定从哪一项开始？</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-intro text-label-secondary">
            常见的起点是“独立站 + SEO + GEO”获客组合。组合后可以看到交付周期、阶段排期与交付物清单。
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={() => onGoToConfigurator('package-acquisition')}
              className="btn btn-primary btn-lg"
            >
              配置获客组合
            </button>
            <button type="button" onClick={onGoToAudit} className="btn btn-secondary btn-lg">
              先做 AI 可见性测评
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
