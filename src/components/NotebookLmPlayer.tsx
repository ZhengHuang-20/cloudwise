import React, { useState, useEffect, useMemo } from 'react';
import { Headphones, Pause, Play, RotateCcw, Video } from 'lucide-react';
import { SegmentedControl } from './ui/SegmentedControl';

interface NotebookLmPlayerProps {
  podcast: {
    title: string;
    audioDuration: string;
    hosts: string[];
    transcript: {
      speaker: 'Alex' | 'Sam';
      avatar: string;
      text: string;
      highlight?: boolean;
    }[];
    videoUrl?: string;
  };
  lessonTitle: string;
}

const BAR_COUNT = 48;

export const NotebookLmPlayer: React.FC<NotebookLmPlayerProps> = ({ podcast, lessonTitle }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [activeTab, setActiveTab] = useState<'audio' | 'video'>('audio');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const totalDurationSec = 180;

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1 * playbackSpeed;
          const lineFraction = next / totalDurationSec;
          const targetLine = Math.min(
            podcast.transcript.length - 1,
            Math.floor(lineFraction * podcast.transcript.length)
          );
          setCurrentLineIndex(targetLine);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, podcast.transcript.length]);

  // 静态波形：高度只取决于位置，避免每次渲染抖动
  const bars = useMemo(
    () => Array.from({ length: BAR_COUNT }, (_, i) => 28 + Math.abs(Math.sin(i * 0.9) * 48 + Math.sin(i * 0.37) * 24)),
    []
  );

  const handleSpeedChange = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, (currentTimeSec / totalDurationSec) * 100);

  return (
    <section className="well p-0" aria-label="NotebookLM 深度精讲">
      <div className="flex flex-col gap-4 border-b border-separator px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-body font-semibold">NotebookLM 双人精讲</p>
          <p className="truncate text-caption text-label-secondary">{podcast.title}</p>
        </div>
        <SegmentedControl
          ariaLabel="播放形式"
          value={activeTab}
          onChange={setActiveTab}
          className="shrink-0 self-start sm:self-auto"
          options={[
            { id: 'audio', label: '播客', icon: Headphones },
            { id: 'video', label: '视频', icon: Video },
          ]}
        />
      </div>

      {activeTab === 'audio' ? (
        <div className="p-5">
          {/* 波形 */}
          <div className="flex h-14 items-center gap-[3px]" aria-hidden="true">
            {bars.map((height, i) => (
              <span
                key={i}
                style={{ height: `${Math.min(100, height)}%` }}
                className={`w-full rounded-full transition-colors duration-300 ${
                  (i / BAR_COUNT) * 100 <= progressPercent ? 'bg-label' : 'bg-separator-strong'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-caption tabular-nums text-label-secondary">
            <span>{formatTime(currentTimeSec)}</span>
            <span>{podcast.audioDuration}</span>
          </div>

          {/* 控制 */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-label text-canvas transition-opacity hover:opacity-90"
                aria-label={isPlaying ? '暂停' : '播放'}
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentTimeSec(0);
                  setCurrentLineIndex(0);
                }}
                className="btn-icon"
                aria-label="从头播放"
              >
                <RotateCcw />
              </button>
              <button type="button" onClick={handleSpeedChange} className="chip tabular-nums" aria-label="切换播放速度">
                {playbackSpeed.toFixed(2).replace(/0$/, '')}×
              </button>
            </div>
            <span className="text-caption text-label-secondary">主讲 {podcast.hosts.join(' & ')}</span>
          </div>

          {/* 字幕 */}
          <ol className="mt-5 max-h-44 space-y-1 overflow-y-auto border-t border-separator pt-4">
            {podcast.transcript.map((line, idx) => {
              const isCurrent = idx === currentLineIndex;
              return (
                <li
                  key={idx}
                  className={`flex items-start gap-3 rounded-control px-2 py-2 text-body transition-colors duration-300 ${
                    isCurrent ? 'bg-fill text-label' : 'text-label-secondary'
                  }`}
                >
                  <span className="avatar mt-0.5 h-6 w-6 text-caption" aria-hidden="true">
                    {line.speaker.slice(0, 1)}
                  </span>
                  <span>
                    <span className="mr-2 font-semibold">{line.speaker}</span>
                    {line.text}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <div className="flex min-h-[240px] flex-col items-center justify-center p-10 text-center">
          <Video className="h-10 w-10 text-label-tertiary" />
          <h4 className="mt-4 text-body font-semibold">{lessonTitle} · 实操视频</h4>
          <p className="mt-1 max-w-md text-caption text-label-secondary">
            控制台实操录屏正在制作中，先听听 NotebookLM 双人精讲。
          </p>
          <button type="button" onClick={() => setActiveTab('audio')} className="btn btn-secondary btn-sm mt-6">
            切换到播客
          </button>
        </div>
      )}
    </section>
  );
};
