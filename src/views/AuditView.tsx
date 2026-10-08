import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { FaqList } from '../components/FaqList';
import { useLang } from '../context/LanguageContext';
import { findInsight } from '../site/routes';
import { useSite } from '../site/SiteContext';
import { VisibilityAudit } from './home/VisibilityAudit';

const METHOD_SLUG = 'ai-visibility-audit-methodology';

/** AI 可见性测评独立页 /audit（首页的 #audit 区块是同一个组件） */
export const AuditView: React.FC = () => {
  const { t, lang, path } = useLang();
  const { openBooking, navigate } = useSite();
  const inputRef = useRef<HTMLInputElement>(null);
  const method = findInsight(METHOD_SLUG);

  const steps = [
    {
      title: t('检查官网', 'Check the website'),
      desc: t(
        'AI 爬虫能否访问、不执行 JavaScript 时有没有正文、有没有结构化数据、sitemap 与 llms.txt。',
        'Whether AI crawlers can access it, whether there is body text without JavaScript, and whether there is structured data, a sitemap and llms.txt.'
      ),
    },
    {
      title: t('以买家身份提问', 'Ask as a buyer'),
      desc: t(
        '向 ChatGPT、Perplexity、Gemini 提 6 个不带品牌名的采购问题和 2 个带品牌名的问题，每题问 2 次。',
        'Ask ChatGPT, Perplexity and Gemini 6 purchasing questions without your brand name and 2 that name it, twice each.'
      ),
    },
    {
      title: t('按固定公式计分', 'Score with fixed formulas'),
      desc: t(
        '统计提及率、引用率与品牌认知，与官网可读性按 7:3 合成总分，并列出被推荐最多的竞品。',
        'Mention rate, citation rate and brand knowledge are combined 7:3 with site readability into a total score, alongside the most-recommended competitors.'
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={t('免费工具', 'Free tool')}
        title={t('AI 可见性测评：AI 会向海外买家推荐你吗？', 'AI visibility audit: will AI recommend you to overseas buyers?')}
        intro={t(
          '输入官网或品牌名，几分钟内看到 ChatGPT、Perplexity、Gemini 是否提到你、引用了哪些网页，以及官网能否被 AI 读取。',
          'Enter your website or brand name. Within minutes, see whether ChatGPT, Perplexity and Gemini mention you, which pages they cite, and whether AI can read your website.'
        )}
      />

      <VisibilityAudit inputRef={inputRef} openBookingModal={openBooking} onGoToConfigurator={() => navigate('/configurator')} />

      <div className="layout-text pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]">
        <section aria-labelledby="how-title" className="pt-[clamp(4rem,2.5rem+4vw,6rem)]">
          <h2 id="how-title" className="text-title-1">
            {t('测评怎么做', 'How the audit works')}
          </h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="card">
                <span className="text-caption tabular-nums text-label-secondary">0{i + 1}</span>
                <h3 className="mt-2 text-title-3">{step.title}</h3>
                <p className="mt-2 text-body text-label-secondary">{step.desc}</p>
              </li>
            ))}
          </ol>
          {method && (
            <Link href={path(`/insights/${METHOD_SLUG}`)} className="link mt-6 text-body">
              {t('完整的测评方法、评分口径与局限', 'The full method, scoring and limits')}
              <ChevronRight />
            </Link>
          )}
        </section>

        {method && <FaqList items={method[lang].faqs} className="mt-16" />}

        <section className="tile mt-16 text-center">
          <h2 className="text-title-2">{t('想要人工解读？', 'Want a human read-through?')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-label-secondary">
            {t('预约 30 分钟诊断会，会后给出书面的改进清单。', 'Book a 30-minute diagnosis call and receive a written improvement list afterwards.')}
          </p>
          <button type="button" onClick={openBooking} className="btn btn-primary mt-6">
            {t('预约诊断会', 'Book a diagnosis call')}
          </button>
        </section>
      </div>
    </div>
  );
};
