import { db } from '../db/schema';
import type { Word } from '../types/word';
import type { WordBookMeta } from '../types/wordbook';
import type { LearningProgress } from '../types/learning';
import type { ReviewEntry } from '../types/review';
import type { DailyLog } from '../types/dailyLog';

/* ========== 词书相关 ========== */

export function getAllWordBooks(): Promise<WordBookMeta[]> {
  return db.wordBooks.orderBy('order').toArray();
}

export function getWordBook(id: string): Promise<WordBookMeta | undefined> {
  return db.wordBooks.get(id);
}

/* ========== 单词相关 ========== */

export function getWordsByBook(bookId: string): Promise<Word[]> {
  return db.words.where({ bookId }).toArray();
}

export function getWord(id: string): Promise<Word | undefined> {
  return db.words.get(id);
}

export function getWordCount(bookId: string): Promise<number> {
  return db.words.where({ bookId }).count();
}

/* ========== 学习进度 ========== */

export function getProgress(wordId: string): Promise<LearningProgress | undefined> {
  return db.learningProgress.get(wordId);
}

export function getProgressByStatus(status: string): Promise<LearningProgress[]> {
  return db.learningProgress.where({ status }).toArray();
}

export function getProgressByDate(dateStr: string): Promise<LearningProgress[]> {
  return db.learningProgress.where('nextReviewDate').equals(dateStr).toArray();
}

export function updateProgress(
  wordId: string,
  changes: Partial<LearningProgress>,
): Promise<number> {
  return db.learningProgress.update(wordId, changes);
}

/* ========== 复习本 ========== */

export function getAllReviewEntries(): Promise<ReviewEntry[]> {
  return db.reviewEntries.orderBy('dateAdded').reverse().toArray();
}

export function addReviewEntry(entry: ReviewEntry): Promise<string> {
  return db.reviewEntries.put(entry);
}

export function removeReviewEntry(id: string): Promise<void> {
  return db.reviewEntries.delete(id);
}

/* ========== 每日日志 ========== */

export function getDailyLog(dateStr: string): Promise<DailyLog | undefined> {
  return db.dailyLogs.get(dateStr);
}

export function getAllDailyLogs(): Promise<DailyLog[]> {
  return db.dailyLogs.orderBy('date').reverse().toArray();
}

/** 获取或创建今日日志 */
export async function getTodayLog(): Promise<DailyLog> {
  const today = new Date().toISOString().split('T')[0];
  const existing = await db.dailyLogs.get(today);
  if (existing) return existing;
  const fresh: DailyLog = {
    date: today,
    wordsLearned: 0,
    wordsReviewed: 0,
    selfTestsCompleted: 0,
    selfTestsCorrect: 0,
    reviewSentencesSubmitted: 0,
    totalTimeMinutes: 0,
    streakDay: false,
  };
  await db.dailyLogs.put(fresh);
  return fresh;
}

/** 更新今日日志的某个字段（递增） */
export async function incrementTodayLog(field: keyof DailyLog, amount = 1) {
  const log = await getTodayLog();
  const num = typeof log[field] === 'number' ? (log[field] as number) : 0;
  await db.dailyLogs.update(log.date, { [field]: num + amount } as Partial<DailyLog>);
}

/** 计算连续打卡天数 */
export async function getStreak(): Promise<number> {
  const logs = await db.dailyLogs.orderBy('date').reverse().toArray();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  for (const log of logs) {
    if (log.streakDay || log.wordsLearned > 0 || log.reviewSentencesSubmitted > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** 获取待自测的单词 ID（新学 + 艾宾浩斯到期复习） */
export async function getDueWordIds(): Promise<string[]> {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStart = new Date(todayStr).getTime();
  const all = await db.learningProgress.toArray();
  return all
    .filter((p) => p.lastReviewedAt > 0) // 必须真正学习过
    .filter((p) => {
      // 今学的 OR 复习日已到
      return p.lastReviewedAt >= todayStart || p.nextReviewDate <= todayStr;
    })
    .map((p) => p.wordId);
}

/** 获取某个单词的收藏句子 */
export async function getBookmarkedSentences(wordId: string): Promise<string[]> {
  const entries = await db.reviewEntries.where({ wordId }).toArray();
  return entries.map((e) => e.sentenceEnglish);
}

/** 获取今日统计（用于首页） */
export async function getTodayStats(): Promise<{
  wordsLearned: number;
  wordsReviewed: number;
  selfTestsCompleted: number;
  reviewSentences: number;
  streak: number;
}> {
  const log = await getTodayLog();
  const streak = await getStreak();
  return {
    wordsLearned: log.wordsLearned,
    wordsReviewed: log.wordsReviewed,
    selfTestsCompleted: log.selfTestsCompleted,
    reviewSentences: log.reviewSentencesSubmitted,
    streak,
  };
}
