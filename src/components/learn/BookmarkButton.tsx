import { useState } from 'react';

interface BookmarkButtonProps {
  bookmarked: boolean;
  onToggle: () => void;
}

/**
 * 例句收藏按钮 — 点击切换收藏状态
 */
export function BookmarkButton({ bookmarked, onToggle }: BookmarkButtonProps) {
  const [animating, setAnimating] = useState(false);

  function handleClick() {
    setAnimating(true);
    onToggle();
    setTimeout(() => setAnimating(false), 300);
  }

  return (
    <button
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-200 active:scale-90 ${
        bookmarked ? 'text-word' : 'text-ink-muted hover:text-ink'
      }`}
      aria-label={bookmarked ? '取消收藏' : '收藏例句'}
    >
      <svg
        className={`w-5 h-5 ${animating ? 'scale-125' : ''} transition-transform`}
        viewBox="0 0 24 24"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
