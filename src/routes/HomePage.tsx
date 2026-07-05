import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveBookStore } from '../stores/useActiveBookStore';
import { t } from '../services/i18n';
import { getTodayStats } from '../services/dataService';
import { GuideOverlay } from '../components/shared/GuideOverlay';

export default function HomePage() {
  const navigate = useNavigate();
  const { activeBookId, activeBookName, getCount } = useActiveBookStore();
  const hasBook = activeBookId !== null;
  const [stats, setStats] = useState({ wordsLearned: 0, wordsReviewed: 0, selfTestsCompleted: 0, reviewSentences: 0, streak: 0 });
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('recollection_guide_seen');
    if (!seen) setShowGuide(true);
  }, []);

  function closeGuide() {
    localStorage.setItem('recollection_guide_seen', 'true');
    setShowGuide(false);
  }

  useEffect(() => {
    getTodayStats().then(setStats);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* 今日统计 */}
      <div className="bg-paper rounded-2xl p-6 border border-rule">
        <h2 className="text-ink-light text-sm mb-4">{t('home.title')}</h2>
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/today-words')}
            className="text-center cursor-pointer hover:opacity-70 transition-opacity">
            <p className="text-3xl font-bold text-ink">{stats.wordsLearned}</p>
            <p className="text-xs text-ink-muted mt-1">{t('home.learned')}</p>
          </button>
          <button
            onClick={() => navigate('/review')}
            className="text-center cursor-pointer hover:opacity-70 transition-opacity">
            <p className="text-3xl font-bold text-ink">{stats.wordsReviewed}</p>
            <p className="text-xs text-ink-muted mt-1">{t('home.reviewed')}</p>
          </button>
          <button
            onClick={() => navigate('/wrong-words')}
            className="text-center cursor-pointer hover:opacity-70 transition-opacity">
            <p className="text-3xl font-bold text-ink">{stats.selfTestsCompleted}</p>
            <p className="text-xs text-ink-muted mt-1">{t('home.quizzed')}</p>
          </button>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => hasBook ? navigate(`/learn/${activeBookId}`) : navigate('/wordbooks')}
          className="bg-ink text-paper rounded-2xl p-5 text-left cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <p className="text-lg font-medium">{t('home.start')}</p>
          <p className="text-xs opacity-60 mt-1">
            {hasBook ? `${activeBookName} · ${getCount()} ${t('home.dailyWords')}` : `${t('home.selectBook')} →`}
          </p>
        </button>
        <button
          onClick={() => navigate('/review')}
          className="bg-paper border border-rule rounded-2xl p-5 text-left cursor-pointer hover:border-ink/30 active:scale-[0.98] transition-all"
        >
          <p className="text-lg font-medium text-ink">{t('home.reviewBtn')}</p>
          <p className="text-xs text-ink-muted mt-1">{t('home.pendingReviews')}</p>
        </button>
        <button
          onClick={() => navigate('/selftest')}
          className="bg-paper border border-rule rounded-2xl p-5 text-left cursor-pointer hover:border-ink/30 active:scale-[0.98] transition-all"
        >
          <p className="text-lg font-medium text-ink">{t('home.quizBtn')}</p>
          <p className="text-xs text-ink-muted mt-1">{t('home.quizSub')}</p>
        </button>
        <button
          onClick={() => navigate('/accumulate')}
          className="bg-paper border border-rule rounded-2xl p-5 text-left cursor-pointer hover:border-ink/30 active:scale-[0.98] transition-all"
        >
          <p className="text-lg font-medium text-ink">{t('home.accBtn')}</p>
          <p className="text-xs text-ink-muted mt-1">{t('home.accSub')}</p>
        </button>
      </div>

      {/* 打卡 */}
      <p className="text-center text-xs text-ink-muted py-4">
        {t('home.streak')} <span className="font-bold text-ink">{stats.streak}</span> {t('home.days')}
      </p>

      {/* 新用户引导 */}
      {showGuide && <GuideOverlay onClose={closeGuide} />}
    </div>
  );
}
