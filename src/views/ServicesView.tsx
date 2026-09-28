import React from 'react';
import { Check } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SERVICE_IDENTITY, ServiceKey } from '../components/ui/serviceIdentity';
import { FdeBuildLayers } from '../components/FdeBuildLayers';

interface ServicesViewProps {
  onGoToCourse: (courseCode: string) => void;
  onGoToDiagnosis: (toolId: string) => void;
  onGoToConfigurator: (combo: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onGoToCourse,
  onGoToDiagnosis,
  onGoToConfigurator,
}) => {
  const subsystems: {
    key: ServiceKey;
    code: string;
    title: string;
    friction: string;
    oneLiner: string;
    desc: string;
    deliverables: string[];
    courseId: string;
    toolId: string;
    caseName: string;
    budgetRange: string;
    philosophicalNote: string;
  }[] = [
    {
      key: 'site',
      code: 'A',
      title: '认知图式海外独立站',
      friction: '读不懂 · 语法断点',
      oneLiner: '针对海外采购主管、技术总监与合规官三类读者的严密命题模型',
      desc: '彻底清算“中文画册直译”的语言幻觉。工业级出海网站不是艺术品，而是实在的逻辑投影：将企业制造能力分解为参数公差范围、国际标准合规编号与可下载的工程白皮书，消除海外工程买家的阅读不信任。',
      deliverables: [
        '三读者决策层级架构（采购/技术/合规精准分流）',
        '全球 Core Web Vitals 测速优化（海外节点 <1.8s 秒开）',
        'Schema.org 工业知识图谱机器可读结构化元数据',
        '行为探针与线索数据直连企业私有 CRM'
      ],
      courseId: 'A',
      toolId: 'health',
      caseName: '爱康医疗独立站就绪度自测 95 分',
      budgetRange: '8 ~ 20 万元',
      philosophicalNote: '命题的意义在于其逻辑结构。无法被海外工程师验证的技术指标，等同于无意义的噪音。'
    },
    {
      key: 'seo',
      code: 'B',
      title: '采购级语义搜索基建（外贸 SEO）',
      friction: '看不见 · 语义断点',
      oneLiner: '直击欧美工业采购招标核心词库，建立前两页事实存在',
      desc: '拒斥“堆砌泛词与买刷流量”的无效操作。严格遵循 Google Search Essentials 与 E-E-A-T 体系，搭建信息型、对比型、采购型 60 组外贸高商业价值核心词库，一词一页严密映射，让您的制造实体在欧美采购搜索中成为不可忽略的事实。',
      deliverables: [
        '60 组外贸核心采购词一词一页精准映射',
        '深度技术白皮书与工程规格主题内容集群',
        '欧美高权重行业协会与权威媒体数字公关外链',
        'GA4 全链路商机归因与转化漏洞监测'
      ],
      courseId: 'B',
      toolId: 'frictions',
      caseName: '泰宁科创 60 组核心词覆盖欧美市政采购',
      budgetRange: '6 ~ 15 万元 / 年',
      philosophicalNote: '语言的界限即世界的界限。若企业未进入海外采购的词汇系统，在商业逻辑中便等于不存在。'
    },
    {
      key: 'geo',
      code: 'C',
      title: '生成式权威信源协议（出海 GEO）',
      friction: '不被信 · 证据断点',
      oneLiner: '将企业工程专利与合规卷宗，作为客观事实写入大模型推荐库',
      desc: '大模型时代出海的先锋防御与截流基建。当海外买家向 ChatGPT、Perplexity 或 Google SGE 询问行业推荐供应商时，系统通过第三方学术索引、国际认证评测与真实地标工程证据链，确保 AI 直接调取并输出您的企业名录。',
      deliverables: [
        '海外决策者提问意图簇与大模型提示词挖掘',
        '全年度高权重技术卷宗与第三方学术背书规划',
        '欧美权威行业媒体与评测报告知识图谱注入',
        '月度主流 AI 平台推荐能见度探针与竞品对标月报'
      ],
      courseId: 'C',
      toolId: 'visibility',
      caseName: '爱康医疗在 ChatGPT 骨科器械推荐中连续捕获真实意向',
      budgetRange: '12 ~ 30 万元 / 年',
      philosophicalNote: '信念需要证据支撑。缺乏第三方知识图谱背书的主张，在采购审计中必然被判定为伪。'
    },
    {
      key: 'chat',
      code: 'D',
      title: '时态确定性 AI 转化引擎',
      friction: '接不住 · 时态断点',
      oneLiner: '跨越 12 小时时差黑洞，以零延迟因果反馈阻断商机湮灭',
      desc: '彻底根除“欧美买家深夜来信、次日人工回复早已找了竞品”的致命时差损耗。基于企业专属技术参数库，2 秒内以多语种母语级精度解答公差、认证与交期质询，实时提取采购特征并判定意向等级。',
      deliverables: [
        '企业专属工程知识卷宗清洗与多语种微调',
        '官网、邮件、WhatsApp 全渠道零时差接入',
        '采购数量、交期、目标港等 12 维参数精准抽取',
        '高价值线索毫秒级推送企业微信与销售 CRM'
      ],
      courseId: 'D',
      toolId: 'loss',
      caseName: '凌晨 03:12 欧美采购质询，03:14 自动沉淀商业档案',
      budgetRange: '5 ~ 15 万元',
      philosophicalNote: '时间是因果链的介质。响应的延迟必然导致交易因果链条的断裂。'
    },
    {
      key: 'fde',
      code: 'E',
      title: 'AI 驱动的三层建设（FDE 驻场）',
      friction: '连不上 · 落地断点',
      oneLiner: '带着 AI 下到业务一线，把经验写成标准，把标准装进系统，再让 AI 在系统上干活',
      desc: 'FDE（前线部署工程师）源自 Palantir，如今 OpenAI、Anthropic 也在用它跨越“演示惊艳、上线艰难”的鸿沟。多数外贸企业的流程写在老业务员的经验和微信里，直接上 AI 只能做出演示。FDE 驻场跟岗，用 AI 加速完成标准化、信息化、智能化三层建设，对业务结果负责，离场时把标准、系统、数据和会用的人一起留给企业。',
      deliverables: [
        '从一个高价值场景切入，2 ~ 4 周跑通第一个闭环',
        '每周一轮“观察-原型-试用-沉淀”，每周都有可用成果',
        '按层验收：规则经业务审定、数据自动入库、AI 达到评测指标',
        '源码、数据与文档归企业，同步培养内部 AI 骨干'
      ],
      courseId: 'E',
      toolId: 'flow',
      caseName: '询盘分级：一周内从凭经验判断到 AI 按规则打标',
      budgetRange: '20 ~ 50 万元 / 周期',
      philosophicalNote: '没有标准化的智能化，只是把混乱自动化。AI 放大的永远是企业已有的秩序。'
    },
  ];

  const scrollToService = (code: string) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`service-${code}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div>
      <PageHeader
        eyebrow="五项服务"
        title="全球获客系统的五个子系统"
        intro="一套知识资产，五个子系统协同工作，构筑符合欧美工程与合规审计标准的获客转化系统，终结海外订单的无序流失。"
      >
        {/* 页内索引 */}
        <nav aria-label="子系统索引" className="flex flex-wrap justify-center gap-2">
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
                    子系统 {svc.code} · 破除「{svc.friction}」
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
                  <span className="font-semibold text-label">核心商业事实　</span>
                  {svc.philosophicalNote}
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

              {/* FDE 需要讲清方法论：三层图横跨两栏，dense 排布让右侧投入栏回填第一行 */}
              {svc.key === 'fde' && <FdeBuildLayers className="lg:col-span-2" />}

              <aside className="well self-start" aria-label={`${svc.title}：投入与下一步`}>
                <dl>
                  <dt className="text-caption text-label-secondary">参考投入</dt>
                  <dd className="mt-1 text-title-2 tabular-nums">{svc.budgetRange}</dd>
                  <dt className="mt-5 border-t border-separator pt-5 text-caption text-label-secondary">实战验证</dt>
                  <dd className="mt-1 text-body">{svc.caseName}</dd>
                </dl>
                <div className="mt-6 space-y-3">
                  <button type="button" onClick={() => onGoToDiagnosis(svc.toolId)} className="btn btn-primary btn-block">
                    体检这一环节
                  </button>
                  <button type="button" onClick={() => onGoToCourse(svc.courseId)} className="btn btn-secondary btn-block">
                    学习课程 {svc.code}
                  </button>
                </div>
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
            大多数企业从“独立站 + SEO + GEO”获客组合起步。组合后即可看到预算区间、交付周期与交付物清单。
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={() => onGoToConfigurator('package-acquisition')}
              className="btn btn-primary btn-lg"
            >
              配置获客组合
            </button>
            <button type="button" onClick={() => onGoToDiagnosis('frictions')} className="btn btn-secondary btn-lg">
              先做断点体检
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
