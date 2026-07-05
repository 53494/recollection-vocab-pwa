import { useState, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useDBReady } from './hooks/useDBReady';
import { SplashScreen } from './components/layout/SplashScreen';
import { createAppRouter } from './routes';

export function App() {
  const { ready, error } = useDBReady();
  const [splashDone, setSplashDone] = useState(false);
  const [initialPath, setInitialPath] = useState<string | null>(null);

  // 封面点击 → 决定去引导页还是首页
  function handleEnter() {
    const onboarded = localStorage.getItem('recollection_onboarded');
    const path = onboarded === 'true' ? '/' : '/welcome';
    setInitialPath(path);
    setSplashDone(true);
  }

  // 在挂载 Router 前，把 URL 改成目标路径
  const router = useMemo(() => {
    if (initialPath) {
      window.history.replaceState(null, '', initialPath);
    }
    return createAppRouter();
  }, [initialPath]);

  // 错误
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

  // 等待
  if (!ready || !splashDone) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1E1E1E' }}>
        {ready
          ? <SplashScreen onEnter={handleEnter} />
          : <p className="text-white/40 text-sm">Loading...</p>
        }
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
