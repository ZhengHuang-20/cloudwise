import React, { useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Share2,
  FileText,
  Clock,
  DollarSign,
  Zap
} from 'lucide-react';
import { SERVICE_PACKAGES, calculateProposalEstimate, ConfiguratorInput } from '../data/pricingRules';
import { useApp } from '../context/AppContext';

interface ConfiguratorViewProps {
  onGoToDealRoom: () => void;
  onGoToBooking: () => void;
  initialParams?: any;
}

export const ConfiguratorView: React.FC<ConfiguratorViewProps> = ({
  onGoToDealRoom,
  onGoToBooking,
  initialParams,
}) => {
  const { saveProposalDraft, showToast } = useApp();

  const [selectedPackage, setSelectedPackage] = useState<string>(
    initialParams?.packageType || 'package-acquisition'
  );

  const [config, setConfig] = useState<ConfiguratorInput>({
    packageType: initialParams?.packageType || 'package-acquisition',
    sitePagesLevel: 'medium',
    siteSkus: 100,
    languagesCount: 3,
    seoTargetMarkets: 3,
    seoKeywordsGroups: 60,
    geoDecisionPersonas: 4,
    geoAnnualContentCount: 60,
    inquiryChannels: ['官网在线客服', '海外邮件', 'WhatsApp'],
    integratedSystems: ['企业微信', '标准CRM/Excel'],
    needFdeOnsite: true,
    needPrivateDeploy: false,
  });

  const estimate = calculateProposalEstimate({
    ...config,
    packageType: selectedPackage,
  });

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackage(pkgId);
    setConfig((prev) => ({ ...prev, packageType: pkgId }));
  };

  const handleSaveAndActivateDealRoom = () => {
    const pkg = SERVICE_PACKAGES.find((p) => p.id === selectedPackage);
    saveProposalDraft(
      `${pkg?.name || '出海方案'} · 预算与交付规划`,
      pkg?.solvesFrictions || ['获客增长'],
      estimate.budgetRange,
      estimate.timelineWeeks,
      {
        selectedPackage,
        config,
        deliverables: estimate.deliverables,
        milestones: estimate.milestones,
      }
    );
    onGoToDealRoom();
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('方案只读分享链接已复制！可直接发送给老板或内部立项审批。');
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#f5f5f7]">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="apple-eyebrow">CONFIGURATOR & ESTIMATION</span>
        <h1 className="apple-section-title">
          交付方案配置与预算测算
        </h1>
        <p className="text-sm sm:text-base text-[#86868b] leading-relaxed max-w-2xl mx-auto">
          将复杂的出海工程交付拆解为透明的预算区间、实施周期与阶段成果。
        </p>
      </div>

      {/* Package Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {SERVICE_PACKAGES.map((pkg) => {
          const isSelected = selectedPackage === pkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => handlePackageSelect(pkg.id)}
              className={`relative cursor-pointer rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-white/[0.08] border-[#2997ff] shadow-xl'
                  : 'apple-glass-card'
              }`}
            >
              {pkg.isPopular && (
                <span className="absolute -top-3 right-6 text-xs font-semibold bg-[#2997ff] text-white px-3 py-1 rounded-full shadow-md">
                  推荐 · 获客旗舰
                </span>
              )}

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white tracking-tight">{pkg.name}</h3>
                <p className="text-sm text-[#d2d2d7] min-h-[40px] font-normal leading-relaxed">{pkg.tagline}</p>
                <div className="text-sm text-[#2997ff] font-medium">
                  补齐断点：{pkg.solvesFrictions.join(' · ')}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] mt-4">
                <span className="text-sm font-medium text-[#d2d2d7] block mb-1">参考预算区间</span>
                <span className="text-2xl font-bold font-mono text-white block mb-4">
                  {pkg.basePriceRange[0]} ~ {pkg.basePriceRange[1]} 万元
                </span>
                <div className={`w-full py-2.5 rounded-full text-sm font-semibold text-center transition-colors ${
                  isSelected ? 'bg-[#0071e3] text-white shadow-md' : 'bg-white/[0.08] text-white hover:bg-white/[0.14]'
                }`}>
                  {isSelected ? '已选定此组合' : '选择配置'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Sliders & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        <div className="lg:col-span-7 apple-glass rounded-3xl p-8 space-y-8">
          <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <Layers className="w-4 h-4 text-[#2997ff]" />
              <span>根据企业规模定制参数</span>
            </h3>
            <span className="text-xs text-[#86868b]">实时联动预算与交付周期</span>
          </div>

          {/* Group 1: 独立站与多语种 */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-medium text-[#2997ff] uppercase tracking-wider">
              1. 独立站与多语种配置
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#f5f5f7]">产品 SKU 规模</span>
                  <span className="font-mono text-white font-semibold">{config.siteSkus} 款</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="20"
                  value={config.siteSkus}
                  onChange={(e) => setConfig({ ...config, siteSkus: Number(e.target.value) })}
                  className="w-full h-1 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#2997ff]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#f5f5f7]">外语语种数量</span>
                  <span className="font-mono text-white font-semibold">{config.languagesCount} 个语种</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={config.languagesCount}
                  onChange={(e) => setConfig({ ...config, languagesCount: Number(e.target.value) })}
                  className="w-full h-1 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#2997ff]"
                />
              </div>
            </div>
          </div>

          {/* Group 2: SEO & GEO */}
          <div className="space-y-4 pt-4 border-t border-white/[0.08]">
            <h4 className="text-xs font-mono font-medium text-[#30d158] uppercase tracking-wider">
              2. Google 词库与 GEO 决策者建模
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#f5f5f7]">Google 核心关键词组</span>
                  <span className="font-mono text-white font-semibold">{config.seoKeywordsGroups} 组</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="15"
                  value={config.seoKeywordsGroups}
                  onChange={(e) => setConfig({ ...config, seoKeywordsGroups: Number(e.target.value) })}
                  className="w-full h-1 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#2997ff]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#f5f5f7]">GEO 决策者画像数</span>
                  <span className="font-mono text-white font-semibold">{config.geoDecisionPersonas} 类角色</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="7"
                  step="1"
                  value={config.geoDecisionPersonas}
                  onChange={(e) => setConfig({ ...config, geoDecisionPersonas: Number(e.target.value) })}
                  className="w-full h-1 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#2997ff]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#f5f5f7]">全年高权重技术白皮书规划</span>
                <span className="font-mono text-white font-semibold">{config.geoAnnualContentCount} 项</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="10"
                value={config.geoAnnualContentCount}
                onChange={(e) => setConfig({ ...config, geoAnnualContentCount: Number(e.target.value) })}
                className="w-full h-1 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#2997ff]"
              />
            </div>
          </div>

          {/* Group 3: AI 客服与系统 */}
          <div className="space-y-4 pt-4 border-t border-white/[0.08]">
            <h4 className="text-xs font-mono font-medium text-[#ffd60a] uppercase tracking-wider">
              3. AI 客服渠道与企业系统打通
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {['官网在线窗口', '海外官方邮件', 'WhatsApp 业务号', 'LinkedIn 私信'].map((ch) => {
                const checked = config.inquiryChannels.includes(ch);
                return (
                  <button
                    key={ch}
                    onClick={() => {
                      const updated = checked
                        ? config.inquiryChannels.filter((c) => c !== ch)
                        : [...config.inquiryChannels, ch];
                      setConfig({ ...config, inquiryChannels: updated });
                    }}
                    className={`px-3.5 py-1.5 rounded-full border transition-all ${
                      checked
                        ? 'bg-white/15 border-white/30 text-white font-medium'
                        : 'bg-white/[0.02] border-white/[0.08] text-[#86868b]'
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real-time Result Card */}
        <div className="lg:col-span-5 apple-glass rounded-3xl p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#2997ff] uppercase tracking-wider block">
              Real-time Output
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">方案估算与交付清单</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
              <span className="text-xs text-[#86868b] flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-[#2997ff]" />
                <span>预估预算区间</span>
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {estimate.budgetRange}
              </span>
            </div>

            <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
              <span className="text-xs text-[#86868b] flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#30d158]" />
                <span>交付周期</span>
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {estimate.timelineWeeks}
              </span>
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white">交付物清单：</h4>
            <div className="space-y-2 text-xs text-[#a1a1a6]">
              {estimate.deliverables.map((d, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
                  <span className="text-[#f5f5f7]">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5 pt-4">
            <button
              onClick={handleSaveAndActivateDealRoom}
              className="apple-blue-btn w-full py-3.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
            >
              <FileText className="w-4 h-4" />
              <span>保存方案并激活方案空间 (Deal Room)</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleShareLink}
                className="apple-secondary-btn flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>复制只读链接</span>
              </button>
              <button
                onClick={onGoToBooking}
                className="apple-secondary-btn flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5 text-[#2997ff]"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>预约确认方案</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
