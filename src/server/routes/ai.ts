/**
 * /api/gemini/chat（AI 售前顾问）与 /api/gemini/visibility-test（旧的模拟测评，前端已不再调用）。
 * 修改 chat 响应字段时同步三处：提示词里的 JSON 模板、chatFallback、前端 AiConsultantModal 的 ChatMessage。
 */
import { config } from '../config';
import { gemini } from '../gemini';
import { json, readJSON, route, str } from '../http';
import { serviceCountCN, systemKnowledge } from '../knowledge';
import { CONTACTS } from '../../data/contactsData';

const orDefault = (s: string, def: string) => (s ? s : def);

/** 模型输出是合法的 JSON 对象时原样透传，保留模型返回的全部字段 */
function asJSONObject(text: string): string | null {
  const t = text.trim();
  if (!t.startsWith('{')) return null;
  try {
    JSON.parse(t);
    return t;
  } catch {
    return null;
  }
}

const rawJSON = (body: string) => new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });

interface ChatRequest {
  message: string;
  /** 访客界面语言：en 时回答全部用英文 */
  lang: 'zh' | 'en';
  role: string;
  company: string;
  industry: string;
  frictions: string[];
}

export const chat = route(async (req) => {
  const body = await readJSON(req);
  const uc = (body.userContext && typeof body.userContext === 'object' ? body.userContext : {}) as Record<string, unknown>;
  const r: ChatRequest = {
    message: str(body.message),
    lang: str(body.lang) === 'en' ? 'en' : 'zh',
    role: str(uc.role),
    company: str(uc.company),
    industry: str(uc.industry),
    frictions: Array.isArray(uc.frictions) ? uc.frictions.filter((f): f is string => typeof f === 'string') : [],
  };
  if (!r.message) return json({ error: 'Message is required' }, 400);

  const g = gemini();
  if (g) {
    const frictions = r.frictions.length > 0 ? r.frictions.join(', ') : '未测评';
    const prompt = `
访客上下文：
- 职位/角色: ${orDefault(r.role, '未提供')}
- 企业名称: ${orDefault(r.company, '未提供')}
- 行业领域: ${orDefault(r.industry, '出海制造/科技')}
- 已测卡点: ${frictions}

访客最新消息：
"${r.message}"

${r.lang === 'en' ? '本次访客使用英文界面：answer、intentReason、extractedFields 的值、recommendedServices、suggestedNextAction 全部用英文撰写（覆盖知识库中“用中文回答”的要求）；sourceCitations 使用英文书名。\n' : ''}
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
    try {
      const text = await g.generateJSON(systemKnowledge(config().showFDE), prompt, 0.7, AbortSignal.timeout(60_000));
      const obj = asJSONObject(text);
      if (obj) return rawJSON(obj);
      return json({
        answer: text,
        intent: 'MEDIUM',
        intentReason: '自然语言应答解析',
        extractedFields: {},
        recommendedServices: ['出海GEO优化', 'AI智能客服及系统对接'],
        suggestedNextAction: '建议在首页完成“AI 可见性测评”，免费查看品牌在 ChatGPT、Perplexity 与 Google 中的表现。',
        sourceCitations: ['《云端智荐知识库 · 售前五个卡点总览》'],
      });
    } catch (err) {
      console.warn('Gemini chat error:', err);
    }
  }
  return json(r.lang === 'en' ? chatFallbackEn(r) : chatFallback(r));
});

/** 无 key / 调用失败时的确定性关键词匹配结果 */
function chatFallback(r: ChatRequest) {
  const show = config().showFDE;
  const count = serviceCountCN(show);
  const msg = r.message.toLowerCase();
  const has = (...words: string[]) => words.some((w) => msg.includes(w));

  let answer: string;
  let intent = 'MEDIUM';
  let intentReason = '常规业务咨询';
  const services: string[] = [];
  let next = '建议在首页完成“AI 可见性测评”，再用“方案规划”匹配最适合的服务组合。';
  const citations = ['《云端智荐服务说明》', '《出海学院课程》'];

  if (has('联系', '电话', '手机', '人工', '客户经理', '负责人', '微信')) {
    const list = CONTACTS.map((c) => `- ${c.title}：${c.name}，手机 ${c.phone}`).join('\n');
    answer = `您可以直接联系我们的售前同事：\n${list}\n\n电话沟通前，建议先在首页完成“AI 可见性测评”，把测评结果一并发给我们，沟通会更有针对性。`;
    intent = 'HIGH';
    intentReason = '主动索要联系方式，希望与人工售前沟通';
    next = '直接致电上方联系人，或预约 30 分钟线上诊断会。';
  } else if (has('geo', 'chatgpt', 'ai推荐', '可见性')) {
    answer =
      'GEO（生成式引擎优化）是我们最具差异化的旗舰服务。不同于传统 SEO 仅在搜索结果列表排位，GEO 的核心是让 ChatGPT、Perplexity、Gemini 等主流 AI 在直接向海外采购商推荐供应商时，首选并权威引用您的品牌。\n\n我们通过六步闭环（诊断、建模、内容、信源、口碑、监测）建立权威证据链。以爱康医疗为例，其现有国内官网的 GEO / SEO 评分仅 47 分，我们新建的海外官网达到 95 分，ChatGPT 连续数月带来真实高意向采购商访问。';
    intent = 'HIGH';
    intentReason = '主动咨询最新 GEO 旗舰技术，具备强烈获客升级意向';
    services.push('出海 GEO 优化', '外贸 SEO 优化');
    next = '立即在首页进行“AI 可见性测评”，免费检测您的品牌在 ChatGPT、Perplexity 里的实时推荐率。';
    citations.push('《爱康医疗全球独立站与 GEO 落地案例》');
  } else if (has('客服', '询盘', 'crm', '漏单')) {
    answer =
      '海外客户存在 12 小时以上的跨时区时差，超 68% 的高价值询盘发生在我国凌晨。传统表单或人工响应通常需要等到次日上午，采购商早已向竞争对手询价。\n\n云端智荐的 AI 智能客服基于您企业的结构化知识库（参数表、认证、工程案例），在 03:00 凌晨以多语种即时答复买家技术疑问，并智能抽取采购数量、交期要求，自动写入您的 CRM/企业微信，实现“销售早晨上班直接发精准报价单”。';
    intent = 'HIGH';
    intentReason = '关注询盘漏单与转化流失痛点，对应智能客服商机';
    services.push('AI 智能客服及系统对接');
    next = '建议用“方案规划”查看 AI 客服的交付周期与交付物，或预约 30 分钟诊断会演示凌晨询盘的接待流程。';
    citations.push('《凌晨三点询盘自动化流转标准》');
  } else if (has('多少钱', '价格', '费用', '预算', '报价')) {
    const fdeWord = show ? '与 FDE 驻场' : '';
    answer = `我们不在线上提供统一报价。独立站、SEO、GEO、AI 客服${fdeWord}的投入取决于产品 SKU 规模、目标市场与语种数量、年度内容量以及需要打通的企业系统，每家企业差异很大。\n\n建议分两步：先用站内“方案规划”组合服务，查看交付周期、阶段排期与交付物清单；再预约 30 分钟诊断会，由架构师结合实测结果出具定制方案。`;
    intent = 'HIGH';
    intentReason = '询问合作费用，进入高意向商务评估阶段';
    services.push(`整体服务组合（${count}项全做）`);
    next = '建议打开站内“方案规划”查看交付周期与交付物，再预约 30 分钟诊断会获取定制方案。';
  } else if (show && has('fde', '驻场', '工程师')) {
    answer =
      'FDE（Forward Deployed Engineer，前线部署工程师）源自 Palantir，如今 OpenAI、Anthropic 等 AI 公司也在用它推动企业 AI 落地。咨询给的是建议，外包给的是代码，SaaS 给的是账号，而 FDE 带着 AI 驻场您的业务一线，对业务结果负责。\n\nFDE 的工作自下而上分三层：\n- 标准化：把老业务员的报价、询盘分级等经验写成规则\n- 信息化：把规则装进系统，打通独立站、邮件、WhatsApp、CRM 与 ERP\n- 智能化：在干净的数据上让 AI 客服、报价助手等场景真正干活\n\n每周一轮“观察-原型-试用-沉淀”，离场时源码、数据、文档和会用的人都留给企业。';
    intentReason = '了解交付模式与技术落地保障';
    services.push('FDE 驻场工程师服务');
    next = '建议预约 60 分钟技术对接评估会，与我们的技术专家面对面梳理系统现状。';
  } else {
    const connect = show ? '经验、系统与 AI 没打通，由 FDE 驻场解决' : '询盘与 CRM、ERP 系统没打通';
    answer = `您好！我是云端智荐 AI 售前顾问。我们专注解决中国企业出海获客全链路的五个卡点：看不见（SEO/GEO）、读不懂（独立站）、不被信（权威内容）、接不住（AI 客服）、连不上（${connect}）。\n\n您可以告诉我您企业的主营产品和目前海外获客遇到的主要困扰，我将为您梳理最精准的破局路径。`;
    intent = 'LOW';
    intentReason = '初次探索交流';
    services.push('AI 可见性测评', '独立站建站');
  }

  return {
    answer,
    intent,
    intentReason,
    extractedFields: {
      industry: orDefault(r.industry, '海外出口制造'),
      targetMarkets: '欧美/一带一路',
      budgetSignal: intent === 'HIGH' ? '具备采购预算意向' : '信息探索中',
      timeline: '近 1-3 个月',
    },
    recommendedServices: services,
    suggestedNextAction: next,
    sourceCitations: citations,
  };
}

/** 英文界面下无 key / 调用失败时的确定性关键词匹配结果，与 chatFallback 的分支一一对应 */
function chatFallbackEn(r: ChatRequest) {
  const show = config().showFDE;
  const countEn = show ? 'five' : 'four';
  const msg = r.message.toLowerCase();
  const has = (...words: string[]) => words.some((w) => msg.includes(w));

  let answer: string;
  let intent = 'MEDIUM';
  let intentReason = 'General business question';
  const services: string[] = [];
  let next = 'Run the AI visibility audit on the homepage first, then use the Project planner to match the right service package.';
  const citations = ['ChinGEO services overview', 'ChinGEO Export Academy courses'];

  if (has('contact', 'phone', 'call', 'human', 'account manager', 'talk to', 'speak to', 'wechat')) {
    const list = CONTACTS.map((c) => `- ${c.titleEn}: ${c.nameEn}, phone ${c.phone}`).join('\n');
    answer = `You can contact our pre-sales team directly:\n${list}\n\nBefore calling, we suggest running the AI visibility audit on the homepage and sending us the results, so the conversation can be more specific.`;
    intent = 'HIGH';
    intentReason = 'Asked for contact details and wants to speak to a person';
    next = 'Call the contacts above directly, or book a 30-minute online diagnosis call.';
  } else if (has('geo', 'chatgpt', 'perplexity', 'gemini', 'visibility', 'recommend')) {
    answer =
      'GEO (generative engine optimisation) is our most distinctive flagship service. Unlike traditional SEO, which only competes for positions in a results list, GEO aims to make ChatGPT, Perplexity, Gemini and other leading AI tools name and cite your brand first when they recommend suppliers to overseas buyers.\n\nWe build the evidence chain through a six-step closed loop: diagnosis, modelling, content, sources, reputation and monitoring. Aikang Medical is an example: its domestic site scored 47 on GEO / SEO, while the new overseas site scored 95, and ChatGPT has sent high-intent overseas buyers for several months.';
    intent = 'HIGH';
    intentReason = 'Asked about the flagship GEO service, with a strong intent to upgrade lead generation';
    services.push('Export GEO', 'Export SEO');
    next = 'Run the free AI visibility audit on the homepage now to check how often your brand is recommended in ChatGPT and Perplexity.';
    citations.push('Aikang Medical global site and GEO case');
  } else if (has('enquir', 'inquir', 'crm', 'lead', 'overnight', 'after hours', 'missed', 'customer service')) {
    answer =
      'Overseas buyers face a time-zone gap of more than 12 hours, and a large share of high-value enquiries arrive during the Chinese night. Traditional forms or manual replies usually wait until the next morning, and by then the buyer has already asked your competitors.\n\nChinGEO AI customer service works from your structured knowledge base (parameter sheets, certifications, engineering cases). At 3 a.m. it replies to technical questions in several languages, extracts order quantity and lead-time requirements, and writes them to your CRM and WeCom, so the salesperson can send an accurate quotation as soon as they start work.';
    intent = 'HIGH';
    intentReason = 'Concerned about lost enquiries and conversion leakage, which points to an AI customer service opportunity';
    services.push('AI customer service and system integration');
    next = 'Use the Project planner to see the AI customer service timeline and deliverables, or book a 30-minute diagnosis call to see how an overnight enquiry is handled.';
    citations.push('Standard for automated overnight enquiry routing');
  } else if (has('price', 'cost', 'budget', 'quote', 'how much', 'fee')) {
    const fdeWord = show ? ', and FDE on-site engineering' : '';
    answer = `We do not publish a standard price online. The investment for websites, SEO, GEO and AI customer service${fdeWord} depends on the number of products, target markets and languages, the annual content volume and the company systems to be integrated, and it varies widely from company to company.\n\nTwo steps: use the Project planner on this site to combine services and review timelines and deliverables, then book a 30-minute diagnosis call so an architect can prepare a tailored plan based on real test results.`;
    intent = 'HIGH';
    intentReason = 'Asked about cost, so the conversation has moved into a high-intent commercial assessment';
    services.push(`Full package (all ${countEn} services)`);
    next = 'Open the Project planner to review timelines and deliverables, then book a 30-minute diagnosis call for a tailored plan.';
  } else if (show && has('fde', 'on-site', 'onsite', 'forward deployed', 'engineer')) {
    answer =
      'An FDE (forward deployed engineer) originated at Palantir, and OpenAI and Anthropic now use the role to bring AI into real businesses. Consulting gives advice, outsourcing gives code, SaaS gives an account, while an FDE works alongside your front line and is accountable for business results.\n\nThe FDE builds in three layers from the bottom up:\n- Standardisation: write veteran salespeople’s experience, such as quoting and enquiry grading, as rules\n- Digitisation: load the rules into systems and connect your website, email, WhatsApp, CRM and ERP\n- Intelligence: let AI customer service, quoting assistants and other scenarios do real work on clean data\n\nEach week goes through one observe–prototype–trial–consolidate cycle. When the FDE leaves, the source code, data, documents and trained people stay with your company.';
    intentReason = 'Wants to understand the delivery model and technical safeguards';
    services.push('FDE on-site engineering service');
    next = 'Book a 60-minute technical integration review to go through your current systems face to face with our technical experts.';
  } else {
    const connect = show ? 'experience, systems and AI are not yet connected, to be solved by an FDE on-site' : 'enquiries are not yet connected to the CRM and ERP';
    answer = `Hello. I am the ChinGEO AI pre-sales advisor. We focus on the five bottlenecks in an export company’s overseas lead-generation chain: invisible (SEO/GEO), hard to read (websites), not trusted (authoritative content), can’t keep up (AI customer service), and not connected (${connect}).\n\nTell me about your main products and the biggest challenges you face in overseas lead generation today, and I will map out the most precise route forward.`;
    intent = 'LOW';
    intentReason = 'Early exploratory conversation';
    services.push('AI visibility audit', 'Overseas websites');
  }

  return {
    answer,
    intent,
    intentReason,
    extractedFields: {
      industry: orDefault(r.industry, 'Export manufacturing'),
      targetMarkets: 'Europe and US / Belt and Road',
      budgetSignal: intent === 'HIGH' ? 'Has a purchase budget in view' : 'Still exploring',
      timeline: 'Within 1–3 months',
    },
    recommendedServices: services,
    suggestedNextAction: next,
    sourceCitations: citations,
  };
}

export const visibilityTest = route(async (req) => {
  const body = await readJSON(req);
  const name = str(body.companyName);
  const cat = str(body.category);
  const website = str(body.website);
  const targetMarket = str(body.targetMarket);
  if (!name || !cat) return json({ error: 'Company name and category are required' }, 400);
  let comps = Array.isArray(body.competitors) ? body.competitors.filter((c): c is string => typeof c === 'string' && c !== '') : [];
  if (comps.length === 0) comps = ['Global Leader A', 'European Brand B', 'Asian Competitor C'];
  const pick = (i: number, def: string) => comps[i] || def;

  const g = gemini();
  if (g) {
    const prompt = `
针对出海企业进行 AI 可见性（GEO）测评模拟：
企业名称: ${name}
企业官网: ${orDefault(website, '未填')}
主营品类: ${cat}
目标市场: ${orDefault(targetMarket, '北美/欧洲')}
对比竞品: ${comps.join(', ')}

请分析该品类海外买家向 ChatGPT, Perplexity, Gemini, Claude 提问时的典型场景，评估该企业与竞品的 AI 可见性表现。
返回纯 JSON 格式：
{
  "visibilityScore": 48,
  "rankingAverage": 4.2,
  "sentimentScore": 72,
  "competitorComparisons": [
    { "name": "${name}", "score": 48, "rank": 4.2 },
    { "name": "${pick(0, '竞品A')}", "score": 88, "rank": 1.4 },
    { "name": "${pick(1, '竞品B')}", "score": 75, "rank": 2.1 }
  ],
  "samplePrompts": [
    {
      "platform": "ChatGPT-4o",
      "prompt": "Top reliable ${cat} manufacturers with ISO certification in Asia",
      "aiAnswerSnippet": "While European suppliers lead in market share, notable alternatives include...",
      "mentionedCompany": false,
      "sourcesCited": ["Wikipedia", "Industry Journal", "Global Sources"]
    },
    {
      "platform": "Perplexity Pro",
      "prompt": "Best B2B ${cat} suppliers for European standard projects",
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
    try {
      const obj = asJSONObject(await g.generateJSON('', prompt, 0.5, AbortSignal.timeout(60_000)));
      if (obj) return rawJSON(obj);
    } catch (err) {
      console.warn('Gemini visibility fallback:', err);
    }
  }

  return json({
    visibilityScore: 42,
    rankingAverage: 4.6,
    sentimentScore: 68,
    competitorComparisons: [
      { name, score: 42, rank: 4.6 },
      { name: pick(0, '国际头部竞品'), score: 89, rank: 1.3 },
      { name: pick(1, '区域领先品牌'), score: 76, rank: 2.2 },
    ],
    samplePrompts: [
      {
        platform: 'ChatGPT',
        prompt: `Who are the leading manufacturers of ${cat} for industrial applications?`,
        aiAnswerSnippet: `Top recognized suppliers in the international market include tier-1 global brands. For Asian manufacturers, certain certified suppliers are noted, but detailed technical documentation for ${name} is currently sparse in the primary training corpus.`,
        mentionedCompany: false,
        sourcesCited: ['Industry Benchmark Report 2025', 'ThomasNet', 'Global Trade Association'],
      },
      {
        platform: 'Perplexity',
        prompt: `Recommended certified suppliers for ${cat} meeting CE/FDA standards`,
        aiAnswerSnippet: `Based on public citations, European and US manufacturers are heavily indexed. ${name} has partial indexing from exhibition listings, but lacks dedicated technical case studies.`,
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
