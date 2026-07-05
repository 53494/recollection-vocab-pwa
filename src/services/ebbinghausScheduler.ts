/**
 * 艾宾浩斯遗忘曲线调度器
 *
 * 8 阶段间隔，基于"记忆保留率随时间的指数衰减"理论：
 *   0 → 首次学习 (100%)
 *   1 → 20 分钟后 (58%)
 *   2 → 1 小时后 (44%)
 *   3 → 1 天后 (34%)
 *   4 → 2 天后 (28%)
 *   5 → 6 天后 (25%)
 *   6 → 14 天后 (21%)
 *   7 → 30 天后 (20%) → 已掌握
 */

interface EbbinghausInterval {
  stage: number;
  label: string;
  minutes?: number;
  days?: number;
}

const EBBINGHAUS_INTERVALS: EbbinghausInterval[] = [
  { stage: 0, label: '首次学习', minutes: 0 },
  { stage: 1, label: '20分钟后', minutes: 20 },
  { stage: 2, label: '1小时后', minutes: 60 },
  { stage: 3, label: '1天后', days: 1 },
  { stage: 4, label: '2天后', days: 2 },
  { stage: 5, label: '6天后', days: 6 },
  { stage: 6, label: '14天后', days: 14 },
  { stage: 7, label: '30天后', days: 30 },
];

const STAGE_RETENTION = [100, 58, 44, 34, 28, 25, 21, 20];

export interface ScheduleResult {
  nextStage: number;
  nextReviewDate: string;
  retentionEstimate: number;
  isMastered: boolean;
}

/**
 * 根据用户回答质量，计算下一次复习时间
 * @param currentStage 当前艾宾浩斯阶段 (0-7)
 * @param quality 用户回答质量 (0-5):
 *    5 = 轻松正确 (认识) → 推进 +1
 *    3-4 = 犹豫正确 (模糊) → 保持
 *    0-2 = 错误 (不认识) → 回退 -1
 */
export function computeNextReview(
  currentStage: number,
  quality: number,
): ScheduleResult {
  let nextStage: number;

  if (quality >= 4) {
    nextStage = Math.min(currentStage + 1, 7);
  } else if (quality >= 2) {
    nextStage = currentStage;
  } else {
    nextStage = Math.max(1, currentStage - 1);
  }

  const interval = EBBINGHAUS_INTERVALS[nextStage];
  const nextDate = new Date();

  if (interval.days) {
    nextDate.setDate(nextDate.getDate() + interval.days);
  } else if (interval.minutes) {
    nextDate.setMinutes(nextDate.getMinutes() + interval.minutes);
  }

  const baseRetention = STAGE_RETENTION[nextStage];
  const retentionEstimate = Math.min(100, baseRetention + quality * 2);

  return {
    nextStage,
    nextReviewDate: nextDate.toISOString().split('T')[0],
    retentionEstimate,
    isMastered: nextStage === 7,
  };
}
