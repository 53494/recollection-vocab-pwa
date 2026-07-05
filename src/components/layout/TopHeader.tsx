import { useLocation, useNavigate } from 'react-router-dom';
import { t } from '../../services/i18n';

export function TopHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const routeKeys: Record<string, string> = {
    '/': 'nav.home',
    '/wordbooks': 'nav.books',
    '/selftest': 'home.quizBtn',
    '/selftest/listen': 'nav.books',
    '/selftest/fillblank': 'nav.books',
    '/review': 'review.title',
    '/review/session': 'review.title',
    '/accumulate': 'home.accBtn',
    '/weekly-review': 'review.title',
    '/monthly-podcast': 'review.title',
    '/stats': 'nav.stats',
    '/settings': 'settings.title',
  };

  let titleKey = routeKeys[location.pathname];
  if (!titleKey && location.pathname.startsWith('/learn/')) titleKey = 'home.start';
  const title = titleKey ? t(titleKey) : 'Recollection';

  const showBack = location.pathname !== '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-paper border-b border-rule max-w-lg mx-auto">
      <div className="flex items-center justify-between h-12 px-4">
        <div className="w-10">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="text-ink-light hover:text-ink p-1 -ml-1 cursor-pointer"
              aria-label={t('common.back')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
        </div>

        <h1 className="text-sm font-medium text-ink truncate max-w-[200px]">
          {location.pathname === '/' ? 'Recollection' : title}
        </h1>

        <div className="w-10 flex justify-end">
          <button
            onClick={() => navigate('/settings')}
            className="text-ink-muted hover:text-ink p-1 -mr-1 cursor-pointer transition-colors"
            aria-label={t('settings.title')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
