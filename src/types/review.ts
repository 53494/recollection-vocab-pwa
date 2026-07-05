export type ReviewSource = 'bookmarked' | 'manual';

/** 复习本条目的基本定义（完整字段在 DB schema 中） */
export interface ReviewEntry {
  id: string;
  wordId: string;
  targetWord: string;
  sentenceEnglish: string;
  sentenceChinese: string;
  source: ReviewSource;
  dateAdded: number;
  lastReviewedAt?: number;
  reviewCount: number;
  correctCount: number;
}
