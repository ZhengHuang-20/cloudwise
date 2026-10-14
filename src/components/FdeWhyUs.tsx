import React from 'react';
import { FDE_WHY } from '../data/fdeData';
import { useLang } from '../context/LanguageContext';

/** FDE 服务页「为什么是我们」 */
export const FdeWhyUs: React.FC = () => {
  const { t, tb } = useLang();
  return (
    <section aria-labelledby="fde-why-title" className="tile">
      <h2 id="fde-why-title" className="text-title-2">
        {t('为什么是我们', 'Why us')}
      </h2>
      <p className="mt-2 text-body text-label-secondary">
        {t('FDE 不是派一个人，而是派一个做过的人。', 'An FDE is not just a person we send, but someone who has done it before.')}
      </p>
      <ul className="mt-6 divide-y divide-separator border-t border-separator">
        {FDE_WHY.map((item) => (
          <li key={item.title.zh} className="py-5">
            <h3 className="text-title-3">{tb(item.title)}</h3>
            <p className="mt-2 text-body text-label-secondary">{tb(item.body)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};
