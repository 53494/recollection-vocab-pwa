import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import { getDueWordIds, incrementTodayLog } from '../services/dataService';
import { useReviewStore } from '../stores/useReviewStore';
import type { ReviewEntry } from '../types/review';
import type { Word } from '../types/word';
import { speakEnglish } from '../services/speechService';

type Mode = 'choice' | 'spell' | 'spell-done' | 'sentence-list';
type SentenceSource = { sentenceEnglish: string; sentenceChinese: string; targetWord: string; entryId: string };

export default function ReviewPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>('choice');

  // 句子列表
  const [sentences, setSentences] = useState<SentenceSource[]>([]);
  const [entries, setEntries] = useState<ReviewEntry[]>([]);
  const [sentenceLoading, setSentenceLoading] = useState(true);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  // 拼写
  const [spellWords, setSpellWords] = useState<Word[]>([]);
  const [spellIndex, setSpellIndex] = useState(0);
  const [spellInput, setSpellInput] = useState('');
  const [spellSubmitted, setSpellSubmitted] = useState(false);
  const [spellCorrect, setSpellCorrect] = useState(false);
  const [spellWrong, setSpellWrong] = useState<Word[]>([]);
  const [spellScore, setSpellScore] = useState(0);
  const spellJumped = useRef(false);

  // 加载今日单词（用于拼写）
  async function loadSpellWords() {
    const ids = await getDueWordIds();
    const all = await db.words.bulkGet(ids);
    const valid = all.filter(Boolean) as Word[];
    setSpellWords(valid.sort(() => Math.random() - 0.5));
    setSpellIndex(0);
    setSpellInput('');
    setSpellSubmitted(false);
    setSpellWrong([]);
    setSpellScore(0);
  }

  // 加载句子（优先收藏，否则弹窗选择范围）
  async function loadSentences(reviewAll: boolean) {
    const bookmarked = await db.reviewEntries.orderBy('dateAdded').reverse().toArray();
    setEntries(bookmarked);
    setShowReviewDialog(false);

    if (bookmarked.length > 0) {
      setSentences(bookmarked.map((e) => ({
        sentenceEnglish: e.sentenceEnglish,
        sentenceChinese: e.sentenceChinese,
        targetWord: e.targetWord,
        entryId: e.id,
      })));
    } else {
      const ids = await getDueWordIds();
      const allWords = (await db.words.bulkGet(ids)).filter(Boolean) as Word[];
      const progressAll = await db.learningProgress.bulkGet(ids);

      // 区分"认识"（stage 前进）和"不熟悉"（stage 未前进）
      const familiar: Word[] = [];
      const unfamiliar: Word[] = [];
      for (const w of allWords) {
        const p = progressAll.find((pp) => pp?.wordId === w.id);
        if (p && p.ebbinghausStage >= 3) familiar.push(w);
        else unfamiliar.push(w);
      }

      const pool = reviewAll ? allWords : unfamiliar.length > 0 ? unfamiliar : allWords;
      const selected = pool.sort(() => Math.random() - 0.5).slice(0, 8);
      setSentences(selected.map((w) => {
        const ex = w.exampleSentences[Math.floor(Math.random() * w.exampleSentences.length)];
        return { sentenceEnglish: ex.english, sentenceChinese: ex.chinese, targetWord: w.word, entryId: `gen-${w.id}` };
      }));
    }
    setSentenceLoading(false);
  }

  async function handleSentenceClick() {
    const bookmarked = await db.reviewEntries.count();
    if (bookmarked > 0) {
      setSentenceLoading(true);
      await loadSentences(true);
      setMode('sentence-list');
    } else {
      setShowReviewDialog(true);
    }
  }

  function speak(text: string) {
    speakEnglish(text);
  }

  function handleSpellSubmit() {
    if (spellSubmitted) return;
    const answer = spellInput.trim().toLowerCase();
    const ok = answer === spellWords[spellIndex].word.toLowerCase();
    setSpellCorrect(ok);
    setSpellSubmitted(true);
    if (ok) setSpellScore((s) => s + 1);
    else setSpellWrong((prev) => [...prev, spellWords[spellIndex]]);
    setTimeout(() => handleSpellNext(), 1200);
  }

  // 自动聚焦拼写输入
  useEffect(() => {
    if (mode === 'spell' && !spellSubmitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode, spellIndex, spellSubmitted]);

  function handleSpellNext() {
    if (spellJumped.current) return;
    spellJumped.current = true;
    if (spellIndex + 1 < spellWords.length) {
      setSpellIndex((i) => i + 1);
      setSpellInput('');
      setSpellSubmitted(false);
      spellJumped.current = false;
    } else if (spellWrong.length > 0) {
      setSpellWords([...spellWrong]);
      setSpellWrong([]);
      setSpellIndex(0);
      setSpellInput('');
      setSpellSubmitted(false);
      spellJumped.current = false;
    } else {
      setMode('spell-done');
    }
  }

  // ========= 选择页 =========
  if (mode === 'choice') {
    return (
      <div className="flex flex-col gap-5">
        <div className="text-center pt-4 pb-2">
          <p className="text-3xl mb-2">🌙</p>
          <h2 className="text-lg font-bold text-ink">晚间复习</h2>
          <p className="text-xs text-ink-muted mt-1">选择一种模式开始复习</p>
        </div>

        <button onClick={async () => { await loadSpellWords(); setMode('spell'); }}
          className="bg-paper rounded-2xl border border-rule p-6 text-left cursor-pointer
            hover:border-ink/30 hover:shadow-sm active:scale-[0.98] transition-all">
          <span className="text-3xl">✏️</span>
          <h3 className="text-base font-medium text-ink mt-3">拼写单词</h3>
          <p className="text-xs text-ink-muted mt-1">
            看中文释义和听发音，拼写出对应的英文单词。错词自动重测。
          </p>
        </button>

        <button onClick={handleSentenceClick}
          className="bg-paper rounded-2xl border border-rule p-6 text-left cursor-pointer
            hover:border-ink/30 hover:shadow-sm active:scale-[0.98] transition-all">
          <span className="text-3xl">📝</span>
          <h3 className="text-base font-medium text-ink mt-3">造句练习</h3>
          <p className="text-xs text-ink-muted mt-1">
            根据中文提示造句，AI 批改语法和搭配。
            {entries.length > 0 ? ` 已有 ${entries.length} 条收藏` : ' 从今日单词中抽取例句'}
          </p>
        </button>

        {/* 无收藏时的弹窗 */}
        {showReviewDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6"
            onClick={() => setShowReviewDialog(false)}>
            <div className="bg-paper rounded-2xl p-6 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}>
              <p className="text-lg mb-2">📋</p>
              <p className="text-sm font-medium text-ink mb-1">没有收藏的例句</p>
              <p className="text-xs text-ink-muted mb-5">要把今日学过的单词都拿来造句吗？</p>
              <div className="flex gap-3">
                <button onClick={async () => { setSentenceLoading(true); await loadSentences(false); setMode('sentence-list'); }}
                  className="flex-1 py-2.5 rounded-full border border-rule text-sm text-ink-light cursor-pointer hover:border-ink/30">
                  只练不熟悉的
                </button>
                <button onClick={async () => { setSentenceLoading(true); await loadSentences(true); setMode('sentence-list'); }}
                  className="flex-1 py-2.5 rounded-full bg-ink text-paper text-sm cursor-pointer hover:opacity-90">
                  全部复习
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========= 拼写测试 =========
  if (mode === 'spell') {
    if (spellWords.length === 0) {
      return (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <p className="text-4xl">📚</p>
          <p className="text-sm text-ink-light">今天还没有学过的单词</p>
          <button onClick={() => navigate('/')} className="mt-2 px-6 py-2 bg-ink text-paper rounded-full text-sm cursor-pointer">回首页</button>
        </div>
      );
    }
    const w = spellWords[spellIndex];
    return (
      <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-rule rounded-full overflow-hidden">
            <div className="h-full bg-ink rounded-full transition-all duration-500"
              style={{ width: `${((spellIndex + 1) / spellWords.length) * 100}%` }} />
          </div>
          <span className="text-xs text-ink-muted">{spellIndex + 1}/{spellWords.length}</span>
          <span className="text-xs text-ink font-medium">{spellScore}✓</span>
        </div>
        <div className="bg-paper rounded-2xl border border-rule p-8 text-center">
          <p className="text-lg text-ink mb-1">{w.chineseDefinition}</p>
          <p className="text-xs text-ink-muted mb-4">{w.partOfSpeech}</p>
          <button onClick={() => speak(w.word)}
            className="w-14 h-14 rounded-full border-2 border-ink mx-auto flex items-center justify-center
              cursor-pointer hover:bg-ink hover:text-paper active:scale-90 transition-all">
            🔊
          </button>
        </div>
        {!spellSubmitted ? (
          <div className="flex gap-2">
            <input ref={inputRef} value={spellInput}
              onChange={(e) => setSpellInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSpellSubmit(); }}
              placeholder="输入单词拼写..."
              className="flex-1 px-4 py-3 rounded-xl border border-rule bg-paper text-sm focus:outline-none focus:border-ink" />
            <button onClick={handleSpellSubmit} disabled={!spellInput.trim()}
              className="px-6 py-3 bg-ink text-paper rounded-xl text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-40">确定</button>
          </div>
        ) : (
          <div>
            <div className={`p-4 rounded-xl text-sm mb-3 ${spellCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {spellCorrect ? '✅ 正确！' : <>❌ 正确答案：<span className="font-semibold">{w.word}</span></>}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========= 拼写完成 =========
  if (mode === 'spell-done') {
    const total = spellWords.length + spellWrong.length;
    const pct = total > 0 ? Math.round((spellScore / total) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
        <span className="text-5xl">{pct === 100 ? '🏆' : '💪'}</span>
        <h2 className="text-xl font-bold text-ink">拼写完成</h2>
        <p className="text-sm text-ink-light">{spellScore} / {total} 正确</p>
        <button onClick={() => { setMode('choice'); }} className="px-6 py-2.5 bg-ink text-paper rounded-full text-sm cursor-pointer">返回</button>
      </div>
    );
  }

  // ========= 句子列表（收藏或生成） =========
  if (mode === 'sentence-list') {
    if (sentenceLoading) {
      return <div className="flex justify-center py-20"><div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" /></div>;
    }
    const isBookmarked = entries.length > 0;
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center pt-1">
          <p className="text-sm font-medium text-ink">{isBookmarked ? `收藏例句 (${sentences.length})` : `今日单词例句 (${sentences.length})`}</p>
          <p className="text-xs text-ink-muted mt-1">
            {isBookmarked ? '以下是你收藏的句子' : '无收藏，从今日单词中随机抽取'}
          </p>
        </div>
        <div className="space-y-2">
          {sentences.map((s, i) => (
            <div key={i} className="bg-paper rounded-xl p-4 border border-rule">
              <p className="text-[13px] text-ink leading-relaxed">{s.sentenceChinese}</p>
            </div>
          ))}
        </div>
        <button onClick={() => { useReviewStore.getState().setSentences(sentences); navigate('/review/session'); }}
          className="w-full py-3 bg-ink text-paper rounded-full text-sm font-medium cursor-pointer hover:opacity-90">
          开始造句 ({sentences.length} 句)
        </button>
      </div>
    );
  }

  return <div className="flex justify-center py-20"><div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" /></div>;
}
