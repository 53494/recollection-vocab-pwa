export interface DailyLog {
  date: string;
  wordsLearned: number;
  wordsReviewed: number;
  selfTestsCompleted: number;
  selfTestsCorrect: number;
  reviewSentencesSubmitted: number;
  totalTimeMinutes: number;
  streakDay: boolean;
}
