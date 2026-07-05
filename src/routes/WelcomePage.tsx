import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import { useActiveBookStore, type DailyGoal } from '../stores/useActiveBookStore';
import type { WordBookMeta } from '../types/wordbook';

type Step = 'book' | 'goal';

export default function WelcomePage() {
  const navigate = useNavigate();
  const store = useActiveBookStore();

  const [step, setStep] = useState<Step>('book');
  const [books, setBooks] = useState<WordBookMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState('');

  useEffect(() => {
    db.wordBooks.toArray().then((data) => {
      const sorted = data.sort((a, b) => a.order - b.order);
      setBooks(sorted);
      setLoading(false);
    });
  }, []);

  function handlePickBook(book: WordBookMeta) {
    if (book.wordCount === 0) return; // 跳过未上线的词书
    store.setActiveBook(book.id, book.name);
    setSelectedName(book.name);
    setStep('goal');
  }

  function handleConfirmGoal() {
    store.completeOnboarding();
    localStorage.setItem('recollection_onboarded', 'true');
    navigate('/');
  }

  // ===== 加载 =====
  if (loading) {
    return (
      <div className="min-h-screen bg-paper-off flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  // ===== Step 1: 选词书 =====
  if (step === 'book') {
    return (
      <div className="min-h-screen bg-paper-off flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-sm mx-auto w-full">
          {/* 头部 */}
          <div className="text-center mb-8">
            <p className="text-4xl mb-3">👋</p>
            <h2 className="text-xl font-bold text-ink">欢迎来到 Recollection</h2>
            <p className="text-sm text-ink-muted mt-2">首先，选择适合你的词书</p>
          </div>

          {/* 词书列表 */}
          <div className="w-full space-y-2">
            {books.map((book) => {
              const available = book.wordCount > 0;
              return (
                <button
                  key={book.id}
                  onClick={() => handlePickBook(book)}
                  disabled={!available}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer
                    ${available
                      ? 'bg-paper border-rule hover:border-ink/30 hover:shadow-sm active:scale-[0.98]'
                      : 'bg-paper/50 border-rule/50 opacity-50 cursor-not-allowed'}`}
                >
                  <span className="text-2xl">{book.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{book.name}</p>
                    <p className="text-xs text-ink-muted">{book.nameZh}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                    available ? 'bg-ink text-paper' : 'bg-rule text-ink-muted'}`}>
                    {available ? `${book.wordCount}词` : '即将'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ===== Step 2: 定目标 =====
  const { dailyGoal, customGoal } = store;
  const goalOptions: { value: DailyGoal; label: string }[] = [
    { value: 10, label: '轻松' },
    { value: 20, label: '适中' },
    { value: 30, label: '挑战' },
  ];

  return (
    <div className="min-h-screen bg-paper-off flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-sm mx-auto w-full">
        {/* 已选词书提示 */}
        <div className="text-center mb-8">
          <p className="text-sm text-ink-muted mb-1">已选词书</p>
          <p className="text-lg font-bold text-ink">{selectedName}</p>
        </div>

        <div className="text-center mb-6">
          <p className="text-3xl mb-2">🎯</p>
          <h2 className="text-lg font-bold text-ink">设定每日学习目标</h2>
          <p className="text-xs text-ink-muted mt-1">每天学多少词？随时可以在设置中修改</p>
        </div>

        {/* 快捷选项 */}
        <div className="flex gap-3 mb-4">
          {goalOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => store.setDailyGoal(opt.value)}
              className={`flex flex-col items-center gap-1 w-20 py-4 rounded-2xl border text-center cursor-pointer transition-all active:scale-95
                ${dailyGoal === opt.value
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper text-ink border-rule hover:border-ink/30'}`}
            >
              <span className="text-2xl font-bold">{opt.value}</span>
              <span className="text-[11px] opacity-70">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* 自定义 */}
        <button
          onClick={() => store.setDailyGoal('custom')}
          className={`px-5 py-2 rounded-full text-sm border transition-all cursor-pointer mb-2
            ${dailyGoal === 'custom'
              ? 'bg-ink text-paper border-ink'
              : 'bg-paper text-ink border-rule'}`}
        >
          自定义数量
        </button>
        {dailyGoal === 'custom' && (
          <input
            type="number"
            min={1} max={200}
            value={customGoal}
            onChange={(e) => store.setCustomGoal(Number(e.target.value))}
            className="w-20 text-center py-2 rounded-full border border-rule bg-paper text-sm
              focus:outline-none focus:border-ink mb-4"
          />
        )}

        {/* 确认按钮 */}
        <button
          onClick={handleConfirmGoal}
          className="mt-6 w-full py-3 bg-ink text-paper rounded-full text-sm font-medium
            cursor-pointer hover:opacity-90 active:scale-95 transition-all"
        >
          开始学习 · 每日 {store.getCount()} 词
        </button>

        {/* 返回选词书 */}
        <button
          onClick={() => setStep('book')}
          className="mt-3 text-xs text-ink-muted underline cursor-pointer"
        >
          ← 重新选择词书
        </button>
      </div>
    </div>
  );
}
