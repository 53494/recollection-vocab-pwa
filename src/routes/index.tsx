import { lazy, Suspense } from 'react';
import { createHashRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { isChunkLoadError, resetChunkRecovery } from '../utils/chunkRecovery';

/* ---- 懒加载 ---- */
const HomePage = lazy(() => import('./HomePage'));
const WelcomePage = lazy(() => import('./WelcomePage'));
const WordBooksPage = lazy(() => import('./WordBooksPage'));
const LearnPage = lazy(() => import('./LearnPage'));
const SelfTestPage = lazy(() => import('./SelfTestPage'));
const ListenIdentifyPage = lazy(() => import('./ListenIdentifyPage'));
const FillBlankPage = lazy(() => import('./FillBlankPage'));
const ReviewPage = lazy(() => import('./ReviewPage'));
const ReviewSessionPage = lazy(() => import('./ReviewSessionPage'));
const AccumulatePage = lazy(() => import('./AccumulatePage'));
const WeeklyReviewPage = lazy(() => import('./WeeklyReviewPage'));
const MonthlyPodcastPage = lazy(() => import('./MonthlyPodcastPage'));
const StatisticsPage = lazy(() => import('./StatisticsPage'));
const TodayWordsPage = lazy(() => import('./TodayWordsPage'));
const WrongWordsPage = lazy(() => import('./WrongWordsPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-ink rounded-full animate-spin border-t-transparent" />
    </div>
  );
}

function Lazy(Comp: React.LazyExoticComponent<() => JSX.Element>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Comp />
    </Suspense>
  );
}

function RouteErrorPage() {
  const error = useRouteError();
  const chunkFailed = isChunkLoadError(error);
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : '发生了未知错误';

  function reload() {
    resetChunkRecovery(window.sessionStorage);
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-paper-off flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-rule bg-paper p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-ink">
          {chunkFailed ? '应用已更新' : '页面暂时无法打开'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          {chunkFailed
            ? '当前页面仍在使用旧版本资源，请重新载入以完成更新。'
            : '请重新载入页面。如果问题持续出现，请稍后再试。'}
        </p>
        {!chunkFailed && (
          <p className="mt-3 break-words text-xs text-ink-faint">{message}</p>
        )}
        <button
          type="button"
          onClick={reload}
          className="mt-5 min-h-11 w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper cursor-pointer"
        >
          重新载入
        </button>
      </div>
    </div>
  );
}

export function createAppRouter() {
  return createHashRouter([
    {
      path: '/',
      element: <AppLayout />,
      errorElement: <RouteErrorPage />,
      children: [
        { index: true, element: Lazy(HomePage) },
        { path: 'welcome', element: Lazy(WelcomePage) },
        { path: 'wordbooks', element: Lazy(WordBooksPage) },
        { path: 'learn/:bookId', element: Lazy(LearnPage) },
        { path: 'selftest', element: Lazy(SelfTestPage) },
        { path: 'selftest/listen', element: Lazy(ListenIdentifyPage) },
        { path: 'selftest/fillblank', element: Lazy(FillBlankPage) },
        { path: 'review', element: Lazy(ReviewPage) },
        { path: 'review/session', element: Lazy(ReviewSessionPage) },
        { path: 'accumulate', element: Lazy(AccumulatePage) },
        { path: 'weekly-review', element: Lazy(WeeklyReviewPage) },
        { path: 'monthly-podcast', element: Lazy(MonthlyPodcastPage) },
        { path: 'stats', element: Lazy(StatisticsPage) },
        { path: 'today-words', element: Lazy(TodayWordsPage) },
        { path: 'wrong-words', element: Lazy(WrongWordsPage) },
        { path: 'settings', element: Lazy(SettingsPage) },
      ],
    },
  ]);
}
