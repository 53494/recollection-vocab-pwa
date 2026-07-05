import { create } from 'zustand';

export type DailyGoal = 10 | 20 | 30 | 'custom';

interface ActiveBookState {
  /** 用户选定的词书 ID */
  activeBookId: string | null;
  /** 词书名称（用于显示） */
  activeBookName: string;
  /** 每日学习目标 */
  dailyGoal: DailyGoal;
  /** 自定义数量 */
  customGoal: number;
  /** 是否已完成新手引导 */
  hasCompletedOnboarding: boolean;

  setActiveBook: (id: string, name: string) => void;
  setDailyGoal: (goal: DailyGoal) => void;
  setCustomGoal: (n: number) => void;
  completeOnboarding: () => void;
  getCount: () => number;
}

export const useActiveBookStore = create<ActiveBookState>((set, get) => ({
  activeBookId: null,
  activeBookName: '',
  dailyGoal: 10,
  customGoal: 50,
  hasCompletedOnboarding: false,

  setActiveBook: (id, name) => set({ activeBookId: id, activeBookName: name }),
  setDailyGoal: (goal) => set({ dailyGoal: goal }),
  setCustomGoal: (n) => set({ customGoal: Math.max(1, Math.min(200, n)) }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  getCount: () => {
    const { dailyGoal, customGoal } = get();
    return dailyGoal === 'custom' ? customGoal : dailyGoal;
  },
}));
