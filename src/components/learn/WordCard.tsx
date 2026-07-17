import { useState } from 'react';
import type { Word } from '../../types/word';
import { SpeakerButton } from '../shared/SpeakerButton';
import { createWordFormsRegex } from '../../utils/wordForms';
import { speakEnglish } from '../../services/speechService';

interface WordCardProps {
  word: Word;
  bookmarks: Map<number, boolean>;
  onToggleBookmark: (sentenceIndex: number) => void;
}

/** 将文本中的目标词及常见规则变形用 <mark> 高亮。 */
function highlightWord(text: string, target: string): React.ReactNode {
  const regex = createWordFormsRegex(target);
  if (!regex) return text;

  const children: React.ReactNode[] = [];
  let cursor = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    // 匹配前的普通文本
    if (m.index > cursor) {
      children.push(text.slice(cursor, m.index));
    }
    // 高亮的单词（保留原文大小写）
    children.push(
      <mark key={m.index} className="bg-transparent text-word font-semibold">
        {m[0]}
      </mark>,
    );
    cursor = regex.lastIndex;
  }

  // 剩余文本
  if (cursor < text.length) {
    children.push(text.slice(cursor));
  }

  return children.length > 0 ? <>{children}</> : text;
}

/** 小喇叭 SVG */
function TinySpeaker({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

export function WordCard({ word, bookmarks, onToggleBookmark }: WordCardProps) {
  const [activeSentence, setActiveSentence] = useState(0);
  const sentences = word.exampleSentences;
  const current = sentences[activeSentence];
  const total = sentences.length;

  function goNext() { setActiveSentence((prev) => (prev + 1) % total); }
  function goPrev() { setActiveSentence((prev) => (prev - 1 + total) % total); }

  function speakSentence() {
    speakEnglish(current.english);
  }

  const isBookmarked = bookmarks.get(activeSentence) ?? false;

  return (
    <div className="bg-paper rounded-2xl border border-rule overflow-hidden">
      {/* ---- 单词信息 ---- */}
      <div className="px-6 pt-8 pb-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-[32px] font-bold text-ink tracking-tight">{word.word}</h1>
          <SpeakerButton text={word.word} />
        </div>
        <p className="text-sm text-ink-muted mb-3">{word.phonetic}</p>
        <p className="text-base text-ink-light">
          <span className="font-medium text-ink">{word.partOfSpeech}</span>
          &nbsp;&nbsp;{word.chineseDefinition}
        </p>
      </div>

      {/* ---- 例句 ---- */}
      <div className="border-t border-rule bg-paper-off">
        <div className="px-6 py-5 min-h-[130px]">
          <p className="text-[15px] text-ink leading-relaxed mb-2">
            {highlightWord(current.english, word.word)}
          </p>
          <p className="text-[13px] text-ink-light leading-relaxed">
            {current.chinese}
          </p>
          {current.source && (
            <p className="text-[11px] text-ink-muted mt-3">— {current.source}</p>
          )}
        </div>

        {/* 操作栏 */}
        <div className="flex items-center justify-between px-4 pb-4">
          {/* 左 */}
          <button
            onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full
              text-ink-muted hover:text-ink hover:bg-rule/50 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* 页码 + 朗读 */}
          <div className="flex items-center gap-3">
            <button
              onClick={speakSentence}
              className="text-ink-muted hover:text-ink cursor-pointer transition-colors"
              aria-label="朗读例句"
            >
              <TinySpeaker className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {sentences.map((_, i) => (
                <span
                  key={i}
                  className={`block rounded-full transition-all duration-300 ${
                    i === activeSentence
                      ? 'w-5 h-1.5 bg-ink'
                      : 'w-1.5 h-1.5 bg-ink-muted/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 右 */}
          <button
            onClick={goNext}
            className="w-8 h-8 flex items-center justify-center rounded-full
              text-ink-muted hover:text-ink hover:bg-rule/50 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* 收藏 */}
          <button
            onClick={() => onToggleBookmark(activeSentence)}
            className={`cursor-pointer transition-all duration-200 active:scale-90 ${
              isBookmarked ? 'text-word' : 'text-ink-muted hover:text-ink'
            }`}
            aria-label={isBookmarked ? '取消收藏' : '收藏例句'}
          >
            <svg className="w-5 h-5 transition-transform" viewBox="0 0 24 24"
              fill={isBookmarked ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
