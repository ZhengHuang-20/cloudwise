import React from 'react';

interface LessonVideoProps {
  src: string;
  title: string;
}

export const LessonVideo: React.FC<LessonVideoProps> = ({ src, title }) => (
  <section aria-label={`${title} 课程视频`}>
    <div className="overflow-hidden rounded-card bg-black">
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
        aria-label={title}
        className="aspect-video w-full"
      >
        您的浏览器不支持视频播放。
      </video>
    </div>
  </section>
);
