import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, Loader2, Sliders, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Dialog } from './ui/Dialog';

const QUICK_PROMPTS = [
  '爱康医疗案例具体是怎么做的？',
  'GEO 和传统 SEO 有什么核心区别？',
  '做一套整体方案大概花多少钱？',
  '凌晨三点的海外询盘怎么接住？',
];

const INTENT_LABEL: Record<string, { text: string; className: string }> = {
  HIGH: { text: '高意向', className: 'text-success' },
  MEDIUM: { text: '中意向', className: 'text-warning' },
  LOW: { text: '低意向', className: 'text-label-secondary' },
};

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

  interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
    intent?: 'HIGH' | 'MEDIUM' | 'LOW';
    intentReason?: string;
    extractedFields?: Record<string, any>;
    recommendedServices?: string[];
    suggestedNextAction?: string;
    sourceCitations?: string[];
  }

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '您好！我是云端智荐官方 AI 售前顾问。\n\n我们专为中国出海企业打通“独立站、SEO、GEO、AI 客服及 FDE 驻场”全链路获客断点。您可以向我询问技术方案、爱康医疗实战案例、预算费用估算，或告诉我您目前的出海痛点。',
      timestamp: '刚刚',
      intent: 'LOW',
      intentReason: '初始系统接待',
      sourceCitations: ['《云端智荐知识库 · 五项服务总则》'],
      suggestedNextAction: '点击下方的快捷问题开始，或打开右上角的“CRM 透视”，看我如何实时提取采购意向。',
    }
  ]);

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
        text: data.answer || '感谢您的咨询，我们将为您梳理最贴合的方案。',
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
          text: '网络有些不稳定。建议直接预约资深出海架构师，进行 30 分钟闭门交流。',
          timestamp: '刚刚',
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

  const latestAiMessage = [...messages].reverse().find((m) => m.sender === 'assistant');
  const intent = INTENT_LABEL[latestAiMessage?.intent || 'MEDIUM'];

  return (
    <Dialog
      open={isAiAdvisorOpen}
      onClose={() => setAiAdvisorOpen(false)}
      size={isInspectorMode ? 'xl' : 'lg'}
      panelClassName="h-[92dvh] sm:h-[82vh]"
      title="AI 售前顾问"
      description="外贸 AI 客服样板间 · 实时识别采购意向"
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
          CRM 透视
        </button>
      }
    >
      <div className="flex min-h-0 flex-1">
        {/* 会话 */}
        <div className={`min-w-0 flex-1 flex-col ${isInspectorMode ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8" aria-live="polite">
            {messages.map((msg) => {
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
                      信源：{msg.sourceCitations.join('、')}
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
                正在检索知识库…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 border-t border-separator px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-8">
            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar" aria-label="快捷提问">
              {QUICK_PROMPTS.map((shortcut) => (
                <button
                  key={shortcut}
                  type="button"
                  onClick={() => sendMessage(shortcut)}
                  disabled={isLoading}
                  className="chip shrink-0 disabled:opacity-40"
                >
                  {shortcut}
                </button>
              ))}
            </div>
            <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="说说您的品类或获客疑问…"
                aria-label="输入消息"
                className="field rounded-full"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="btn-icon h-11 w-11 bg-accent text-white hover:bg-accent-hover hover:text-white disabled:opacity-40"
                aria-label="发送"
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
            aria-label="CRM 意向与字段"
          >
            <h3 className="text-title-3">CRM 实时透视</h3>
            <p className="mt-1 text-caption text-label-secondary">每一轮对话后自动更新</p>

            <div className="well mt-6">
              <p className="text-caption text-label-secondary">意向等级</p>
              <p className={`mt-1 text-title-2 ${intent.className}`}>{intent.text}</p>
              <p className="mt-1 text-caption text-label-secondary">{latestAiMessage?.intentReason || '自动推断'}</p>
            </div>

            <h4 className="mt-8 text-body font-semibold">字段提取</h4>
            <dl className="mt-2 divide-y divide-separator border-y border-separator">
              {[
                ['行业', latestAiMessage?.extractedFields?.industry || user?.industry || '待识别'],
                ['目标市场', latestAiMessage?.extractedFields?.targetMarkets || '欧美'],
                ['预算意向', latestAiMessage?.extractedFields?.budgetSignal || '评估中'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3 text-body">
                  <dt className="text-label-secondary">{label}</dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
            </dl>

            <h4 className="mt-8 text-body font-semibold">
              线索预览
              <span className="ml-2 text-caption font-normal tabular-nums text-label-secondary">
                #{latestAiMessage?.id.replace(/\D/g, '').slice(-4) || '0001'}
              </span>
            </h4>
            <dl className="mt-2 divide-y divide-separator border-y border-separator">
              {[
                ['企业', user?.companyName || '未知企业'],
                ['阶段', 'MQL 营销合格线索'],
                ['推荐服务', latestAiMessage?.recommendedServices?.join(' + ') || '出海 GEO 优化'],
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
