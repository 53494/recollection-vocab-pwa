import Dexie, { type Table } from 'dexie';
import type { WordBookMeta } from '../types/wordbook';
import type { Word } from '../types/word';
import type { LearningProgress } from '../types/learning';
import type { ReviewEntry } from '../types/review';
import type { AccumulationEntry } from '../types/accumulate';
import type { SelfTestAttempt } from '../types/selfTest';
import type { DailyLog } from '../types/dailyLog';

export class RecollectionDB extends Dexie {
  wordBooks!: Table<WordBookMeta, string>;
  words!: Table<Word, string>;
  learningProgress!: Table<LearningProgress, string>;
  reviewEntries!: Table<ReviewEntry, string>;
  reviewAttempts!: Table<ReviewAttempt, string>;
  reviewSessions!: Table<ReviewSession, string>;
  accumulationEntries!: Table<AccumulationEntry, string>;
  selfTestAttempts!: Table<SelfTestAttempt, string>;
  dailyLogs!: Table<DailyLog, string>;
  settings!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('RecollectionDB');

    this.version(1).stores({
      wordBooks:           'id, level',
      words:               'id, bookId',
      learningProgress:    'wordId, status, nextReviewDate, lastReviewedAt',
      reviewEntries:       'id, wordId, dateAdded',
      reviewAttempts:      'id, reviewEntryId, date',
      reviewSessions:      'id, date, type',
      accumulationEntries: 'id, dateAdded, source',
      selfTestAttempts:    'id, wordId, testType, date',
      dailyLogs:           'date',
      settings:            'key',
    });
  }
}

/** 复习尝试（暂存 JSON 格式的 AI 反馈） */
export interface ReviewAttempt {
  id: string;
  reviewEntryId: string;
  date: number;
  userAnswer: string;
  originalSentence: string;
  targetWord: string;
  isCorrect: boolean;
  score: number;
  aiFeedbackJSON: string;
}

/** 复习会话 */
export interface ReviewSession {
  id: string;
  date: string;
  type: 'daily' | 'weekly' | 'monthly';
  entriesReviewed: number;
  correctCount: number;
  totalScore: number;
  durationSeconds: number;
  completed: boolean;
}

export const db = new RecollectionDB();
