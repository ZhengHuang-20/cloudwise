import React from 'react';
import { useLang } from '../context/LanguageContext';
import { videoPoster } from '../data/videoMeta';

interface LessonVideoProps {
  src: string;
  title: string;
}

export const LessonVideo: React.FC<LessonVideoProps> = ({ src, title }) => {
  const { t } = useLang();
  return (
    <section aria-label={t(`${title} 课程视频`, `${title} course video`)}>
      <div className="overflow-hidden rounded-card bg-black">
        <video
          src={src}
          poster={videoPoster(src)}
          controls
          playsInline
          preload="none"
          controlsList="nodownload"
          aria-label={title}
          width={1280}
          height={720}
          className="aspect-video h-auto w-full"
        >
          {t('您的浏览器不支持视频播放。', 'Your browser does not support video playback.')}
        </video>
      </div>
    </section>
  );
};
