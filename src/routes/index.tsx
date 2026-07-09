import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

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

export function createAppRouter() {
  const basename = import.meta.env.BASE_URL;
  return createBrowserRouter([
    {
      path: '/',
      element: <AppLayout />,
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
  ], { basename: basename === '/' ? undefined : basename });
}
