import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import type { Word } from '../types/word';
import type { SelfTestAttempt } from '../types/selfTest';

export default function WrongWordsPage() {
  const navigate = useNavigate();
  const [wrongWords, setWrongWords] = useState<(Word & { errorCount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const todayStart = new Date(new Date().toISOString().split('T')[0]).getTime();
      const all = await db.selfTestAttempts.toArray();
      const todayWrong = all.filter((a) => a.date >= todayStart && !a.wasCorrect);

      // 按 wordId 聚合
      const countMap = new Map<string, number>();
      for (const a of todayWrong) {
        countMap.set(a.wordId, (countMap.get(a.wordId) || 0) + 1);
      }

      // 查单词详情
      const ids = [...countMap.keys()];
      const wordRecords = ids.length > 0 ? await db.words.bulkGet(ids) : [];
      const result = wordRecords
        .filter(Boolean)
        .map((w) => ({ ...w!, errorCount: countMap.get(w!.id) || 0 }))
        .sort((a, b) => b.errorCount - a.errorCount);

      setWrongWords(result);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="text-center pt-2 pb-1">
        <p className="text-3xl mb-2">📝</p>
        <h2 className="text-lg font-bold text-ink">今日错题</h2>
        <p className="text-xs text-ink-muted mt-1">
          {wrongWords.length === 0
            ? '今天没有错题，继续保持！'
            : `${wrongWords.length} 个单词需要复习 · 每日刷新`}
        </p>
      </div>

      {wrongWords.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <p className="text-4xl">🌟</p>
          <p className="text-sm text-ink-light">全部正确，太棒了！</p>
        </div>
      ) : (
        <div className="space-y-2">
          {wrongWords.map((w) => (
            <div key={w.id} className="bg-paper rounded-xl border border-rule p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{w.word}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{w.chineseDefinition}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                  错 {w.errorCount} 次
                </span>
              </div>
              {w.exampleSentences[0] && (
                <p className="text-xs text-ink-muted mt-2 leading-relaxed border-t border-rule pt-2">
                  {w.exampleSentences[0].english}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {wrongWords.length > 0 && (
        <button
          onClick={() => navigate('/selftest')}
          className="w-full py-3 bg-ink text-paper rounded-full text-sm font-medium cursor-pointer hover:opacity-90"
        >
          去自测中心再练一遍
        </button>
      )}
    </div>
  );
}
