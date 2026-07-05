/** 单词学习状态 */
export type WordStatus =
  | 'new'        // 未学过
  | 'learning'   // 学习中
  | 'reviewing'  // 复习中
  | 'mastered';  // 已掌握

/** 单词学习进度（艾宾浩斯遗忘曲线驱动） */
export interface LearningProgress {
  wordId: string;                    // PK, FK -> Word.id
  status: WordStatus;
  firstSeenAt: number;               // 首次学习时间戳
  lastReviewedAt: number;            // 最近复习时间戳
  reviewCount: number;               // 累计复习次数
  correctCount: number;              // 正确次数
  incorrectCount: number;            // 错误次数
  ebbinghausStage: number;           // 艾宾浩斯阶段: 0-7
  nextReviewDate: string;            // ISO date "YYYY-MM-DD"
  retentionScore: number;            // 预估记忆保留率 0-100
  lastRetentionCheckAt: string;      // 上次检查保留率的日期
}
