import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import type { Proof } from '../data/servicesData';

/** 服务页里的案例数据块：数字来自客户后台截图，口径、来源与截图一起展示 */
export const ServiceProof: React.FC<{ proof: Proof; showImages?: boolean }> = ({ proof, showImages = true }) => {
  const { t, tb, path } = useLang();
  return (
    <section aria-labelledby="proof-title" className="tile">
      <p className="eyebrow">{t('案例数据', 'Case data')}</p>
      <h2 id="proof-title" className="mt-2 text-title-2">
        {tb(proof.title)}
      </h2>
      <p className="mt-4 text-body text-label-secondary">{tb(proof.intro)}</p>
      <p className="mt-3 text-caption text-label-secondary">{tb(proof.period)}</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {proof.stats.map((stat) => (
          <div key={stat.value} className="well">
            <dd className="text-title-1 font-semibold tabular-nums">{stat.value}</dd>
            <dt className="mt-1 text-caption text-label-secondary">{tb(stat.label)}</dt>
          </div>
        ))}
      </dl>

      <h3 className="mt-8 text-title-3">{tb(proof.milestonesTitle)}</h3>
      <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {proof.milestones.map((m) => (
          <li key={m.date} className="well">
            <span className="block text-title-2 font-semibold tabular-nums">{m.value}</span>
            <span className="mt-1 block text-caption text-label-secondary tabular-nums">{m.date}</span>
          </li>
        ))}
      </ul>

      {proof.pagespeed && (
        <div className="mt-8">
          <h3 className="text-title-3">{tb(proof.pagespeed.title)}</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-body">
              <thead>
                <tr className="text-caption text-label-secondary">
                  <th scope="col" className="py-2 pr-4 font-normal"><span className="sr-only">{t('项目', 'Item')}</span></th>
                  <th scope="col" className="px-4 py-2 font-normal">{tb(proof.pagespeed.columns.mobile)}</th>
                  <th scope="col" className="px-4 py-2 font-normal">{tb(proof.pagespeed.columns.desktop)}</th>
                </tr>
              </thead>
              <tbody>
                {proof.pagespeed.rows.map((row) => (
                  <tr key={row.label.zh} className="border-t border-separator">
                    <th scope="row" className="py-2.5 pr-4 font-normal">{tb(row.label)}</th>
                    <td className="px-4 py-2.5 font-semibold tabular-nums">{row.mobile}</td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums">{row.desktop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-caption text-label-secondary">{tb(proof.pagespeed.note)}</p>
        </div>
      )}

      <ul className="mt-6 space-y-2 text-body text-label-secondary">
        {proof.notes.map((note) => (
          <li key={note.zh}>{tb(note)}</li>
        ))}
      </ul>

      {showImages && (
        <div className="mt-8 grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {proof.images.map((img) => (
            <a key={img.src} href={img.src} target="_blank" rel="noopener" className="block overflow-hidden rounded-card border border-hairline">
              <img src={img.src} width={img.width} height={img.height} alt={tb(img.alt)} loading="lazy" className="h-auto w-full" />
            </a>
          ))}
        </div>
      )}

      <p className="mt-4 text-caption text-label-secondary">{tb(proof.source)}</p>
      <Link href={path(proof.caseHref)} className="link mt-4 text-body">
        {t('查看爱康医疗完整案例', 'Read the full Aikang Medical case')}
        <ChevronRight />
      </Link>
    </section>
  );
};
