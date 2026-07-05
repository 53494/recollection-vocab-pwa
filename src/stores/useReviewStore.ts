import { create } from 'zustand';

export interface ReviewSentenceItem {
  sentenceEnglish: string;
  sentenceChinese: string;
  targetWord: string;
  entryId: string;
}

interface ReviewStoreState {
  sentences: ReviewSentenceItem[];
  setSentences: (s: ReviewSentenceItem[]) => void;
}

export const useReviewStore = create<ReviewStoreState>((set) => ({
  sentences: [],
  setSentences: (s) => set({ sentences: s }),
}));
