export type AccumulateSource = 'ai-suggested' | 'manual';

export interface AccumulationEntry {
  id: string;
  expression: string;
  contextSentence: string;
  chineseTranslation: string;
  source: AccumulateSource;
  sourceReviewAttemptId?: string;
  tags: string[];
  notes: string;
  dateAdded: number;
  reviewedCount: number;
  lastReviewedAt?: number;
}
