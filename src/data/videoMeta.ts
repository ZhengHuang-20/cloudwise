/**
 * 课程视频的元数据（VideoObject 结构化数据与 video sitemap 用）。封面图与视频同名（.jpg），
 * 用 ffmpeg 截取第 2 秒画面生成：ffmpeg -ss 2 -i x.mp4 -frames:v 1 -vf scale=1280:-2 -q:v 5 x.jpg
 * 新增视频时同步补上时长（秒，ffprobe 读取）与上线日期。
 */
export const VIDEO_META: Record<string, { seconds: number; uploadDate: string }> = {
  'lesson-a-1-1': { seconds: 225, uploadDate: '2026-09-30' },
  'lesson-a-1-2': { seconds: 180, uploadDate: '2026-09-30' },
  'lesson-a-1-4': { seconds: 116, uploadDate: '2026-09-30' },
  'lesson-a-7-4': { seconds: 132, uploadDate: '2026-09-30' },
  'lesson-b-1-3': { seconds: 172, uploadDate: '2026-09-30' },
  'lesson-b-3-5': { seconds: 155, uploadDate: '2026-09-30' },
  'lesson-c-1-1': { seconds: 239, uploadDate: '2026-09-30' },
  'lesson-c-1-2': { seconds: 154, uploadDate: '2026-09-30' },
  'lesson-c-10-2': { seconds: 118, uploadDate: '2026-09-30' },
  'lesson-c-3-1': { seconds: 141, uploadDate: '2026-09-30' },
  'lesson-d-1-2': { seconds: 164, uploadDate: '2026-09-30' },
  'lesson-d-9-2': { seconds: 113, uploadDate: '2026-09-30' },
  'lesson-e-1-1': { seconds: 197, uploadDate: '2026-09-30' },
  'lesson-e-1-2': { seconds: 202, uploadDate: '2026-09-30' },
  'lesson-e-8-1': { seconds: 142, uploadDate: '2026-09-30' },
};

/** /videos/c/c-1-1.mp4 → /videos/c/c-1-1.jpg */
export const videoPoster = (videoUrl: string) => videoUrl.replace(/\.mp4$/, '.jpg');
