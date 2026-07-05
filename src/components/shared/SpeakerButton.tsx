import { useState } from 'react';

interface SpeakerButtonProps {
  text: string;      // 要朗读的文字
  lang?: string;     // 语言，默认 en-US
  size?: 'sm' | 'md';
}

/**
 * 发音按钮 — 点击调用 Web Speech API 朗读文字
 */
export function SpeakerButton({ text, lang = 'en-US', size = 'md' }: SpeakerButtonProps) {
  const [playing, setPlaying] = useState(false);

  function speak() {
    if (playing) return; // 防止连点

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;  // 稍慢，更清晰

    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);

    window.speechSynthesis.cancel(); // 取消之前的朗读
    window.speechSynthesis.speak(utterance);
  }

  const sizeClass = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={speak}
      className={`${sizeClass} rounded-full border border-rule bg-paper
        flex items-center justify-center cursor-pointer
        hover:bg-ink hover:text-paper hover:border-ink
        active:scale-90 transition-all duration-200
        ${playing ? 'bg-ink text-paper border-ink' : 'text-ink'}`}
      aria-label={`朗读: ${text}`}
    >
      <svg className={iconSize} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" className={playing ? '' : 'opacity-70'} />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" className={playing ? '' : 'opacity-50'} />
      </svg>
    </button>
  );
}
