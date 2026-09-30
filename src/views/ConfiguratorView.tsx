import React, { useState } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { SERVICE_PACKAGES, buildProposalPlan, ConfiguratorInput } from '../data/servicePackages';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Slider } from '../components/ui/Slider';

interface ConfiguratorViewProps {
  onGoToDealRoom: () => void;
  onGoToBooking: () => void;
  initialParams?: any;
}

const INQUIRY_CHANNELS = ['官网在线窗口', '海外官方邮件', 'WhatsApp 业务号', 'LinkedIn 私信'];
const INTEGRATED_SYSTEMS = ['企业微信', '钉钉', '标准CRM/Excel', 'Salesforce', 'ERP'];

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
    inquiryChannels: ['官网在线窗口', '海外官方邮件', 'WhatsApp 业务号'],
    integratedSystems: ['企业微信', '标准CRM/Excel'],
    needFdeOnsite: true,
    needPrivateDeploy: false,
  });

  const plan = buildProposalPlan({
    ...config,
    packageType: selectedPackage,
  });

  const showAcquisitionParams = selectedPackage === 'package-acquisition' || selectedPackage === 'package-full';
  const showConversionParams = selectedPackage === 'package-full';

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackage(pkgId);
    setConfig((prev) => ({ ...prev, packageType: pkgId }));
  };

  const toggleListValue = (key: 'inquiryChannels' | 'integratedSystems', value: string) => {
    setConfig((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  };

  const handleSaveAndActivateDealRoom = () => {
    const pkg = SERVICE_PACKAGES.find((p) => p.id === selectedPackage);
    saveProposalDraft(
      `${pkg?.name || '出海方案'} · 交付规划`,
      pkg?.solvesFrictions || ['获客增长'],
      plan.timelineWeeks,
      {
        selectedPackage,
        config,
        deliverables: plan.deliverables,
        milestones: plan.milestones,
      }
    );
    onGoToDealRoom();
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('只读链接已复制，可直接发给老板或用于内部立项');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="方案规划"
        title="组合服务，看到交付周期与步骤"
        intro="把复杂的出海工程拆解为清晰的服务组合、实施周期与阶段成果。"
      />

      <div className="layout-wide pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        {/* 1. 选择组合 */}
        <section aria-labelledby="packages-title">
          <h2 id="packages-title" className="text-title-2">
            选择服务组合
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-labelledby="packages-title">
            {SERVICE_PACKAGES.map((pkg) => {
              const isSelected = selectedPackage === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handlePackageSelect(pkg.id)}
                  className="card interactive flex flex-col items-start aria-checked:shadow-[inset_0_0_0_2px_var(--color-accent)]"
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    {pkg.isPopular ? <span className="badge">常见起点</span> : <span />}
                    {isSelected && <CheckCircle2 className="h-6 w-6 shrink-0 text-link" aria-hidden="true" />}
                  </div>
                  <h3 className="mt-3 text-title-3">{pkg.name}</h3>
                  <p className="mt-2 flex-1 text-body text-label-secondary">{pkg.tagline}</p>
                  <p className="mt-4 text-caption text-label-secondary">解决的卡点：{pkg.solvesFrictions.join(' · ')}</p>
                  <p className="mt-5 w-full border-t border-separator pt-4 text-title-2 tabular-nums">
                    {pkg.durationWeeks[0]} ~ {pkg.durationWeeks[1]}
                    <span className="ml-1 text-body font-normal text-label-secondary">周</span>
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-12 grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          {/* 2. 参数 */}
          <section className="tile lg:col-span-7" aria-labelledby="params-title">
            <h2 id="params-title" className="text-title-2">
              按企业规模调整
            </h2>
            <p className="mt-2 text-body text-label-secondary">参数变化会实时联动交付周期与交付物。</p>

            {!showAcquisitionParams && (
              <p className="well mt-8 text-body text-label-secondary">
                当前组合按标准范围交付，无需调整参数。选择“获客增长组合”或“整体全案服务”可按规模细化交付物与周期。
              </p>
            )}

            {showAcquisitionParams && (
              <div className="mt-8 space-y-10">
                <fieldset>
                  <legend className="text-title-3">独立站与多语种</legend>
                  <div className="mt-5 grid grid-cols-1 gap-7 sm:grid-cols-2">
                    <Slider
                      label="产品 SKU 规模"
                      value={config.siteSkus}
                      min={20}
                      max={300}
                      step={20}
                      onChange={(v) => setConfig({ ...config, siteSkus: v })}
                      format={(v) => `${v} 款`}
                    />
                    <Slider
                      label="外语语种"
                      value={config.languagesCount}
                      min={1}
                      max={6}
                      step={1}
                      onChange={(v) => setConfig({ ...config, languagesCount: v })}
                      format={(v) => `${v} 个`}
                    />
                  </div>
                </fieldset>

                <fieldset className="border-t border-separator pt-8">
                  <legend className="float-left w-full text-title-3">Google 词库与 GEO 决策者建模</legend>
                  <div className="clear-both grid grid-cols-1 gap-7 pt-5 sm:grid-cols-2">
                    <Slider
                      label="Google 核心关键词"
                      value={config.seoKeywordsGroups}
                      min={30}
                      max={120}
                      step={15}
                      onChange={(v) => setConfig({ ...config, seoKeywordsGroups: v })}
                      format={(v) => `${v} 组`}
                    />
                    <Slider
                      label="GEO 决策者画像"
                      value={config.geoDecisionPersonas}
                      min={2}
                      max={7}
                      step={1}
                      onChange={(v) => setConfig({ ...config, geoDecisionPersonas: v })}
                      format={(v) => `${v} 类`}
                    />
                    <div className="sm:col-span-2">
                      <Slider
                        label="全年技术白皮书规划"
                        value={config.geoAnnualContentCount}
                        min={20}
                        max={100}
                        step={10}
                        onChange={(v) => setConfig({ ...config, geoAnnualContentCount: v })}
                        format={(v) => `${v} 项`}
                      />
                    </div>
                  </div>
                </fieldset>
              </div>
            )}

            {showConversionParams && (
              <fieldset className="mt-10 border-t border-separator pt-8">
                <legend className="float-left w-full text-title-3">AI 客服渠道与系统打通</legend>
                <div className="clear-both pt-5">
                  <p className="text-body text-label-secondary">接入渠道</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {INQUIRY_CHANNELS.map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        aria-pressed={config.inquiryChannels.includes(ch)}
                        onClick={() => toggleListValue('inquiryChannels', ch)}
                        className="chip"
                      >
                        {ch}
                      </button>
                    ))}
                  </div>

                  <p className="mt-6 text-body text-label-secondary">打通的企业系统</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {INTEGRATED_SYSTEMS.map((sys) => (
                      <button
                        key={sys}
                        type="button"
                        aria-pressed={config.integratedSystems.includes(sys)}
                        onClick={() => toggleListValue('integratedSystems', sys)}
                        className="chip"
                      >
                        {sys}
                      </button>
                    ))}
                  </div>

                  <label className="mt-8 flex cursor-pointer items-center justify-between gap-4 border-t border-separator pt-6">
                    <span>
                      <span className="block text-body">私有化部署</span>
                      <span className="block text-caption text-label-secondary">知识库与数据部署在企业自有服务器</span>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={config.needPrivateDeploy}
                      onChange={(e) => setConfig({ ...config, needPrivateDeploy: e.target.checked })}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className="relative h-[31px] w-[51px] shrink-0 rounded-full bg-fill transition-colors duration-200 peer-checked:bg-success peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-link after:absolute after:left-[2px] after:top-[2px] after:h-[27px] after:w-[27px] after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-200 peer-checked:after:translate-x-5"
                    />
                  </label>
                </div>
              </fieldset>
            )}
          </section>

          {/* 3. 结果 */}
          <section
            className="tile lg:sticky lg:top-20 lg:col-span-5"
            aria-labelledby="plan-title"
            aria-live="polite"
          >
            <h2 id="plan-title" className="text-title-3">
              方案概览
            </h2>

            <dl className="mt-6">
              <dt className="text-caption text-label-secondary">交付周期</dt>
              <dd className="mt-1 text-title-1 tabular-nums">{plan.timelineWeeks}</dd>
            </dl>
            <p className="mt-4 text-caption text-label-secondary">{plan.note}</p>

            <h3 className="mt-8 border-t border-separator pt-6 text-body font-semibold">交付物</h3>
            <ul className="mt-3 space-y-2.5">
              {plan.deliverables.map((d) => (
                <li key={d} className="flex gap-3 text-body">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-success" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            <h3 className="mt-8 border-t border-separator pt-6 text-body font-semibold">实施节奏</h3>
            <ol className="mt-3 space-y-3">
              {plan.milestones.map((m) => (
                <li key={m.week} className="grid grid-cols-[5.5rem_1fr] gap-3">
                  <span className="text-caption tabular-nums text-label-secondary">{m.week}</span>
                  <span className="text-caption">
                    <span className="block text-body">{m.title}</span>
                    <span className="text-label-secondary">{m.task}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-8 space-y-3 border-t border-separator pt-6">
              <button type="button" onClick={handleSaveAndActivateDealRoom} className="btn btn-primary btn-block">
                保存并进入方案空间
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={handleShareLink} className="btn btn-neutral">
                  复制链接
                </button>
                <button type="button" onClick={onGoToBooking} className="btn btn-secondary">
                  预约诊断会
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
