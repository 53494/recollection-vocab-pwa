export type SelfTestType = 'listen-identify' | 'fill-blank';
export type ListenMode = 'with-spelling' | 'without-spelling';

export interface SelfTestAttempt {
  id: string;
  wordId: string;
  testType: SelfTestType;
  date: number;
  listenMode?: ListenMode;
  wasCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  sentenceUsed?: string;
  blankedWord?: string;
  timeSpentSeconds: number;
}
