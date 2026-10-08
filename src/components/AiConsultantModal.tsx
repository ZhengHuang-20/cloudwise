import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, Loader2, Sliders, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Bi, useLang } from '../context/LanguageContext';
import { Dialog } from './ui/Dialog';
import { SERVICE_COUNT_CN, SERVICE_COUNT_EN, SHOW_FDE } from '../lib/features';

const QUICK_PROMPTS: Bi[] = [
  { zh: '爱康医疗案例具体是怎么做的？', en: 'How did the Aikang Medical project actually work?' },
  { zh: 'GEO 和传统 SEO 有什么核心区别？', en: 'What is the core difference between GEO and traditional SEO?' },
  { zh: '做一套整体方案大概花多少钱？', en: 'Roughly how much does a full project cost?' },
  { zh: '凌晨三点的海外询盘怎么接住？', en: 'How do we catch an overseas enquiry at 3 a.m.?' },
];

const INTENT_LABEL: Record<string, { text: Bi; className: string }> = {
  HIGH: { text: { zh: '高意向', en: 'High intent' }, className: 'text-success' },
  MEDIUM: { text: { zh: '中意向', en: 'Medium intent' }, className: 'text-warning' },
  LOW: { text: { zh: '低意向', en: 'Low intent' }, className: 'text-label-secondary' },
};

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  /** 'now' 表示刚刚，渲染时按界面语言显示 */
  timestamp: string;
  intent?: 'HIGH' | 'MEDIUM' | 'LOW';
  intentReason?: string;
  extractedFields?: Record<string, any>;
  recommendedServices?: string[];
  suggestedNextAction?: string;
  sourceCitations?: string[];
}

