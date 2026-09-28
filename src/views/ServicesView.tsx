import React from 'react';
import {
  Globe,
  Search,
  Sparkles,
  Bot,
  Users,
  ArrowRight,
  Shield,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck,
  ChevronRight,
  Database
} from 'lucide-react';

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
  const subsystems = [
    {
      code: 'A',
      title: '认知图式海外独立站',
      systemName: 'Cognitive Schema Architecture',
      friction: '读不懂 · 语法断点',
      icon: Globe,
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
      code: 'B',
      title: '采购级语义搜索基建 (外贸 SEO)',
      systemName: 'Semantic Grounding Search Protocol',
      friction: '看不见 · 语义断点',
      icon: Search,
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
      code: 'C',
      title: '生成式权威信源协议 (出海 GEO)',
      systemName: 'Generative Engine Authority Protocol',
      friction: '不被信 · 证据断点',
      icon: Sparkles,
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
      code: 'D',
      title: '时态确定性 AI 转化引擎',
      systemName: 'Zero-Latency Conversion State Machine',
      friction: '接不住 · 时态断点',
      icon: Bot,
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
      code: 'E',
      title: '现场驻场工程师 (FDE) 闭环落地',
      systemName: 'Forward Deployed Engineering',
      friction: '连不上 · 协议断点',
      icon: Users,
      oneLiner: '深入外贸业务一线，把站内行为直接编译为销售见面前的情报底牌',
      desc: '汲取 Palantir 核心交付精髓。不卖空泛的 SaaS 账号，而是派遣资深技术与商业架构师深入企业一线，每周通过“观察-原型-试用-对齐”闭环，将前台买家“学懂、自测、看方案”的全量行为转化为高价值《会前商业情报》，源码与数据全归企业。',
      deliverables: [
        '每周现场敏捷迭代系统可用原型与转化闭环',
        '打通企业内部 ERP、私有 CRM 与海外邮件系统',
        '买家站内行为编译为 12 页《会前高净值商业情报档案》',
        '完整源代码与海外数字资产无保留移交'
      ],
      courseId: 'E',
      toolId: 'flow',
      caseName: '商业数据物理隔离，销售在见面前掌握买家体检明细',
      budgetRange: '20 ~ 50 万元 / 周期',
      philosophicalNote: '理论的最终检验是其在生活形式中的应用。脱离业务现场的系统无异于数字墓碑。'
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#f5f5f7]">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <span className="apple-eyebrow text-xs sm:text-sm tracking-wider">DETERMINISTIC SUBSYSTEMS</span>
        <h1 className="apple-section-title">
          全球获客系统五大核心子系统
        </h1>
        <p className="text-base sm:text-lg text-[#d2d2d7] leading-relaxed max-w-2xl mx-auto">
          构筑符合欧美严苛工程与合规审计标准的全球获客转化系统。<br />
          一套知识资产，五大子系统因果协同，终结海外订单无序流失。
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-8">
        {subsystems.map((svc) => (
          <div
            key={svc.code}
            className="apple-glass rounded-3xl p-8 sm:p-10 hover:border-white/25 transition-all flex flex-col lg:flex-row gap-8 justify-between items-start"
          >
            <div className="space-y-5 flex-1">
              <div className="flex items-center gap-3.5">
                <span className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/30 text-[#2997ff] font-mono font-bold text-base flex items-center justify-center shrink-0">
                  {svc.code}
                </span>
                <div>
                  <span className="text-sm font-semibold text-[#2997ff] mr-3">
                    破除：{svc.friction}
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight inline">{svc.title}</h3>
                  <span className="text-sm font-medium text-[#a1a1a6] block sm:inline sm:ml-2">({svc.systemName})</span>
                </div>
              </div>

              <p className="text-base font-semibold text-[#2997ff]">{svc.oneLiner}</p>
              <p className="text-base sm:text-[17px] text-[#d2d2d7] leading-relaxed max-w-3xl font-normal">{svc.desc}</p>

              {/* Business Note */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-sm sm:text-base text-[#e5e5ea] flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#2997ff] shrink-0 mt-0.5" />
                <span><strong className="text-white font-semibold">核心商业事实：</strong>{svc.philosophicalNote}</span>
              </div>

              <div className="pt-2">
                <span className="text-sm font-semibold text-white block mb-3">子系统核心交付标准：</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base">
                  {svc.deliverables.map((del, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2.5 text-[#f5f5f7]">
                      <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Action Box */}
            <div className="w-full lg:w-80 p-6 bg-white/[0.04] rounded-2xl border border-white/[0.1] space-y-5 shrink-0">
              <div className="flex justify-between items-center text-sm border-b border-white/[0.06] pb-3">
                <span className="text-[#d2d2d7]">系统工程投入</span>
                <span className="font-mono text-white font-bold text-base">{svc.budgetRange}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/[0.06] pb-3">
                <span className="text-[#d2d2d7]">实战验证标杆</span>
                <span className="text-[#30d158] font-semibold text-sm sm:text-base truncate max-w-[160px]">{svc.caseName}</span>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  onClick={() => onGoToCourse(svc.courseId)}
                  className="apple-secondary-btn w-full h-12 text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
                >
                  <span>学习认知课程 {svc.code}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onGoToDiagnosis(svc.toolId)}
                  className="apple-blue-btn w-full h-12 text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
                >
                  <span>进行子系统断点体检</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
