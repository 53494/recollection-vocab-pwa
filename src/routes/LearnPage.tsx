import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import { updateProgress, addReviewEntry, removeReviewEntry, incrementTodayLog } from '../services/dataService';
import { computeNextReview } from '../services/ebbinghausScheduler';
import { useActiveBookStore } from '../stores/useActiveBookStore';
import type { Word } from '../types/word';
import type { LearningProgress } from '../types/learning';
import { WordCard } from '../components/learn/WordCard';

type Phase = 'learning' | 'finished' | 'spelling' | 'spelling-done';

export default function LearnPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { getCount } = useActiveBookStore();
  const spellingInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>('learning');
  const [words, setWords] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [bookmarks, setBookmarks] = useState<Map<number, boolean>>(new Map());

  // 拼写测试状态
  const [spellingWords, setSpellingWords] = useState<Word[]>([]);
  const [spellIndex, setSpellIndex] = useState(0);
  const [spellInput, setSpellInput] = useState('');
  const [spellSubmitted, setSpellSubmitted] = useState(false);
  const [spellCorrect, setSpellCorrect] = useState(false);
  const [spellWrong, setSpellWrong] = useState<Word[]>([]);
  const [spellScore, setSpellScore] = useState(0);
  const spellJumped = useRef(false);

  // 加载未学过的单词（优先新词，不够补复习到期词）
  useEffect(() => {
    if (!bookId) return;
    (async () => {
      const allWords = await db.words.where({ bookId }).toArray();
      const progressMap = new Map<string, LearningProgress>();
      const allProgress = await db.learningProgress.toArray();
      for (const p of allProgress) progressMap.set(p.wordId, p);

      // 新词：ebbinghausStage === 0
      const newWords = allWords.filter((w) => {
        const p = progressMap.get(w.id);
        return !p || p.ebbinghausStage === 0;
      });

      // 如果新词不够，补复习到期的
      const todayStr = new Date().toISOString().split('T')[0];
      const reviewDue = allWords.filter((w) => {
        const p = progressMap.get(w.id);
        return p && p.ebbinghausStage > 0 && p.nextReviewDate <= todayStr;
      });

      const count = getCount();
      let selected = newWords.slice(0, count);
      if (selected.length < count) {
        selected = [...selected, ...reviewDue.slice(0, count - selected.length)];
      }

      setWords(selected);
      setLoading(false);
    })();
  }, [bookId, getCount]);

  const toggleBookmark = useCallback(async (sentenceIndex: number) => {
    const word = words[index];
    if (!word) return;
    const key = sentenceIndex;
    const isBookmarked = bookmarks.get(key) ?? false;
    setBookmarks((prev) => { const next = new Map(prev); next.set(key, !isBookmarked); return next; });
    const sentence = word.exampleSentences[sentenceIndex];
    if (!sentence) return;
    const entryId = `${word.id}-sent-${sentenceIndex}`;
    if (!isBookmarked) {
      await addReviewEntry({ id: entryId, wordId: word.id, targetWord: word.word, sentenceEnglish: sentence.english, sentenceChinese: sentence.chinese, source: 'bookmarked', dateAdded: Date.now(), reviewCount: 0, correctCount: 0 });
    } else {
      await removeReviewEntry(entryId);
    }
  }, [index, words, bookmarks]);

  const handleResponse = useCallback(async (quality: number) => {
    const word = words[index];
    if (!word) return;
    const progress = await db.learningProgress.get(word.id);
    if (!progress) return;
    const result = computeNextReview(progress.ebbinghausStage, quality);
    const isCorrect = quality >= 3;
    const newStatus = result.isMastered ? 'mastered' as const : progress.status === 'new' ? 'learning' as const : 'reviewing' as const;
    await updateProgress(word.id, { status: newStatus, lastReviewedAt: Date.now(), reviewCount: progress.reviewCount + 1, correctCount: progress.correctCount + (isCorrect ? 1 : 0), incorrectCount: progress.incorrectCount + (isCorrect ? 0 : 1), ebbinghausStage: result.nextStage, nextReviewDate: result.nextReviewDate, retentionScore: result.retentionEstimate, lastRetentionCheckAt: new Date().toISOString().split('T')[0] });
    await incrementTodayLog('wordsLearned');
    if (index + 1 < words.length) { setIndex((prev) => prev + 1); setBookmarks(new Map()); }
    else { setPhase('finished'); }
  }, [index, words]);

  // ========= 开始拼写测试 =========
  function startSpelling() {
    setSpellingWords([...words]);
    setSpellIndex(0);
    setSpellInput('');
    setSpellSubmitted(false);
    setSpellWrong([]);
    setSpellScore(0);
    setPhase('spelling');
  }

  function speak(word: string) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }

  function handleSpellSubmit() {
    if (spellSubmitted) return;
    const answer = spellInput.trim().toLowerCase();
    const correct = spellingWords[spellIndex].word.toLowerCase();
    const ok = answer === correct;
    setSpellCorrect(ok);
    setSpellSubmitted(true);
    if (ok) { setSpellScore((s) => s + 1); }
    else { setSpellWrong((prev) => [...prev, spellingWords[spellIndex]]); }

    // 1.2 秒后自动跳下一词
    setTimeout(() => handleSpellNext(), 1200);
  }

  function handleSpellNext() {
    if (spellJumped.current) return;
    spellJumped.current = true;
    if (spellIndex + 1 < spellingWords.length) {
      setSpellIndex((i) => i + 1);
      setSpellInput('');
      setSpellSubmitted(false);
      spellJumped.current = false;
    } else if (spellWrong.length > 0) {
      setSpellingWords([...spellWrong]);
      setSpellWrong([]);
      setSpellIndex(0);
      setSpellInput('');
      setSpellSubmitted(false);
      spellJumped.current = false;
    } else {
      setPhase('spelling-done');
    }
  }

  // 自动聚焦拼写输入
  useEffect(() => {
    if (phase === 'spelling' && !spellSubmitted && spellingInputRef.current) {
      spellingInputRef.current.focus();
    }
  }, [phase, spellIndex, spellSubmitted]);

  // ========= 没有单词 =========
  if (!loading && words.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-center">
        <p className="text-4xl">📚</p>
        <p className="text-sm text-ink-light">本词书已全部学完</p>
        <p className="text-xs text-ink-muted">等复习到期后再来，或换一本词书</p>
        <button onClick={() => navigate('/wordbooks')} className="mt-2 px-6 py-2 bg-ink text-paper rounded-full text-sm cursor-pointer">换词书</button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" /></div>;
  }

  // ========= 完成页 =========
  if (phase === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="text-xl font-bold text-ink">今日学习完成！</h2>
        <p className="text-sm text-ink-light">你已完成 {words.length} 个单词的学习</p>
        <div className="flex gap-3 mt-2">
          <button onClick={startSpelling}
            className="px-6 py-2.5 bg-ink text-paper rounded-full text-sm cursor-pointer hover:opacity-90">
            ✏️ 去拼写
          </button>
          <button onClick={() => navigate('/')}
            className="px-6 py-2.5 border border-rule rounded-full text-sm text-ink-light cursor-pointer hover:border-ink/30">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // ========= 拼写测试 =========
  if (phase === 'spelling') {
    const word = spellingWords[spellIndex];
    return (
      <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-rule rounded-full overflow-hidden">
            <div className="h-full bg-ink rounded-full transition-all duration-500"
              style={{ width: `${((spellIndex + 1) / spellingWords.length) * 100}%` }} />
          </div>
          <span className="text-xs text-ink-muted">{spellIndex + 1}/{spellingWords.length}</span>
          <span className="text-xs text-ink font-medium">{spellScore}✓</span>
        </div>

        <div className="bg-paper rounded-2xl border border-rule p-8 text-center">
          <p className="text-lg text-ink mb-1">{word.chineseDefinition}</p>
          <p className="text-xs text-ink-muted mb-4">{word.partOfSpeech}</p>
          <button onClick={() => speak(word.word)}
            className="w-14 h-14 rounded-full border-2 border-ink text-ink mx-auto flex items-center justify-center
              cursor-pointer hover:bg-ink hover:text-paper active:scale-90 transition-all">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </button>
        </div>

        {!spellSubmitted ? (
          <div className="flex gap-2">
            <input ref={spellingInputRef} value={spellInput}
              onChange={(e) => setSpellInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSpellSubmit(); }}
              placeholder="输入单词拼写..."
              className="flex-1 px-4 py-3 rounded-xl border border-rule bg-paper text-sm focus:outline-none focus:border-ink" />
            <button onClick={handleSpellSubmit} disabled={!spellInput.trim()}
              className="px-6 py-3 bg-ink text-paper rounded-xl text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-40">
              确定
            </button>
          </div>
        ) : (
          <div>
            <div className={`p-4 rounded-xl text-sm mb-3 ${spellCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {spellCorrect ? '✅ 拼写正确！' : <>❌ 正确答案：<span className="font-semibold">{word.word}</span></>}
            </div>
            <button onClick={handleSpellNext}
              className="w-full py-3 bg-ink text-paper rounded-full text-sm font-medium cursor-pointer hover:opacity-90">
              {spellIndex + 1 < spellingWords.length ? '下一词' : spellWrong.length > 0 ? `复习错词 (${spellWrong.length})` : '完成'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ========= 拼写完成 =========
  if (phase === 'spelling-done') {
    const total = words.length;
    const pct = total > 0 ? Math.round((spellScore / total) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
        <span className="text-5xl">{pct === 100 ? '🏆' : pct >= 80 ? '🎉' : '💪'}</span>
        <h2 className="text-xl font-bold text-ink">拼写完成</h2>
        <p className="text-sm text-ink-light">{spellScore} / {total} 正确 · {pct}%</p>
        <button onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-ink text-paper rounded-full text-sm cursor-pointer hover:opacity-90">
          返回首页
        </button>
      </div>
    );
  }

  // ========= 学习 =========
  const word = words[index];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-rule rounded-full overflow-hidden">
          <div className="h-full bg-ink rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((index + 1) / words.length) * 100}%` }} />
        </div>
        <span className="text-xs text-ink-muted whitespace-nowrap tabular-nums">{index + 1} / {words.length}</span>
      </div>
      <WordCard word={word} bookmarks={bookmarks} onToggleBookmark={toggleBookmark} />
      <div className="flex gap-3">
        <button onClick={() => handleResponse(1)} className="flex-1 py-3 rounded-full border border-rule text-sm text-ink-light cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-600 active:scale-[0.97] transition-all">不认识</button>
        <button onClick={() => handleResponse(3)} className="flex-1 py-3 rounded-full border border-rule text-sm text-ink-light cursor-pointer hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 active:scale-[0.97] transition-all">模糊</button>
        <button onClick={() => handleResponse(5)} className="flex-1 py-3 rounded-full bg-ink text-paper text-sm font-medium cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all">认识</button>
      </div>
    </div>
  );
}
