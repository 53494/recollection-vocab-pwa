import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopHeader } from './TopHeader';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { SpeechErrorToast } from '../shared/SpeechErrorToast';

export function AppLayout() {
  const online = useOnlineStatus();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setShowInstall(false);
    setInstallPrompt(null);
  }

  return (
    <div className="min-h-screen bg-paper-off flex flex-col max-w-lg mx-auto">
      <TopHeader />
      <SpeechErrorToast />

      {/* 离线横幅 */}
      {!online && (
        <div className="fixed top-12 left-0 right-0 z-40 bg-amber-50 border-b border-amber-200 text-amber-700 text-xs text-center py-1.5 max-w-lg mx-auto">
          当前处于离线状态 · AI 批改功能暂不可用
        </div>
      )}

      {/* PWA 安装提示 */}
      {showInstall && (
        <div className="fixed top-12 left-0 right-0 z-40 bg-ink text-paper text-xs flex items-center justify-between px-4 py-2 max-w-lg mx-auto">
          <span>将此应用安装到桌面，随时随地背单词</span>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setShowInstall(false)} className="text-white/60 hover:text-white cursor-pointer">稍后</button>
            <button onClick={handleInstall} className="text-word font-medium cursor-pointer hover:opacity-80">安装</button>
          </div>
        </div>
      )}

      <main className={`flex-1 px-4 pb-24 ${!online ? 'pt-16' : showInstall ? 'pt-16' : 'pt-12'}`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
