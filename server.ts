import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { SERVICE_COUNT_CN, SHOW_FDE } from './src/lib/features';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize Google Gemini API on server side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with provided key:', err);
  }
}

// FDE 驻场服务的知识条目：SHOW_FDE 为 false 时不进入知识库，AI 顾问既不介绍也不推荐 FDE
const FDE_KNOWLEDGE = `5. FDE 驻场工程师（解决“连不上”）：源自 Palantir 的前线部署工程模式，OpenAI、Anthropic 等 AI 公司也在用它推动企业 AI 落地。FDE 带着 AI 驻场业务一线，对业务结果负责，而不是对工时或需求文档负责。工作自下而上分三层：
   - 标准化（把经验写成规则）：跟岗访谈业务骨干，用 AI 从历史邮件、报价单和聊天记录中归纳 SOP、产品参数主数据、报价规则与询盘分级标准，由业务负责人审定。
   - 信息化（把规则装进系统）：用 AI 辅助数据清洗、字段映射和接口脚本，打通独立站表单、邮件、WhatsApp、CRM 与 ERP，配好权限、日志和管理看板。
   - 智能化（让 AI 在系统上干活）：在规则和数据之上部署 AI 客服、询盘分级、报价助手与会前商业情报，每个场景配评测集和人工复核点，按周调优。
   每周一轮“观察-原型-试用-沉淀”，从一个高价值场景切入，2 ~ 4 周跑通第一个闭环，按层验收。离场时源码、数据、文档归企业，并培养企业内部 AI 骨干。核心观点：没有标准化的智能化，只是把混乱自动化。`;

// Enterprise Knowledge Base definition for Grounded Pre-Sales Consultant
const SYSTEM_KNOWLEDGE_INSTRUCTION = `
你是“云端智荐”的资深 AI 出海售前咨询顾问。
云端智荐定位是“中国出海企业 AI 售前支持系统 + 能力样板间”。

【${SERVICE_COUNT_CN}大核心服务与解决的五大断点】：
1. 海外独立站建站（解决“读不懂”）：针对海外买家、Google、AI 三类读者协同构建。解决传统画册型官网无人能懂的问题。
2. 外贸 SEO 优化（解决“看不见”）：E-E-A-T 质量框架、关键词集群、让海外买家在 Google 首页找到你。
3. 出海 GEO 优化（解决“不被信”）：生成式引擎优化，让 ChatGPT、Perplexity、Gemini 等 AI 答案直接推荐客户品牌。六步闭环：诊断、建模、内容、信源、口碑、监测。
4. AI 智能客服及系统对接（解决“接不住”${SHOW_FDE ? '' : '与“连不上”'}）：7×24小时跨时区接住海外询盘，多语种即时答复，结构化抽取需求，直连 CRM、企业微信与邮件。
${SHOW_FDE ? FDE_KNOWLEDGE : ''}

【代表案例】：
- 爱康医疗（港股上市，骨科植入物）：现有国内官网 (ak-medical.net) 的 GEO / SEO 评分为 47 分；我们为其新建英文海外官网 (ak-medical-global.com)，经 4 类海外决策者建模、全年 91 项英文权威内容规划与信源建设，海外官网评分达到 95 分（两站同一口径对比，不是同一站点改造前后的分数），ChatGPT 连续数月带来真实引荐高意向访问。
- 泰宁科创：60 组英文核心词库体系，英国 SuDS 规范合规指南，将国标参编转化为海外 AI 认可的权威工程佐证。

【报价规则】：
- 首页的 AI 可见性测评免费提供。
- 不公开任何服务价格、预算区间、折扣或付款比例，回答中不给出任何金额数字。客户问到费用时，说明投入取决于 SKU 规模、目标市场、语种与需要打通的系统，需在诊断会后由架构师出具定制方案。
- 绝不对任何未实测客户承诺“保证第一名”或虚假夸大。

【你的任务与风格】：
1. 用专业、客观、严谨、有洞察力的语气回答外贸决策者（老板、外贸总监、IT 负责人）。
2. 在回答最后，自然引导客户下一步行动（如：在首页进行 AI 可见性测评、使用方案规划工具、或预约 30 分钟线上诊断会）。站内没有其他自测或体验页面，不要推荐不存在的工具。
3. 必须输出结构化的意向评估（提取：行业、官网、目标市场、意向等级 HIGH/MEDIUM/LOW、建议推荐服务与下一步动作）。
${SHOW_FDE ? '' : '4. 不提及 FDE 或驻场工程师服务；客户问到驻场支持时，引导其预约 60 分钟技术对接评估会，沟通系统对接需求。\n'}`;

