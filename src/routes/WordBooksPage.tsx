import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import type { WordBookMeta } from '../types/wordbook';

export default function WordBooksPage() {
  const [books, setBooks] = useState<WordBookMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    db.wordBooks.toArray()
      .then((data) => {
        console.log('[Recollection] 词书数据:', data);
        // 手动按 order 排序
        const sorted = data.sort((a, b) => a.order - b.order);
        setBooks(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[Recollection] 词书加载失败:', err);
        setError(String(err));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <p className="text-sm text-ink-light">数据加载失败</p>
        <p className="text-xs text-ink-muted">{error}</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <p className="text-sm text-ink-light">还没有词书数据</p>
        <p className="text-xs text-ink-muted">请刷新页面重试</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 头部 */}
      <div className="text-center pt-4 pb-2">
        <p className="text-3xl mb-2">👋</p>
        <h2 className="text-lg font-bold text-ink">选择适合你的词书</h2>
        <p className="text-xs text-ink-muted mt-1">选定词书后，可自定义今日学习数量</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {books.map((book) => (
          <button
            key={book.id}
            onClick={() => {
              if (book.wordCount > 0) {
                navigate(`/learn/${book.id}`);
              }
            }}
            disabled={book.wordCount === 0}
            className={`bg-paper rounded-2xl p-5 border border-rule text-left transition-all cursor-pointer
              ${book.wordCount > 0
                ? 'hover:border-ink/30 hover:shadow-sm active:scale-[0.98]'
                : 'opacity-50 cursor-not-allowed'
              }`}
          >
            <span className="text-3xl">{book.icon}</span>
            <h3 className="text-base font-medium text-ink mt-3">{book.name}</h3>
            <p className="text-xs text-ink-light mt-0.5">{book.nameZh}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                book.wordCount > 0
                  ? 'bg-ink text-paper'
                  : 'bg-rule text-ink-muted'
              }`}>
                {book.wordCount > 0 ? `${book.wordCount} 词` : '即将上线'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
