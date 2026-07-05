import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import { getDueWordIds, getBookmarkedSentences, incrementTodayLog } from '../services/dataService';
import type { Word } from '../types/word';

export default function FillBlankPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [words, setWords] = useState<Word[]>([]);
  // 每道题的挖空句子
  const [sentences, setSentences] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [finished, setFinished] = useState(false);

  // 加载今日单词 + 优先选收藏句
  useEffect(() => {
    (async () => {
      const ids = await getDueWordIds();
      if (ids.length === 0) { setWords([]); setLoading(false); return; }
      const all = await db.words.bulkGet(ids);
      const valid = all.filter(Boolean) as Word[];
      const shuffled = valid.sort(() => Math.random() - 0.5);
      setWords(shuffled);

      // 为每个单词选一条句子：优先收藏句，否则随机例句
      const picked: string[] = [];
      for (const w of shuffled) {
        const bookmarked = await getBookmarkedSentences(w.id);
        if (bookmarked.length > 0) {
          picked.push(bookmarked[Math.floor(Math.random() * bookmarked.length)]);
        } else {
          const ex = w.exampleSentences;
          picked.push(ex[Math.floor(Math.random() * ex.length)].english);
        }
      }
      setSentences(picked);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!submitted && inputRef.current) inputRef.current.focus();
  }, [index, submitted]);

  function speak(sentence: string) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(sentence);
    u.lang = 'en-US'; u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }

  function handleSubmit() {
    if (submitted) return;
    const answer = userInput.trim().toLowerCase();
    const correctAnswer = words[index].word.toLowerCase();
    setIsCorrect(answer === correctAnswer);
    setSubmitted(true);
    if (answer === correctAnswer) {
      setScore((s) => s + 1);
    } else {
      setWrongWords((prev) => [...prev, words[index]]);
    }
  }

  async function handleNext() {
    if (index + 1 < words.length) {
      setIndex((i) => i + 1);
      setUserInput('');
      setSubmitted(false);
    } else {
      // 保存所有自测记录
      for (const w of words) {
        const isRight = !wrongWords.find((ww) => ww.id === w.id) && !(w.id === words[index].id && !isCorrect);
        await db.selfTestAttempts.put({
          id: crypto.randomUUID(),
          wordId: w.id,
          testType: 'fill-blank',
          date: Date.now(),
          wasCorrect: isRight,
          userAnswer: isRight ? w.word : '拼写错误',
          correctAnswer: w.word,
          sentenceUsed: sentences[words.indexOf(w)],
          blankedWord: w.word,
          timeSpentSeconds: 0,
        });
      }
      await incrementTodayLog('selfTestsCompleted', words.length);
      await incrementTodayLog('selfTestsCorrect', score + (isCorrect ? 1 : 0));
      setFinished(true);
    }
  }

  function retryWrong() {
    setWords(wrongWords);
    setSentences(wrongWords.map((w) => {
      const ex = w.exampleSentences;
      return ex[Math.floor(Math.random() * ex.length)].english;
    }));
    setWrongWords([]);
    setIndex(0);
    setScore(0);
    setFinished(false);
    setSubmitted(false);
    setUserInput('');
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

        {wrongWords.length > 0 && (
          <div className="w-full max-w-md mt-2">
            <p className="text-sm font-medium text-ink mb-2">
              📝 错题回顾（{wrongWords.length} 个）
            </p>
            <div className="space-y-1.5">
              {wrongWords.map((w) => (
                <div key={w.id} className="bg-paper rounded-xl border border-rule p-3 text-left">
                  <p className="text-sm font-medium text-ink">{w.word}</p>
                  <p className="text-xs text-ink-muted">{w.chineseDefinition}</p>
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
          <button onClick={() => { setIndex(0); setScore(0); setWrongWords([]); setFinished(false); setSubmitted(false); setUserInput(''); }}
            className="px-5 py-2.5 bg-ink text-paper rounded-full text-sm cursor-pointer">
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
  const sentence = sentences[index];
  // 挖空目标词
  const blanked = sentence.replace(new RegExp(`\\b${word.word}\\b`, 'gi'), '＿＿＿＿＿');

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

      <div className="bg-paper rounded-2xl border border-rule p-6">
        <p className="text-[15px] text-ink leading-relaxed mb-3">
          {submitted ? sentence : blanked}
        </p>
        {submitted && (
          <p className="text-xs mb-1">
            正确答案：<span className="text-word font-semibold">{word.word}</span>
          </p>
        )}
        <p className="text-xs text-ink-muted">{word.chineseDefinition}</p>
        <button onClick={() => speak(sentence)}
          className="mt-3 text-xs text-ink-muted underline cursor-pointer hover:text-ink">
          🔊 听整句
        </button>
      </div>

      {!submitted ? (
        <div className="flex gap-2">
          <input ref={inputRef} value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="输入缺失的单词..."
            className="flex-1 px-4 py-3 rounded-xl border border-rule bg-paper text-sm
              focus:outline-none focus:border-ink transition-colors" />
          <button onClick={handleSubmit} disabled={!userInput.trim()}
            className="px-6 py-3 bg-ink text-paper rounded-xl text-sm font-medium cursor-pointer
              hover:opacity-90 disabled:opacity-40 transition-all">
            确定
          </button>
        </div>
      ) : (
        <div>
          <div className={`p-4 rounded-xl text-sm mb-3 ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {isCorrect ? '✅ 拼写正确！' : `❌ 你写的是"${userInput}"，正确答案是"${word.word}"`}
          </div>
          <button onClick={handleNext}
            className="w-full py-3 bg-ink text-paper rounded-full text-sm font-medium cursor-pointer hover:opacity-90">
            {index + 1 < words.length ? '下一题' : '查看结果'}
          </button>
        </div>
      )}
    </div>
  );
}
