import { useState, useEffect } from 'react';
import { db } from '../db/schema';
import { t } from '../services/i18n';
import type { AccumulationEntry } from '../types/accumulate';

export default function AccumulatePage() {
  const [entries, setEntries] = useState<AccumulationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // 表单
  const [formExpr, setFormExpr] = useState('');
  const [formSentence, setFormSentence] = useState('');
  const [formChinese, setFormChinese] = useState('');
  const [formTags, setFormTags] = useState('');

  function loadEntries() {
    db.accumulationEntries.orderBy('dateAdded').reverse().toArray()
      .then(setEntries);
  }

  useEffect(() => { loadEntries(); setLoading(false); }, []);

  async function handleAdd() {
    if (!formExpr.trim()) return;
    await db.accumulationEntries.put({
      id: crypto.randomUUID(),
      expression: formExpr.trim(),
      contextSentence: formSentence.trim(),
      chineseTranslation: formChinese.trim(),
      source: 'manual',
      tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: '',
      dateAdded: Date.now(),
      reviewedCount: 0,
    });
    setFormExpr(''); setFormSentence(''); setFormChinese(''); setFormTags('');
    setShowAdd(false);
    loadEntries();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* 头部 */}
      <div className="text-center pt-2 pb-1">
        <p className="text-3xl mb-2">📔</p>
        <h2 className="text-lg font-bold text-ink">{t('home.accBtn')}</h2>
        <p className="text-xs text-ink-muted mt-1">
          {entries.length === 0 ? '收藏地道表达，构建专属语料库' : `${entries.length} 条收藏`}
        </p>
      </div>

      {/* 空状态 */}
      {entries.length === 0 && !showAdd && (
        <div className="flex flex-col items-center py-12 gap-3">
          <p className="text-4xl">📭</p>
          <p className="text-sm text-ink-light">还没有积累内容</p>
          <p className="text-xs text-ink-muted text-center max-w-[240px]">
            复习本中 AI 建议的表达可以一键添加，也可以手动输入你从其他地方学到的内容
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-2 px-6 py-2 bg-ink text-paper rounded-full text-sm cursor-pointer hover:opacity-90"
          >
            + 手动添加
          </button>
        </div>
      )}

      {/* 列表 */}
      {entries.map((entry) => (
        <div key={entry.id} className="bg-paper rounded-xl border border-rule p-4">
          {/* 表达 */}
          <p className="text-base font-semibold text-ink">{entry.expression}</p>

          {/* 例句 */}
          {entry.contextSentence && (
            <p className="text-sm text-ink-light mt-2 leading-relaxed">
              {entry.contextSentence}
            </p>
          )}

          {/* 中文翻译 */}
          {entry.chineseTranslation && (
            <p className="text-xs text-ink-muted mt-1">{entry.chineseTranslation}</p>
          )}

          {/* 底部标签行 */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              entry.source === 'ai-suggested'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-rule text-ink-muted'
            }`}>
              {entry.source === 'ai-suggested' ? 'AI 推荐' : '手动添加'}
            </span>
            {entry.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-paper-off text-ink-muted border border-rule">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* 浮动添加按钮 */}
      {entries.length > 0 && !showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-20 right-4 z-40 w-12 h-12 bg-ink text-paper rounded-full
            flex items-center justify-center shadow-lg cursor-pointer
            hover:opacity-90 active:scale-90 transition-all text-2xl"
        >
          +
        </button>
      )}

      {/* 添加表单（底部弹出） */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="bg-paper rounded-t-2xl w-full max-w-lg p-6 pb-8 animate-slide-up">
            <h3 className="text-sm font-medium text-ink mb-4">添加地道表达</h3>

            <input value={formExpr} onChange={(e) => setFormExpr(e.target.value)}
              placeholder="表达内容（必填）*"
              className="w-full px-4 py-2.5 rounded-xl border border-rule bg-paper-off text-sm mb-3
                focus:outline-none focus:border-ink" />

            <input value={formSentence} onChange={(e) => setFormSentence(e.target.value)}
              placeholder="例句（选填）"
              className="w-full px-4 py-2.5 rounded-xl border border-rule bg-paper-off text-sm mb-3
                focus:outline-none focus:border-ink" />

            <input value={formChinese} onChange={(e) => setFormChinese(e.target.value)}
              placeholder="中文释义（选填）"
              className="w-full px-4 py-2.5 rounded-xl border border-rule bg-paper-off text-sm mb-3
                focus:outline-none focus:border-ink" />

            <input value={formTags} onChange={(e) => setFormTags(e.target.value)}
              placeholder="标签，逗号分隔（选填）"
              className="w-full px-4 py-2.5 rounded-xl border border-rule bg-paper-off text-sm mb-4
                focus:outline-none focus:border-ink" />

            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-full border border-rule text-sm text-ink-muted cursor-pointer">
                取消
              </button>
              <button onClick={handleAdd} disabled={!formExpr.trim()}
                className="flex-1 py-2.5 rounded-full bg-ink text-paper text-sm font-medium cursor-pointer
                  hover:opacity-90 disabled:opacity-40">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
