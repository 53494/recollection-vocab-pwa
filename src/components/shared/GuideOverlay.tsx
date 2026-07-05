import { useState } from 'react';

const STEPS = [
  {
    icon: '📖',
    title: '学单词',
    desc: '选定词书后，每天学习目标数量的单词。每个单词配有 3 个不同语境的例句，点击 ⭐ 收藏喜欢的句子。学完后可进行拼写测试，错词自动循环重测。',
  },
  {
    icon: '🌙',
    title: '晚间复习',
    desc: '两种模式任选：拼写单词 或 造句练习。造句模式下，AI 会批改你的语法、搭配和地道表达，结果可一键添加到积累本。',
  },
  {
    icon: '🎯',
    title: '自测中心',
    desc: '听音辨意：听发音选释义，可隐藏拼写提高难度。填空拼写：根据例句上下文填入缺失单词。错题自动标记，可反复回顾。',
  },
  {
    icon: '📊',
    title: '学习统计',
    desc: '可视化你的学习数据：每日柱状图、掌握率环形图、打卡热力图。底部"统计"Tab 随时查看，了解自己的进步轨迹。',
  },
  {
    icon: '⚙️',
    title: '个性化设置',
    desc: '右上角齿轮图标：切换中英文、日/夜间模式、自定义主题色、管理 API Key。你的偏好，由你掌控。',
  },
];

interface GuideOverlayProps {
  onClose: () => void;
}

export function GuideOverlay({ onClose }: GuideOverlayProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6">
      <div className="bg-paper rounded-2xl p-6 max-w-sm w-full text-center shadow-xl animate-slide-up">
        {/* 步骤点 */}
        <div className="flex justify-center gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <span key={i} className={`block rounded-full transition-all ${
              i === step ? 'w-5 h-1.5 bg-ink' : 'w-1.5 h-1.5 bg-rule'
            }`} />
          ))}
        </div>

        <p className="text-4xl mb-3">{current.icon}</p>
        <h3 className="text-base font-bold text-ink mb-2">{current.title}</h3>
        <p className="text-xs text-ink-light leading-relaxed mb-6">{current.desc}</p>

        <div className="flex gap-3">
          {!isLast && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-rule text-sm text-ink-muted cursor-pointer hover:border-ink/30"
            >
              跳过
            </button>
          )}
          <button
            onClick={() => isLast ? onClose() : setStep((s) => s + 1)}
            className="flex-1 py-2.5 rounded-full bg-ink text-paper text-sm font-medium cursor-pointer hover:opacity-90"
          >
            {isLast ? '开始使用' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  );
}