export const AiConsultantModal: React.FC = () => {
  const {
    isAiAdvisorOpen,
    setAiAdvisorOpen,
    isInspectorMode,
    setIsInspectorMode,
    aiAdvisorInitialQuery,
    user,
    latestDiagnosis,
    logLeadActivity
  } = useApp();
  const { t, tb, lang } = useLang();

  // 欢迎语不存进消息列表，渲染时按当前语言生成，切换语言后立即生效
  const welcome: ChatMessage = {
    id: 'welcome',
    sender: 'assistant',
    text: t(
      `您好！我是云端智荐官方 AI 售前顾问。\n\n我们专为中国出海企业打通“独立站、SEO、GEO、AI 客服${SHOW_FDE ? '及 FDE 驻场' : '及系统对接'}”，覆盖从获客到转化的各个环节。您可以向我询问技术方案、爱康医疗实战案例、交付周期与实施路径，或告诉我您目前的出海痛点。`,
      `Hello, and welcome. I am the official AI pre-sales advisor for ChinGEO.\n\nWe connect ${SERVICE_COUNT_EN.toLowerCase()} services for Chinese companies going global: websites, SEO, GEO, AI customer service${SHOW_FDE ? ' and FDE on-site engineering' : ' and system integration'}, covering every step from lead generation to conversion. Ask me about technical plans, the Aikang Medical case, delivery timelines and implementation paths, or tell me about the export challenges you face today.`
    ),
    timestamp: 'now',
    intent: 'LOW',
    intentReason: t('初始系统接待', 'Initial greeting'),
    sourceCitations: [
      t(`《云端智荐知识库 · ${SERVICE_COUNT_CN}项服务总则》`, `ChinGEO knowledge base · ${SERVICE_COUNT_EN} services overview`),
    ],
    suggestedNextAction: t(
      '点击下方的快捷问题开始，或打开右上角的“CRM 透视”，看我如何实时提取采购意向。',
      'Start with a quick question below, or open “CRM view” at the top right to see how I pick up purchase intent in real time.'
    ),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const allMessages = [welcome, ...messages];

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading, isAiAdvisorOpen]);

  useEffect(() => {
    if (aiAdvisorInitialQuery) {
      sendMessage(aiAdvisorInitialQuery);
    }
  }, [aiAdvisorInitialQuery]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          lang,
          userContext: {
            name: user?.name,
            company: user?.companyName,
            industry: user?.industry,
            role: user?.role,
            frictions: latestDiagnosis ? [latestDiagnosis.toolName] : [],
          },
        }),
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || t('感谢您的咨询，我们将为您梳理最贴合的方案。', 'Thank you for your question. We will outline the most suitable plan for you.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent || 'MEDIUM',
        intentReason: data.intentReason,
        extractedFields: data.extractedFields,
        recommendedServices: data.recommendedServices,
        suggestedNextAction: data.suggestedNextAction,
        sourceCitations: data.sourceCitations,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.intent === 'HIGH') {
        logLeadActivity(`AI 顾问对话判定为高意向询盘: ${textToSend.slice(0, 20)}...`, 25, {
          extractedFields: data.extractedFields,
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: t(
            '网络暂时不稳定，请稍后再试，或预约 30 分钟诊断会。',
            'The connection is unstable right now. Please try again shortly, or book a 30-minute diagnosis call.'
          ),
          timestamp: 'now',
          intent: 'MEDIUM',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const latestAiMessage = [...allMessages].reverse().find((m) => m.sender === 'assistant');
  const intent = INTENT_LABEL[latestAiMessage?.intent || 'MEDIUM'];
  const listSeparator = lang === 'en' ? ', ' : '、';

  return (
    <Dialog
      open={isAiAdvisorOpen}
      onClose={() => setAiAdvisorOpen(false)}
      size={isInspectorMode ? 'xl' : 'lg'}
      panelClassName="h-[92dvh] sm:h-[82vh]"
      title={t('AI 售前顾问', 'AI pre-sales advisor')}
      description={t('外贸 AI 客服样板间 · 实时识别采购意向', 'Export AI customer service showroom · reads purchase intent in real time')}
      leading={
        <span className="avatar h-10 w-10" aria-hidden="true">
          <Sparkles className="h-5 w-5" />
        </span>
      }
      actions={
        <button
          type="button"
          aria-pressed={isInspectorMode}
          onClick={() => setIsInspectorMode(!isInspectorMode)}
          className="chip"
        >
          <Sliders />
          {t('CRM 透视', 'CRM view')}
        </button>
      }
    >
      <div className="flex min-h-0 flex-1">
        {/* 会话 */}
        <div className={`min-w-0 flex-1 flex-col ${isInspectorMode ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8" aria-live="polite">
            {allMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <p
                    className={`max-w-[85%] whitespace-pre-wrap rounded-[1.25rem] px-4 py-3 text-body ${
                      isUser ? 'rounded-br-md bg-accent text-white' : 'rounded-bl-md bg-surface-raised text-label'
                    }`}
                  >
                    {msg.text}
                  </p>

                  {!isUser && msg.sourceCitations && msg.sourceCitations.length > 0 && (
                    <p className="mt-2 max-w-[85%] text-caption text-label-secondary">
                      {t('信源：', 'Sources: ')}
                      {msg.sourceCitations.join(listSeparator)}
                    </p>
                  )}
                  {!isUser && msg.suggestedNextAction && (
                    <p className="mt-1 max-w-[85%] text-caption text-label-secondary">{msg.suggestedNextAction}</p>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-caption text-label-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('正在检索知识库…', 'Searching the knowledge base…')}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 border-t border-separator px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-8">
            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar" aria-label={t('快捷提问', 'Quick questions')}>
              {QUICK_PROMPTS.map((shortcut) => (
                <button
                  key={shortcut.zh}
                  type="button"
                  onClick={() => sendMessage(tb(shortcut))}
                  disabled={isLoading}
                  className="chip shrink-0 disabled:opacity-40"
                >
                  {tb(shortcut)}
                </button>
              ))}
            </div>
            <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('说说您的品类或获客疑问…', 'Tell us your product category or lead-generation question…')}
                aria-label={t('输入消息', 'Type a message')}
                className="field rounded-full"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="btn-icon h-11 w-11 bg-accent text-white hover:bg-accent-hover hover:text-white disabled:opacity-40"
                aria-label={t('发送', 'Send')}
              >
                <ArrowUp />
              </button>
            </form>
          </div>
        </div>

        {/* CRM 透视 */}
        {isInspectorMode && (
          <aside
            className="w-full shrink-0 overflow-y-auto border-separator px-6 py-6 animate-slide-in md:w-96 md:border-l sm:px-8"
            aria-label={t('CRM 意向与字段', 'CRM intent and fields')}
          >
            <h3 className="text-title-3">{t('CRM 实时透视', 'Live CRM view')}</h3>
            <p className="mt-1 text-caption text-label-secondary">{t('每一轮对话后自动更新', 'Updated after every reply')}</p>

            <div className="well mt-6">
              <p className="text-caption text-label-secondary">{t('意向等级', 'Intent level')}</p>
              <p className={`mt-1 text-title-2 ${intent.className}`}>{tb(intent.text)}</p>
              <p className="mt-1 text-caption text-label-secondary">
                {latestAiMessage?.intentReason || t('自动推断', 'Inferred automatically')}
              </p>
            </div>

            <h4 className="mt-8 text-body font-semibold">{t('字段提取', 'Extracted fields')}</h4>
            <dl className="mt-2 divide-y divide-separator border-y border-separator">
              {[
                [t('行业', 'Industry'), latestAiMessage?.extractedFields?.industry || user?.industry || t('待识别', 'Not yet identified')],
                [t('目标市场', 'Target market'), latestAiMessage?.extractedFields?.targetMarkets || t('欧美', 'Europe and US')],
                [t('预算信号', 'Budget signal'), latestAiMessage?.extractedFields?.budgetSignal || t('未提及', 'Not mentioned')],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3 text-body">
                  <dt className="text-label-secondary">{label}</dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
            </dl>

            <h4 className="mt-8 text-body font-semibold">
              {t('线索预览', 'Lead preview')}
              <span className="ml-2 text-caption font-normal tabular-nums text-label-secondary">
                #{latestAiMessage?.id.replace(/\D/g, '').slice(-4) || '0001'}
              </span>
            </h4>
            <dl className="mt-2 divide-y divide-separator border-y border-separator">
              {[
                [t('企业', 'Company'), user?.companyName || t('未知企业', 'Unknown company')],
                [t('阶段', 'Stage'), t('待判定', 'To be decided')],
                [t('推荐服务', 'Recommended services'), latestAiMessage?.recommendedServices?.join(' + ') || t('出海 GEO 优化', 'Export GEO')],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3 text-body">
                  <dt className="shrink-0 text-label-secondary">{label}</dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>
    </Dialog>
  );
};