// API: Check health & Gemini status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// API: AI Pre-sales Consultant Chat
app.post('/api/gemini/chat', async (req, res) => {
  const { message, history = [], userContext = {} } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If Gemini API is available, call it
  if (ai) {
    try {
      const prompt = `
访客上下文：
- 职位/角色: ${userContext.role || '未提供'}
- 企业名称: ${userContext.company || '未提供'}
- 行业领域: ${userContext.industry || '出海制造/科技'}
- 已测断点: ${userContext.frictions?.join(', ') || '未测评'}

访客最新消息：
"${message}"

请以资深售前专家身份进行解答，并返回纯 JSON 格式：
{
  "answer": "对访客的详细专业解答（包含观点支撑、案例依据与下一步建议）",
  "intent": "HIGH | MEDIUM | LOW",
  "intentReason": "判定意向的依据说明",
  "extractedFields": {
    "industry": "提取的行业",
    "targetMarkets": "提取的目标市场",
    "budgetSignal": "预算信号",
    "timeline": "上线时间预期"
  },
  "recommendedServices": ["服务名称1", "服务名称2"],
  "suggestedNextAction": "下一步建议（如：预约30分钟诊断会 / 进行AI可见性测评）",
  "sourceCitations": ["知识库引用出处1", "引用出处2"]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_KNOWLEDGE_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (parseErr) {
        return res.json({
          answer: responseText,
          intent: 'MEDIUM',
          intentReason: '自然语言应答解析',
          extractedFields: {},
          recommendedServices: ['出海GEO优化', 'AI智能客服及系统对接'],
          suggestedNextAction: '建议在首页完成“AI 可见性测评”，免费查看品牌在 ChatGPT、Perplexity 与 Google 中的表现。',
          sourceCitations: ['《云端智荐知识库 · 售前五大断点总览》'],
        });
      }
    } catch (err: any) {
      console.error('Gemini API execution error:', err?.message || err);
      // Fall through to deterministic intelligence
    }
  }

  // High-fidelity deterministic fallback if API key is not yet set
  const lowerMsg = message.toLowerCase();
  let answer = '';
  let intent: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let intentReason = '常规业务咨询';
  const recommendedServices: string[] = [];
  let suggestedNextAction = '建议在首页完成“AI 可见性测评”，再用“方案规划”匹配最适合的服务组合。';
  const citations = ['《云端智荐 AI 出海白皮书》', '《出海企业五大断点治理指南》'];

  if (lowerMsg.includes('geo') || lowerMsg.includes('chatgpt') || lowerMsg.includes('ai推荐') || lowerMsg.includes('可见性')) {
    answer = `GEO（生成式引擎优化）是我们最具差异化的旗舰服务。不同于传统 SEO 仅在搜索结果列表排位，GEO 的核心是让 ChatGPT、Perplexity、Gemini 等主流 AI 在直接向海外采购商推荐供应商时，首选并权威引用您的品牌。\n\n我们通过六步闭环（诊断、建模、内容、信源、口碑、监测）建立权威证据链。以爱康医疗为例，其现有国内官网的 GEO / SEO 评分仅 47 分，我们新建的海外官网达到 95 分，ChatGPT 连续数月带来真实高意向采购商访问。`;
    intent = 'HIGH';
    intentReason = '主动咨询最新 GEO 旗舰技术，具备强烈获客升级意向';
    recommendedServices.push('出海 GEO 优化', '外贸 SEO 优化');
    suggestedNextAction = '立即在首页进行“AI 可见性测评”，免费检测您的品牌在 ChatGPT、Perplexity 里的实时推荐率。';
    citations.push('《爱康医疗全球独立站与 GEO 落地案例》');
  } else if (lowerMsg.includes('客服') || lowerMsg.includes('询盘') || lowerMsg.includes('crm') || lowerMsg.includes('漏单')) {
    answer = `海外客户存在 12 小时以上的跨时区时差，超 68% 的高价值询盘发生在我国凌晨。传统表单或人工响应通常需要等到次日上午，采购商早已向竞争对手询价。\n\n云端智荐的 AI 智能客服基于您企业的结构化知识库（参数表、认证、工程案例），在 03:00 凌晨以多语种即时答复买家技术疑问，并智能抽取采购数量、交期要求，自动写入您的 CRM/企业微信，实现“销售早晨上班直接发精准报价单”。`;
    intent = 'HIGH';
    intentReason = '关注询盘漏单与转化流失痛点，对应智能客服商机';
    recommendedServices.push('AI 智能客服及系统对接');
    suggestedNextAction = '建议用“方案规划”查看 AI 客服的交付周期与交付物，或预约 30 分钟诊断会演示凌晨询盘的接待流程。';
    citations.push('《凌晨三点询盘自动化流转标准》');
  } else if (lowerMsg.includes('多少钱') || lowerMsg.includes('价格') || lowerMsg.includes('费用') || lowerMsg.includes('预算') || lowerMsg.includes('报价')) {
    answer = `我们不在线上提供统一报价。独立站、SEO、GEO、AI 客服${SHOW_FDE ? '与 FDE 驻场' : ''}的投入取决于产品 SKU 规模、目标市场与语种数量、年度内容量以及需要打通的企业系统，每家企业差异很大。\n\n建议分两步：先用站内“方案规划”组合服务，查看交付周期、阶段排期与交付物清单；再预约 30 分钟诊断会，由架构师结合实测结果出具定制方案。`;
    intent = 'HIGH';
    intentReason = '询问合作费用，进入高意向商务评估阶段';
    recommendedServices.push(`整体服务组合（${SERVICE_COUNT_CN}项全做）`);
    suggestedNextAction = '建议打开站内“方案规划”查看交付周期与交付物，再预约 30 分钟诊断会获取定制方案。';
  } else if (SHOW_FDE && (lowerMsg.includes('fde') || lowerMsg.includes('驻场') || lowerMsg.includes('工程师'))) {
    answer = `FDE（Forward Deployed Engineer，前线部署工程师）源自 Palantir，如今 OpenAI、Anthropic 等 AI 公司也在用它推动企业 AI 落地。咨询给的是建议，外包给的是代码，SaaS 给的是账号，而 FDE 带着 AI 驻场您的业务一线，对业务结果负责。\n\nFDE 的工作自下而上分三层：\n- 标准化：把老业务员的报价、询盘分级等经验写成规则\n- 信息化：把规则装进系统，打通独立站、邮件、WhatsApp、CRM 与 ERP\n- 智能化：在干净的数据上让 AI 客服、报价助手等场景真正干活\n\n每周一轮“观察-原型-试用-沉淀”，离场时源码、数据、文档和会用的人都留给企业。`;
    intent = 'MEDIUM';
    intentReason = '了解交付模式与技术落地保障';
    recommendedServices.push('FDE 驻场工程师服务');
    suggestedNextAction = '建议预约 60 分钟技术对接评估会，与我们的技术专家面对面梳理系统现状。';
  } else {
    answer = `您好！我是云端智荐 AI 售前顾问。我们专注解决中国企业出海获客全链路的五大断点：看不见（SEO/GEO）、读不懂（独立站）、不被信（权威内容）、接不住（AI 客服）、连不上（${SHOW_FDE ? '经验、系统与 AI 没打通，由 FDE 驻场解决' : '询盘与 CRM、ERP 系统没打通'}）。\n\n您可以告诉我您企业的主营产品和目前海外获客遇到的主要困扰，我将为您梳理最精准的破局路径。`;
    intent = 'LOW';
    intentReason = '初次探索交流';
    recommendedServices.push('AI 可见性测评', '独立站建站');
  }

  res.json({
    answer,
    intent,
    intentReason,
    extractedFields: {
      industry: userContext.industry || '海外出口制造',
      targetMarkets: '欧美/一带一路',
      budgetSignal: intent === 'HIGH' ? '具备采购预算意向' : '信息探索中',
      timeline: '近 1-3 个月',
    },
    recommendedServices,
    suggestedNextAction,
    sourceCitations: citations,
  });
});

// API: AI Visibility Assessment (Simulated multi-platform test using Gemini if available)
app.post('/api/gemini/visibility-test', async (req, res) => {
  const { companyName, website, category, targetMarket, competitors = [] } = req.body;

  if (!companyName || !category) {
    return res.status(400).json({ error: 'Company name and category are required' });
  }

  const defaultCompetitors = competitors.filter(Boolean).length > 0
    ? competitors
    : ['Global Leader A', 'European Brand B', 'Asian Competitor C'];

  if (ai) {
    try {
      const prompt = `
针对出海企业进行 AI 可见性（GEO）测评模拟：
企业名称: ${companyName}
企业官网: ${website || '未填'}
主营品类: ${category}
目标市场: ${targetMarket || '北美/欧洲'}
对比竞品: ${defaultCompetitors.join(', ')}

请分析该品类海外买家向 ChatGPT, Perplexity, Gemini, Claude 提问时的典型场景，评估该企业与竞品的 AI 可见性表现。
返回纯 JSON 格式：
{
  "visibilityScore": 48,
  "rankingAverage": 4.2,
  "sentimentScore": 72,
  "competitorComparisons": [
    { "name": "${companyName}", "score": 48, "rank": 4.2 },
    { "name": "${defaultCompetitors[0] || '竞品A'}", "score": 88, "rank": 1.4 },
    { "name": "${defaultCompetitors[1] || '竞品B'}", "score": 75, "rank": 2.1 }
  ],
  "samplePrompts": [
    {
      "platform": "ChatGPT-4o",
      "prompt": "Top reliable ${category} manufacturers with ISO certification in Asia",
      "aiAnswerSnippet": "While European suppliers lead in market share, notable alternatives include...",
      "mentionedCompany": false,
      "sourcesCited": ["Wikipedia", "Industry Journal", "Global Sources"]
    },
    {
      "platform": "Perplexity Pro",
      "prompt": "Best B2B ${category} suppliers for European standard projects",
      "aiAnswerSnippet": "According to EN standards and municipal specs, primary suppliers include...",
      "mentionedCompany": true,
      "sourcesCited": ["Supplier Global Portal", "Trade Fair Catalog"]
    }
  ],
  "weaknesses": [
    "缺乏结构化英文白皮书与技术参数公开定义",
    "第三方学术与行业媒体信源引用严重不足",
    "官网未配置 Schema DefinedTerm 结构化数据导致 AI 检索难索引"
  ],
  "actionableSteps": [
    "首月规划针对核心品类的 20 组海外买家问题簇",
    "发布符合 Schema 规范的英文技术对比指南",
    "在行业主流媒体与权威标准目录完成知识资产铺设"
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (e: any) {
      console.warn('Gemini visibility test fallback:', e?.message || e);
    }
  }

  // Realistic mock assessment
  res.json({
    visibilityScore: 42,
    rankingAverage: 4.6,
    sentimentScore: 68,
    competitorComparisons: [
      { name: companyName, score: 42, rank: 4.6 },
      { name: defaultCompetitors[0] || '国际头部竞品', score: 89, rank: 1.3 },
      { name: defaultCompetitors[1] || '区域领先品牌', score: 76, rank: 2.2 },
    ],
    samplePrompts: [
      {
        platform: 'ChatGPT',
        prompt: `Who are the leading manufacturers of ${category} for industrial applications?`,
        aiAnswerSnippet: `Top recognized suppliers in the international market include tier-1 global brands. For Asian manufacturers, certain certified suppliers are noted, but detailed technical documentation for ${companyName} is currently sparse in the primary training corpus.`,
        mentionedCompany: false,
        sourcesCited: ['Industry Benchmark Report 2025', 'ThomasNet', 'Global Trade Association'],
      },
      {
        platform: 'Perplexity',
        prompt: `Recommended certified suppliers for ${category} meeting CE/FDA standards`,
        aiAnswerSnippet: `Based on public citations, European and US manufacturers are heavily indexed. ${companyName} has partial indexing from exhibition listings, but lacks dedicated technical case studies.`,
        mentionedCompany: true,
        sourcesCited: ['Exhibition Directory', 'ISO Certification Registry'],
      },
    ],
    weaknesses: [
      '缺乏有定义、有数据、有结构的海外英文技术内容',
      '第三方权威信源（学术期刊、行业测评、海外展会）缺少指回官网的引用链路',
      '官网技术底座未做 AI 爬虫优化，robots.txt 与服务端渲染不完善',
    ],
    actionableSteps: [
      '通过决策者建模梳理 30+ 真实海外买家问题簇',
      '发布 10 篇以上带数据表格的高权重白皮书与对比指南',
      '在 LinkedIn、行业权威媒体同步发布口径一致的知识资产',
    ],
  });
});

// Setup Vite middleware in dev or static server in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Cloud Wisdom Pre-Sales System running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
