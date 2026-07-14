import { useState, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useDBReady } from './hooks/useDBReady';
import { SplashScreen } from './components/layout/SplashScreen';
import { createAppRouter } from './routes';

export function App() {
  const { ready, error } = useDBReady();
  const [splashDone, setSplashDone] = useState(false);

  const router = useMemo(() => createAppRouter(), []);

  // 封面点击后交给 React Router 跳转，保留 Vite base 路径和 Hash 路由状态
  function handleEnter() {
    const onboarded = localStorage.getItem('recollection_onboarded');
    setSplashDone(true);
    void router.navigate(onboarded === 'true' ? '/' : '/welcome');
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1E1E1E' }}>
        <div className="text-center px-6">
          <p className="text-lg font-medium text-white mb-2">数据库初始化失败</p>
          <p className="text-sm text-white/50">{error}</p>
          <button
            className="mt-4 px-6 py-2 bg-white text-[#1E1E1E] rounded-full text-sm cursor-pointer"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1E1E1E' }}>
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  if (!splashDone) {
    return <SplashScreen onEnter={handleEnter} />;
  }

  return <RouterProvider router={router} />;
}
