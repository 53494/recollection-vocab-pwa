import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import type { Word } from '../types/word';
import { speakEnglish } from '../services/speechService';

type Phase = 'recognize' | 'spell' | 'result';

export default function WeeklyReviewPage() {
  const navigate = useNavigate();
  const spellRef = useRef<HTMLInputElement>(null);

  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('recognize');

  // 认识测试
  const [recIndex, setRecIndex] = useState(0);
  const [options, setOptions] = useState<Word[]>([]);
  const [recSelected, setRecSelected] = useState<string | null>(null);
  const [recCorrect, setRecCorrect] = useState(0);
  const [recWrong, setRecWrong] = useState<Word[]>([]);

  // 拼写测试
  const [spellList, setSpellList] = useState<Word[]>([]);
  const [spellIndex, setSpellIndex] = useState(0);
  const [spellInput, setSpellInput] = useState('');
  const [spellSubmitted, setSpellSubmitted] = useState(false);
  const [spellOk, setSpellOk] = useState(false);
  const [spellCorrect, setSpellCorrect] = useState(0);
  const [spellWrong, setSpellWrong] = useState<Word[]>([]);
  const spellJumped = useRef(false);

  // 加载本周学过的单词
  useEffect(() => {
    (async () => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const startTs = weekStart.getTime();
      const all = await db.learningProgress.toArray();
      const weekIds = all.filter((p) => p.lastReviewedAt >= startTs).map((p) => p.wordId);
      const arr = (await db.words.bulkGet(weekIds)).filter(Boolean) as Word[];
      setWords(arr.sort(() => Math.random() - 0.5));
      setLoading(false);
    })();
  }, []);

  // 生成认识选项
  useEffect(() => {
    if (phase === 'recognize' && words.length > 0 && recIndex < words.length) {
      generateOptions(words[recIndex]);
    }
  }, [phase, recIndex, words]);

  async function generateOptions(correct: Word) {
    const sameBook = await db.words.where({ bookId: correct.bookId }).toArray();
    const others = sameBook.filter((w) => w.id !== correct.id)
      .sort(() => Math.random() - 0.5).slice(0, 3);
    setOptions([correct, ...others].sort(() => Math.random() - 0.5));
  }

  // === 认识 ===
  function handleRecPick(opt: Word) {
    if (recSelected) return;
    const ok = opt.id === words[recIndex].id;
    setRecSelected(opt.id);
    if (ok) setRecCorrect((s) => s + 1);
    else setRecWrong((prev) => [...prev, words[recIndex]]);
    setTimeout(() => {
      if (recIndex + 1 < words.length) {
        setRecIndex((i) => i + 1);
        setRecSelected(null);
      } else {
        // 进入拼写
        setSpellList(words);
        setPhase('spell');
      }
    }, 1000);
  }

  // === 拼写 ===
  function speak(w: string) {
    speakEnglish(w);
  }

  function handleSpellSubmit() {
    if (spellSubmitted) return;
    const ok = spellInput.trim().toLowerCase() === spellList[spellIndex].word.toLowerCase();
    setSpellOk(ok);
    setSpellSubmitted(true);
    if (ok) setSpellCorrect((s) => s + 1);
    else setSpellWrong((prev) => [...prev, spellList[spellIndex]]);
    setTimeout(() => handleSpellNext(), 1200);
  }

  function handleSpellNext() {
    if (spellJumped.current) return;
    spellJumped.current = true;
    if (spellIndex + 1 < spellList.length) {
      setSpellIndex((i) => i + 1);
      setSpellInput('');
      setSpellSubmitted(false);
      spellJumped.current = false;
    } else if (spellWrong.length > 0) {
      setSpellList([...spellWrong]);
      setSpellWrong([]);
      setSpellIndex(0);
      setSpellInput('');
      setSpellSubmitted(false);
      spellJumped.current = false;
    } else {
      setPhase('result');
    }
  }

  useEffect(() => {
    if (phase === 'spell' && !spellSubmitted && spellRef.current) spellRef.current.focus();
  }, [phase, spellIndex, spellSubmitted]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" /></div>;
  }

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-center">
        <p className="text-4xl">📚</p>
        <p className="text-sm text-ink-light">本周还没有学过的单词</p>
        <button onClick={() => navigate('/')} className="mt-2 px-6 py-2 bg-ink text-paper rounded-full text-sm cursor-pointer">回首页</button>
      </div>
    );
  }

  // === 认识测试 ===
  if (phase === 'recognize') {
    const w = words[recIndex];
    return (
      <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-rule rounded-full overflow-hidden">
            <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${((recIndex + 1) / words.length) * 100}%` }} />
          </div>
          <span className="text-xs text-ink-muted">{recIndex + 1}/{words.length}</span>
          <span className="text-xs text-green-600 font-medium">{recCorrect}✓</span>
        </div>
        <p className="text-xs text-ink-muted text-center">Phase 1/2 — 认识单词</p>
        <div className="bg-paper rounded-2xl border border-rule p-8 text-center">
          <h2 className="text-3xl font-bold text-ink">{w.word}</h2>
          <button onClick={() => speak(w.word)} className="mt-3 text-ink-muted hover:text-ink cursor-pointer">🔊</button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {options.map((opt) => {
            let bg = 'bg-paper border-rule';
            if (recSelected === opt.id) {
              bg = opt.id === w.id ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400';
            }
            return (
              <button key={opt.id} onClick={() => handleRecPick(opt)} disabled={!!recSelected}
                className={`w-full p-4 rounded-xl border text-left text-sm transition-all ${bg} ${!recSelected ? 'hover:border-ink/30 cursor-pointer' : ''}`}>
                {opt.chineseDefinition}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // === 拼写 ===
  if (phase === 'spell') {
    const w = spellList[spellIndex];
    return (
      <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-rule rounded-full overflow-hidden">
            <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${((spellIndex + 1) / spellList.length) * 100}%` }} />
          </div>
          <span className="text-xs text-ink-muted">{spellIndex + 1}/{spellList.length}</span>
          <span className="text-xs text-green-600 font-medium">{spellCorrect}✓</span>
        </div>
        <p className="text-xs text-ink-muted text-center">Phase 2/2 — 拼写单词</p>
        <div className="bg-paper rounded-2xl border border-rule p-8 text-center">
          <p className="text-lg text-ink mb-1">{w.chineseDefinition}</p>
          <button onClick={() => speak(w.word)} className="mt-3 text-ink-muted hover:text-ink cursor-pointer">🔊</button>
        </div>
        {!spellSubmitted ? (
          <div className="flex gap-2">
            <input ref={spellRef} value={spellInput} onChange={(e) => setSpellInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSpellSubmit(); }}
              placeholder="输入单词拼写..." autoFocus
              className="flex-1 px-4 py-3 rounded-xl border border-rule bg-paper text-sm focus:outline-none focus:border-ink" />
            <button onClick={handleSpellSubmit} disabled={!spellInput.trim()}
              className="px-6 py-3 bg-ink text-paper rounded-xl text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-40">确定</button>
          </div>
        ) : (
          <div className={`p-4 rounded-xl text-sm ${spellOk ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {spellOk ? '✅ 正确！' : <>❌ 正确答案：<span className="font-semibold">{w.word}</span></>}
          </div>
        )}
      </div>
    );
  }

  // === 结果 ===
  if (phase === 'result') {
    const recTotal = words.length;
    const spellTotal = words.length;
    const recPct = recTotal > 0 ? Math.round((recCorrect / recTotal) * 100) : 0;
    const spellPct = spellTotal > 0 ? Math.round((spellCorrect / spellTotal) * 100) : 0;

    return (
      <div className="flex flex-col items-center gap-5 text-center pb-8">
        <span className="text-5xl mt-8">{recPct + spellPct > 160 ? '🏆' : '💪'}</span>
        <h2 className="text-xl font-bold text-ink">每周复习完成</h2>
        <div className="flex gap-6">
          <div>
            <p className="text-2xl font-bold text-ink">{recCorrect}/{recTotal}</p>
            <p className="text-xs text-ink-muted">认识 {recPct}%</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-ink">{spellCorrect}/{spellTotal}</p>
            <p className="text-xs text-ink-muted">拼写 {spellPct}%</p>
          </div>
        </div>
        <button onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-ink text-paper rounded-full text-sm cursor-pointer">返回首页</button>
      </div>
    );
  }

  return <div className="flex justify-center py-20"><div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" /></div>;
}
