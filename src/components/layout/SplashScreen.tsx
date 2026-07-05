import { useState, useEffect } from 'react';
import { useThemeStore } from '../../stores/useThemeStore';

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const [visible, setVisible] = useState(false);
  const splashColor = useThemeStore((s) => s.splashColor);

  useEffect(() => {
    // 微小延迟，让入场动画自然触发
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: splashColor }}>

      {/* ---- 反光叠层：白色径向渐变 + 高透明度，模拟光泽反射 ---- */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 35%, rgba(255,255,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 30% 70%, rgba(255,255,255,0.04) 0%, transparent 50%),
            linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)
          `,
        }}
      />

      {/* ---- 装饰：极淡的网格纹理（增加层次感） ---- */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ---- 主内容 ---- */}
      <div className={`relative z-10 flex flex-col items-center gap-6 px-8 text-center transition-all duration-1000 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>

        {/* emoji 问候 */}
        <p className="text-white/60 text-sm tracking-wider">
          👋 Hey, ready to learn today?
        </p>

        {/* 主标题 */}
        <h1 className="text-5xl font-bold text-white tracking-tight"
          style={{ letterSpacing: '-0.02em' }}>
          Recollection
        </h1>

        {/* 副标题 */}
        <p className="text-white/50 text-sm max-w-xs leading-relaxed">
          不只是认识单词<br />真正学会使用它们
        </p>

        {/* emoji 点缀 */}
        <div className="flex gap-3 text-xl opacity-70">
          <span className="animate-bounce" style={{ animationDuration: '2s' }}>📖</span>
          <span className="animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.15s' }}>✍️</span>
          <span className="animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.3s' }}>💡</span>
        </div>

        {/* Get Started 按钮 */}
        <button
          onClick={onEnter}
          className="mt-6 px-10 py-3 rounded-full border border-white/40 text-white text-sm font-medium
                     hover:bg-white hover:text-[#1E1E1E] active:scale-95
                     transition-all duration-300 ease-out cursor-pointer"
        >
          Get Started
        </button>

        {/* 底部小字 */}
        <p className="text-white/25 text-[11px] mt-4">
          your personal vocabulary companion
        </p>
      </div>
    </div>
  );
}
