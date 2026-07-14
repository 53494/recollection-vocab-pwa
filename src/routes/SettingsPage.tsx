import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import { t, getLang, setLang, type Lang } from '../services/i18n';
import { useThemeStore, ACCENT_PRESETS, SPLASH_PRESETS, type ThemeMode } from '../stores/useThemeStore';
import { useActiveBookStore, type DailyGoal } from '../stores/useActiveBookStore';

export default function SettingsPage() {
  const navigate = useNavigate();

  /* ---- 主题 ---- */
  const { mode, accentColor, splashColor, setMode, setAccentColor, setSplashColor } = useThemeStore();

  /* ---- 每日目标 ---- */
  const activeStore = useActiveBookStore();

  /* ---- 语言 ---- */
  const [lang, setLangState] = useState<Lang>(getLang());
  function switchLang(l: Lang) { setLangState(l); setLang(l); window.location.reload(); }

  /* ---- 数据导出 ---- */
  async function exportData() {
    const data = {
      wordBooks: await db.wordBooks.toArray(),
      words: await db.words.toArray(),
      learningProgress: await db.learningProgress.toArray(),
      reviewEntries: await db.reviewEntries.toArray(),
      reviewAttempts: await db.reviewAttempts.toArray(),
      accumulationEntries: await db.accumulationEntries.toArray(),
      selfTestAttempts: await db.selfTestAttempts.toArray(),
      dailyLogs: await db.dailyLogs.toArray(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recollection-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ---- 数据导入 ---- */
  async function importData(file: File) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!window.confirm('导入将覆盖当前所有数据，确定继续？')) return;
      await db.transaction('rw', db.tables, async () => {
        for (const tableName of ['wordBooks', 'words', 'learningProgress', 'reviewEntries', 'reviewAttempts', 'accumulationEntries', 'selfTestAttempts', 'dailyLogs'] as const) {
          if (data[tableName]) {
            await db.table(tableName).clear();
            await db.table(tableName).bulkPut(data[tableName]);
          }
        }
      });
      window.location.reload();
    } catch {
      alert('文件格式不正确');
    }
  }

  /* ---- 反馈 ---- */
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  function sendFeedback() {
    if (!feedbackText.trim()) return;
    // Demo: 保存到 localStorage
    const existing = JSON.parse(localStorage.getItem('recollection_feedback') || '[]');
    existing.push({ text: feedbackText.trim(), date: new Date().toISOString() });
    localStorage.setItem('recollection_feedback', JSON.stringify(existing));
    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 2500);
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* ======== 主题 ======== */}
      <div className="bg-paper rounded-2xl border border-rule p-5">
        <h3 className="text-sm font-medium text-ink mb-3">{t('settings.theme')}</h3>

        {/* 日/夜间模式 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-ink-light">{t('settings.day')} / {t('settings.night')}</span>
          <div className="flex gap-1 bg-rule/50 rounded-full p-0.5">
            {(['light', 'dark'] as ThemeMode[]).map((m) => (
              <button key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-full text-xs cursor-pointer transition-all
                  ${mode === m ? 'bg-ink text-paper shadow-sm' : 'text-ink-muted hover:text-ink'}`}>
                {m === 'light' ? '☀️' : '🌙'} {m === 'light' ? t('settings.day') : t('settings.night')}
              </button>
            ))}
          </div>
        </div>

        {/* 强调色 */}
        <p className="text-xs text-ink-muted mb-2">{t('theme.accent')}</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {ACCENT_PRESETS.map((p) => (
            <button key={p.hex}
              onClick={() => setAccentColor(p.hex)}
              className={`w-9 h-9 rounded-full border-2 cursor-pointer transition-all active:scale-90
                ${accentColor === p.hex ? 'border-ink scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
              style={{ backgroundColor: p.hex }}
              title={p.name} />
          ))}
        </div>

        {/* 封面底色 */}
        <p className="text-xs text-ink-muted mb-2">{t('theme.bg')}</p>
        <div className="flex gap-2 flex-wrap">
          {SPLASH_PRESETS.map((p) => (
            <button key={p.hex}
              onClick={() => setSplashColor(p.hex)}
              className={`w-9 h-9 rounded-full border-2 cursor-pointer transition-all active:scale-90
                ${splashColor === p.hex ? 'border-ink scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
              style={{ backgroundColor: p.hex }}
              title={p.name} />
          ))}
        </div>
      </div>

      {/* ======== 语言 ======== */}
      <div className="bg-paper rounded-2xl border border-rule p-5">
        <h3 className="text-sm font-medium text-ink mb-3">{t('settings.language')}</h3>
        <div className="flex gap-2">
          {([
            { l: 'zh' as Lang, label: '中文', flag: '🇨🇳' },
            { l: 'en' as Lang, label: 'English', flag: '🇺🇸' },
          ]).map((opt) => (
            <button key={opt.l}
              onClick={() => switchLang(opt.l)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm cursor-pointer transition-all
                ${lang === opt.l
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper-off text-ink border-rule hover:border-ink/30'}`}>
              {opt.flag} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ======== 帮助与反馈 ======== */}
      <div className="bg-paper rounded-2xl border border-rule p-5">
        <div className="text-center mb-4">
          <p className="text-base font-medium text-ink">💬 {t('feedback.title')}</p>
          <p className="text-xs text-ink-muted mt-1">{t('feedback.subtitle')}</p>
        </div>

        <div className="flex gap-3">
          {/* 版本信息 */}
          <button onClick={() => setVersionOpen(!versionOpen)}
            className="flex-1 py-3 rounded-xl border border-rule text-sm text-ink-light
              cursor-pointer hover:border-ink/30 transition-all">
            📋 {t('feedback.version')}
          </button>
          {/* 我要反馈 */}
          <button onClick={() => setFeedbackOpen(!feedbackOpen)}
            className="flex-1 py-3 rounded-xl bg-ink text-paper text-sm
              cursor-pointer hover:opacity-90 transition-all">
            ✉️ {t('feedback.send')}
          </button>
        </div>

        {/* 版本信息面板 */}
        {versionOpen && (
          <div className="mt-4 p-4 rounded-xl bg-paper-off border border-rule">
            <div className="flex justify-between text-xs">
              <span className="text-ink-muted">Recollection</span>
              <span className="text-ink font-medium">v0.2.0 Demo</span>
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-ink-muted">状态</span>
              <span className="text-amber-600 font-medium">个人测试中</span>
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-ink-muted">更新</span>
              <span className="text-ink">Phase 4 — AI 复习已就绪</span>
            </div>
          </div>
        )}

        {/* 反馈面板 */}
        {feedbackOpen && (
          <div className="mt-4">
            <textarea value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={t('feedback.placeholder')}
              rows={3}
              className="w-full p-3 rounded-xl border border-rule bg-paper-off text-sm
                placeholder:text-ink-muted resize-none
                focus:outline-none focus:border-ink transition-colors" />
            <button onClick={sendFeedback} disabled={!feedbackText.trim()}
              className={`mt-2 w-full py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer
                ${feedbackSent
                  ? 'bg-green-100 text-green-700'
                  : 'bg-ink text-paper hover:opacity-90'}`}>
              {feedbackSent ? t('feedback.submitted') : t('feedback.send')}
            </button>
          </div>
        )}
      </div>

      {/* ======== 每日目标 ======== */}
      <div className="bg-paper rounded-2xl border border-rule p-5">
        <h3 className="text-sm font-medium text-ink mb-3">每日学习目标</h3>
        <div className="flex gap-2 mb-3">
          {([10, 20, 30] as DailyGoal[]).map((n) => (
            <button key={n} onClick={() => activeStore.setDailyGoal(n)}
              className={`w-14 h-10 rounded-xl border text-sm font-medium cursor-pointer transition-all
                ${activeStore.dailyGoal === n ? 'bg-ink text-paper border-ink' : 'bg-paper-off text-ink border-rule'}`}>
              {n}
            </button>
          ))}
          <button onClick={() => activeStore.setDailyGoal('custom')}
            className={`px-3 h-10 rounded-xl border text-sm cursor-pointer transition-all
              ${activeStore.dailyGoal === 'custom' ? 'bg-ink text-paper border-ink' : 'bg-paper-off text-ink border-rule'}`}>
            自定义
          </button>
        </div>
        {activeStore.dailyGoal === 'custom' && (
          <input type="number" min={1} max={200} value={activeStore.customGoal}
            onChange={(e) => activeStore.setCustomGoal(Number(e.target.value))}
            className="w-20 text-center py-2 rounded-xl border border-rule bg-paper-off text-sm" />
        )}
      </div>

      {/* ======== 数据导入导出 ======== */}
      <div className="bg-paper rounded-2xl border border-rule p-5">
        <h3 className="text-sm font-medium text-ink mb-3">数据备份</h3>
        <div className="flex gap-3">
          <button onClick={exportData}
            className="flex-1 py-2.5 rounded-full border border-rule text-sm text-ink-light cursor-pointer hover:border-ink/30">
            导出数据
          </button>
          <label className="flex-1 py-2.5 rounded-full border border-rule text-sm text-ink-light text-center cursor-pointer hover:border-ink/30">
            导入数据
            <input type="file" accept=".json" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); }} />
          </label>
        </div>
      </div>

      {/* ======== 数据管理 ======== */}
      <div className="bg-paper rounded-2xl border border-rule p-5">
        <h3 className="text-sm font-medium text-ink mb-3">数据管理</h3>
        <p className="text-xs text-ink-muted mb-3">
          清除所有本地数据（词书、进度、收藏、积累本），应用将重新初始化。
        </p>
        <button
          onClick={() => {
            if (window.confirm('确定要清除所有数据吗？此操作不可恢复。')) {
              localStorage.clear();
              indexedDB.deleteDatabase('RecollectionDB');
              window.location.reload();
            }
          }}
          className="w-full py-2.5 rounded-full border border-red-200 text-red-600 text-sm cursor-pointer
            hover:bg-red-50 active:scale-[0.98] transition-all"
        >
          清除所有数据
        </button>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem('recollection_guide_seen');
          navigate('/');
        }}
        className="w-full py-2.5 rounded-full border border-rule text-sm text-ink-light cursor-pointer hover:border-ink/30"
      >
        📖 重新查看功能引导
      </button>

      <p className="text-center text-xs text-ink-muted py-4">Recollection v0.2.0 Demo</p>
    </div>
  );
}
