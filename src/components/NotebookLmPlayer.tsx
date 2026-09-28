import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw, Sparkles, Video, Headphones, CheckCircle2 } from 'lucide-react';

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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, (currentTimeSec / totalDurationSec) * 100);

  return (
    <div className="apple-glass rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl mb-6">
      {/* Header bar */}
      <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#2997ff]/15 text-[#2997ff] border border-[#2997ff]/25 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <span>NotebookLM 深度精讲播客</span>
              <span className="text-[#86868b]">·</span>
              <span className="text-[#30d158] font-normal">双人对谈 (Deep Dive)</span>
            </div>
            <p className="text-[11px] text-[#86868b] truncate max-w-md">{podcast.title}</p>
          </div>
        </div>

        {/* Mode switch - Apple Segmented Control */}
        <div className="flex items-center bg-white/[0.05] p-1 rounded-full border border-white/[0.08] text-xs">
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 ${
              activeTab === 'audio'
                ? 'bg-white/20 text-white shadow-sm font-medium backdrop-blur-md'
                : 'text-[#86868b] hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>AI 播客</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 ${
              activeTab === 'video'
                ? 'bg-white/20 text-white shadow-sm font-medium backdrop-blur-md'
                : 'text-[#86868b] hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>视频演示</span>
          </button>
        </div>
      </div>

      {activeTab === 'audio' ? (
        <div className="p-6 space-y-5">
          {/* Waveform Visualization Box */}
          <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span className="font-mono tabular-nums text-white font-medium">{formatTime(currentTimeSec)}</span>
              <span className="text-[11px]">
                主讲：{podcast.hosts.join(' & ')}
              </span>
              <span className="font-mono tabular-nums">{podcast.audioDuration}</span>
            </div>

            {/* Audio Wave Bars */}
            <div className="flex items-end justify-between gap-1 h-14 py-1.5 px-3 bg-black/40 rounded-xl border border-white/[0.04]">
              {Array.from({ length: 42 }).map((_, i) => {
                const isActive = (i / 42) * 100 <= progressPercent;
                const waveHeight = isPlaying
                  ? 20 + Math.sin(i * 0.7 + currentTimeSec * 2.5) * 25 + Math.random() * 20
                  : 15 + Math.sin(i * 0.5) * 15;

                return (
                  <div
                    key={i}
                    style={{ height: `${Math.max(12, Math.min(100, waveHeight))}%` }}
                    className={`w-full rounded-full transition-all duration-150 ${
                      isActive ? 'bg-[#2997ff]' : 'bg-white/[0.12]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Slider track */}
            <div className="relative h-1 bg-white/[0.1] rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#2997ff] rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transition-transform active:scale-95 shadow-lg hover:bg-white/90"
                aria-label={isPlaying ? '暂停' : '播放'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  setCurrentTimeSec(0);
                  setCurrentLineIndex(0);
                }}
                className="p-2.5 rounded-full bg-white/[0.04] text-[#86868b] hover:text-white hover:bg-white/[0.08] transition-colors"
                title="重新播放"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleSpeedChange}
                className="px-3 py-1.5 rounded-full bg-white/[0.04] text-xs font-mono font-medium text-[#f5f5f7] hover:bg-white/[0.08] transition-colors border border-white/[0.06]"
              >
                {playbackSpeed.toFixed(1)}x
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#86868b]">
              <Volume2 className="w-4 h-4" />
              <span className="font-mono text-[11px]">Neural Speech 24kHz</span>
            </div>
          </div>

          {/* Real-time Subtitles / High-contrast dialogue */}
          <div className="bg-black/30 rounded-2xl p-4 border border-white/[0.06] max-h-40 overflow-y-auto space-y-2">
            {podcast.transcript.map((line, idx) => {
              const isCurrent = idx === currentLineIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200 text-xs sm:text-sm ${
                    isCurrent
                      ? 'bg-white/[0.08] text-white font-medium'
                      : 'text-[#86868b] opacity-60'
                  }`}
                >
                  <img
                    src={line.avatar}
                    alt={line.speaker}
                    className="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="text-[#2997ff] mr-2 font-semibold">{line.speaker}:</span>
                    <span>{line.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-12 flex flex-col items-center justify-center min-h-[260px] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#2997ff]">
            <Video className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-white">{lessonTitle} · 实操操作视频</h4>
            <p className="text-xs text-[#86868b] max-w-md">
              配套高清控制台操作录制演示，也可切换至 NotebookLM AI 双人深度播客精讲。
            </p>
          </div>
          <button
            onClick={() => setActiveTab('audio')}
            className="apple-secondary-btn px-5 py-2 text-xs"
          >
            切换至 NotebookLM 音频对谈
          </button>
        </div>
      )}
    </div>
  );
};
