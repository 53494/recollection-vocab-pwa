import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import { getDueWordIds } from '../services/dataService';
import type { Word } from '../types/word';
import { speakEnglish } from '../services/speechService';

export default function TodayWordsPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [spelling, setSpelling] = useState(false);
  const [spellIndex, setSpellIndex] = useState(0);
  const [spellInput, setSpellInput] = useState('');
  const [spellSubmitted, setSpellSubmitted] = useState(false);
  const [spellCorrect, setSpellCorrect] = useState(false);
  const [spellWrong, setSpellWrong] = useState<Word[]>([]);
  const [spellScore, setSpellScore] = useState(0);
  const spellJumped = useRef(false);

  useEffect(() => {
    (async () => {
      const ids = await getDueWordIds();
      const all = await db.words.bulkGet(ids);
      const valid = (all.filter(Boolean) as Word[]);
      setWords(valid);
      setLoading(false);
    })();
  }, []);

  function speak(word: string) {
    speakEnglish(word);
  }

  function handleSpellSubmit() {
    if (spellSubmitted) return;
    const ok = spellInput.trim().toLowerCase() === words[spellIndex].word.toLowerCase();
    setSpellCorrect(ok);
    setSpellSubmitted(true);
    if (ok) setSpellScore((s) => s + 1);
    else setSpellWrong((prev) => [...prev, words[spellIndex]]);
    setTimeout(() => handleSpellNext(), 1200);
  }

  useEffect(() => {
    if (spelling && !spellSubmitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [spelling, spellIndex, spellSubmitted]);

  function handleSpellNext() {
    if (spellJumped.current) return;
    spellJumped.current = true;
    if (spellIndex + 1 < words.length) {
      setSpellIndex((i) => i + 1);
      setSpellInput('');
      setSpellSubmitted(false);
      spellJumped.current = false;
    } else if (spellWrong.length > 0) {
      const retryWords = [...spellWrong];
      setSpellWrong([]);
      setWords(retryWords);
      setSpellIndex(0);
      setSpellInput('');
      setSpellSubmitted(false);
      spellJumped.current = false;
    } else {
      setSpelling(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" /></div>;
  }

  if (spelling) {
    return (
      <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-rule rounded-full overflow-hidden">
            <div className="h-full bg-ink rounded-full transition-all duration-500"
              style={{ width: `${((spellIndex + 1) / words.length) * 100}%` }} />
          </div>
          <span className="text-xs text-ink-muted">{spellIndex + 1}/{words.length}</span>
          <span className="text-xs text-ink font-medium">{spellScore}✓</span>
        </div>
        <div className="bg-paper rounded-2xl border border-rule p-8 text-center">
          <p className="text-lg text-ink mb-1">{words[spellIndex].chineseDefinition}</p>
          <button onClick={() => speak(words[spellIndex].word)}
            className="w-14 h-14 rounded-full border-2 border-ink mx-auto flex items-center justify-center
              cursor-pointer hover:bg-ink hover:text-paper active:scale-90 transition-all mt-3">🔊</button>
        </div>
        {!spellSubmitted ? (
          <div className="flex gap-2">
            <input ref={inputRef} value={spellInput}
              onChange={(e) => setSpellInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSpellSubmit(); }}
              placeholder="输入单词拼写..." autoFocus
              className="flex-1 px-4 py-3 rounded-xl border border-rule bg-paper text-sm focus:outline-none focus:border-ink" />
            <button onClick={handleSpellSubmit} disabled={!spellInput.trim()}
              className="px-6 py-3 bg-ink text-paper rounded-xl text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-40">确定</button>
          </div>
        ) : (
          <div className={`p-4 rounded-xl text-sm mb-3 ${spellCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {spellCorrect ? '✅ 正确！' : <>❌ 正确答案：<span className="font-semibold">{words[spellIndex].word}</span></>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="text-center pt-2 pb-1">
        <p className="text-3xl mb-2">📖</p>
        <h2 className="text-lg font-bold text-ink">今日新学单词</h2>
        <p className="text-xs text-ink-muted mt-1">{words.length} 个单词</p>
      </div>

      {words.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <p className="text-4xl">📚</p>
          <p className="text-sm text-ink-light">今天还没有学过的单词</p>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {words.map((w) => (
              <div key={w.id} className="bg-paper rounded-xl border border-rule p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{w.word}</p>
                  <p className="text-xs text-ink-muted">{w.chineseDefinition}</p>
                </div>
                <button onClick={() => speak(w.word)}
                  className="text-ink-muted hover:text-ink cursor-pointer p-1">🔊</button>
              </div>
            ))}
          </div>
          <button onClick={() => { setSpellIndex(0); setSpellScore(0); setSpellWrong([]); setSpelling(true); }}
            className="w-full py-3 bg-ink text-paper rounded-full text-sm font-medium cursor-pointer hover:opacity-90">
            ✏️ 拼写练习
          </button>
        </>
      )}
    </div>
  );
}
