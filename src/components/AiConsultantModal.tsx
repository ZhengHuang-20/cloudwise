import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Sliders,
  Database,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

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
      suggestedNextAction: '您可以点击下方快捷问题，或开启右上方【CRM 透视】查看我如何实时提取采购意向！',
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
          text: '建议直接预约与资深出海架构师进行 30 分钟闭门交流。',
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

  if (!isAiAdvisorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className={`apple-glass rounded-3xl shadow-2xl w-full flex flex-col overflow-hidden transition-all duration-300 h-[86vh] border border-white/[0.12] ${
        isInspectorMode ? 'max-w-5xl' : 'max-w-2xl'
      }`}>
        {/* Header - Apple Window Bar */}
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2997ff]/15 text-[#2997ff] border border-[#2997ff]/25 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">AI 售前顾问</h3>
                <span className="text-[10px] font-mono text-[#30d158] bg-[#30d158]/10 px-2 py-0.5 rounded-full border border-[#30d158]/20">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-[#86868b]">外贸智能客服样板间 · 7×24h 实时意向识别</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInspectorMode(!isInspectorMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isInspectorMode
                  ? 'bg-white/20 text-white border border-white/25 shadow-sm'
                  : 'bg-white/[0.05] text-[#a1a1a6] hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isInspectorMode ? '关闭透视' : 'CRM 透视模式'}</span>
            </button>

            <button
              onClick={() => setAiAdvisorOpen(false)}
              className="p-1.5 text-[#86868b] hover:text-white rounded-full hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Stream */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black/30">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                        isUser ? 'bg-[#0071e3] text-white' : 'bg-white/[0.08] text-[#2997ff]'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className="max-w-[82%] space-y-2">
                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-[#0071e3] text-white rounded-tr-sm shadow-sm'
                            : 'bg-white/[0.06] text-[#f5f5f7] border border-white/[0.06] rounded-tl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {!isUser && msg.sourceCitations && msg.sourceCitations.length > 0 && (
                        <div className="text-[11px] text-[#86868b] flex flex-wrap items-center gap-1.5 pl-1">
                          <span>知识信源：</span>
                          {msg.sourceCitations.map((cite, i) => (
                            <span key={i} className="text-white/80 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                              {cite}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-[#86868b] p-2 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-[#2997ff]" />
                  <span>AI 顾问正在检索知识库...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-6 py-2.5 bg-black/40 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-[#86868b] shrink-0 font-medium">快捷提问:</span>
              {[
                '爱康医疗案例具体是怎么做的？',
                'GEO 和传统 SEO 有什么核心区别？',
                '做一套整体方案大概花多少钱？',
                '凌晨三点的海外询盘怎么接住？',
              ].map((shortcut, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(shortcut)}
                  className="px-3 py-1 text-xs whitespace-nowrap rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#a1a1a6] hover:text-white transition-colors border border-white/[0.06]"
                >
                  {shortcut}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleFormSubmit} className="p-4 bg-black/60 border-t border-white/[0.08] flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入您企业的品类或获客疑问..."
                className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-full text-xs sm:text-sm text-white placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="apple-blue-btn px-5 py-2.5 text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">发送</span>
              </button>
            </form>
          </div>

          {/* Right Inspector Panel (CRM 透视模式) */}
          {isInspectorMode && (
            <div className="w-80 md:w-96 bg-black/60 border-l border-white/[0.08] flex flex-col p-6 overflow-y-auto space-y-4 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sliders className="w-4 h-4 text-[#2997ff]" />
                  <span>CRM 意向与字段流转</span>
                </div>
                <span className="text-[10px] text-[#86868b] font-mono">LIVE</span>
              </div>

              {/* Intent Score */}
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-1">
                <span className="text-xs text-[#86868b] block">意向等级自动判定</span>
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-bold font-mono ${
                    latestAiMessage?.intent === 'HIGH' ? 'text-[#30d158]' :
                    latestAiMessage?.intent === 'MEDIUM' ? 'text-[#ffd60a]' : 'text-[#86868b]'
                  }`}>
                    {latestAiMessage?.intent || 'MEDIUM'}
                  </span>
                  <span className="text-xs text-[#86868b]">{latestAiMessage?.intentReason || '自动推断'}</span>
                </div>
              </div>

              {/* Extracted Fields */}
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-2 text-xs">
                <span className="font-semibold text-white block">CRM 字段提取结果</span>
                <div className="space-y-1.5 text-[#86868b]">
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span>行业：</span>
                    <span className="text-white">{latestAiMessage?.extractedFields?.industry || user?.industry || '待识别'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span>目标市场：</span>
                    <span className="text-white">{latestAiMessage?.extractedFields?.targetMarkets || '欧美'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>预算意向：</span>
                    <span className="text-white">{latestAiMessage?.extractedFields?.budgetSignal || '评估中'}</span>
                  </div>
                </div>
              </div>

              {/* CRM Card Sample */}
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Database className="w-3.5 h-3.5 text-[#2997ff]" />
                  <span>自动生成的 CRM 线索预览</span>
                </div>
                <div className="p-3 bg-black/60 rounded-xl border border-white/[0.06] text-[11px] font-mono space-y-1 text-[#f5f5f7]">
                  <p className="text-[#2997ff]">{`// 线索入库 #${Date.now().toString().slice(-4)}`}</p>
                  <p><span className="text-[#86868b]">企业:</span> {user?.companyName || '未知企业'}</p>
                  <p><span className="text-[#86868b]">阶段:</span> MQL 营销合格线索</p>
                  <p><span className="text-[#86868b]">推荐服务:</span> {latestAiMessage?.recommendedServices?.join(' + ') || '出海 GEO 优化'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
