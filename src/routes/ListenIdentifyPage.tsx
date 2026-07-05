import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import { getDueWordIds, incrementTodayLog } from '../services/dataService';
import type { Word } from '../types/word';

export default function ListenIdentifyPage() {
  const navigate = useNavigate();

  const [words, setWords] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSpelling, setShowSpelling] = useState(true);
  const [options, setOptions] = useState<Word[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [finished, setFinished] = useState(false);

  // 加载今日学过的单词
  useEffect(() => {
    (async () => {
      const ids = await getDueWordIds();
      if (ids.length === 0) {
        setWords([]);
        setLoading(false);
        return;
      }
      const all = await db.words.bulkGet(ids);
      const valid = all.filter(Boolean) as Word[];
      const shuffled = valid.sort(() => Math.random() - 0.5);
      setWords(shuffled);
      setLoading(false);
    })();
  }, []);

  // 智能干扰项：从同词书中选近形/近音词
  const generateOptions = useCallback(async (correctWord: Word) => {
    const sameBook = await db.words.where({ bookId: correctWord.bookId }).toArray();
    const others = sameBook.filter((w) => w.id !== correctWord.id);

    // 优先找首字母相同或长度接近的词（更易混淆）
    const sameLetter = others.filter((w) => w.word[0]?.toLowerCase() === correctWord.word[0]?.toLowerCase());
    const pool = sameLetter.length >= 3 ? sameLetter : others;
    const distractors = pool.sort(() => Math.random() - 0.5).slice(0, 3);

    const opts = [correctWord, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(opts);
  }, []);

  useEffect(() => {
    if (words.length > 0 && index < words.length) {
      generateOptions(words[index]);
      setSelected(null);
      setCorrect(null);
    }
  }, [index, words, generateOptions]);

  function speak(word: string) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }

  useEffect(() => {
    if (words.length > 0 && index < words.length) {
      const t = setTimeout(() => speak(words[index].word), 400);
      return () => clearTimeout(t);
    }
  }, [index, words]);

  function handlePick(option: Word) {
    if (selected !== null) return;
    const isCorrect = option.id === words[index].id;
    setSelected(option.id);
    setCorrect(isCorrect);
    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      setWrongWords((prev) => [...prev, words[index]]);
    }

    setTimeout(() => {
      if (index + 1 < words.length) {
        setIndex((i) => i + 1);
      } else {
        finishQuiz(isCorrect ? score + 1 : score);
      }
    }, 1800);
  }

  async function finishQuiz(finalScore: number) {
    // 保存每条记录
    for (const w of words) {
      const isCorrect = !wrongWords.find((ww) => ww.id === w.id);
      await db.selfTestAttempts.put({
        id: crypto.randomUUID(),
        wordId: w.id,
        testType: 'listen-identify',
        date: Date.now(),
        listenMode: showSpelling ? 'with-spelling' : 'without-spelling',
        wasCorrect: isCorrect,
        userAnswer: isCorrect ? w.chineseDefinition : '选错',
        correctAnswer: w.chineseDefinition,
        timeSpentSeconds: 0,
      });
    }
    await incrementTodayLog('selfTestsCompleted', words.length);
    await incrementTodayLog('selfTestsCorrect', finalScore);
    setFinished(true);
  }

  // 仅重测错题
  function retryWrong() {
    setWords(wrongWords);
    setWrongWords([]);
    setIndex(0);
    setScore(0);
    setFinished(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-center">
        <p className="text-4xl">📚</p>
        <p className="text-sm text-ink-light">今天还没有学过的单词</p>
        <p className="text-xs text-ink-muted">先去学习，回来再测</p>
        <button onClick={() => navigate('/')}
          className="mt-2 px-6 py-2 bg-ink text-paper rounded-full text-sm cursor-pointer">
          回首页
        </button>
      </div>
    );
  }

  if (finished) {
    const total = words.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="flex flex-col items-center gap-5 text-center pb-8">
        <span className="text-5xl mt-8">{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}</span>
        <h2 className="text-xl font-bold text-ink">测试完成</h2>
        <p className="text-sm text-ink-light">{score} / {total} 正确 · {pct}%</p>

        {/* 错题列表 */}
        {wrongWords.length > 0 && (
          <div className="w-full max-w-md mt-2">
            <p className="text-sm font-medium text-ink mb-2">
              📝 错题回顾（{wrongWords.length} 个）
            </p>
            <div className="space-y-1.5">
              {wrongWords.map((w) => (
                <div key={w.id} className="bg-paper rounded-xl border border-rule p-3 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm font-medium text-ink">{w.word}</p>
                    <p className="text-xs text-ink-muted">{w.chineseDefinition}</p>
                  </div>
                  <button onClick={() => speak(w.word)}
                    className="text-ink-muted hover:text-ink cursor-pointer">
                    🔊
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          {wrongWords.length > 0 && (
            <button onClick={retryWrong}
              className="px-5 py-2.5 border border-ink text-ink rounded-full text-sm cursor-pointer hover:bg-ink hover:text-paper transition-all">
              只测错题 ({wrongWords.length})
            </button>
          )}
          <button onClick={() => { setIndex(0); setScore(0); setWrongWords([]); setFinished(false); }}
            className="px-5 py-2.5 bg-ink text-paper rounded-full text-sm cursor-pointer hover:opacity-90">
            全部重测
          </button>
          <button onClick={() => navigate('/')}
            className="px-5 py-2.5 border border-rule rounded-full text-sm text-ink-light cursor-pointer">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const word = words[index];

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 bg-rule rounded-full overflow-hidden">
          <div className="h-full bg-ink rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / words.length) * 100}%` }} />
        </div>
        <span className="text-xs text-ink-muted">{index + 1}/{words.length}</span>
        <span className="text-xs text-ink font-medium">{score}✓</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-muted">显示拼写</span>
        <button onClick={() => setShowSpelling(!showSpelling)}
          className={`w-11 h-6 rounded-full transition-colors ${showSpelling ? 'bg-ink' : 'bg-rule'} relative cursor-pointer`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showSpelling ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      <div className="bg-paper rounded-2xl border border-rule p-8 text-center">
        <button onClick={() => speak(word.word)}
          className="w-16 h-16 rounded-full border-2 border-ink text-ink mx-auto flex items-center justify-center
            cursor-pointer hover:bg-ink hover:text-paper active:scale-90 transition-all mb-4">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        </button>
        {showSpelling && <p className="text-2xl font-bold text-ink mb-1">{word.word}</p>}
        {!showSpelling && <p className="text-sm text-ink-muted mb-1">???</p>}
        <p className="text-xs text-ink-muted">{word.phonetic}</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => {
          let bg = 'bg-paper border-rule';
          if (selected === opt.id) {
            bg = opt.id === words[index].id ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400';
          }
          return (
            <button key={opt.id}
              onClick={() => handlePick(opt)}
              disabled={selected !== null}
              className={`w-full p-4 rounded-xl border text-left text-sm transition-all cursor-pointer
                ${bg} ${selected === null ? 'hover:border-ink/30 active:scale-[0.98]' : ''}`}>
              {opt.chineseDefinition}
            </button>
          );
        })}
      </div>
    </div>
  );
}
