import { useNavigate } from 'react-router-dom';

export default function SelfTestPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center pt-4 pb-2">
        <p className="text-3xl mb-2">🎯</p>
        <h2 className="text-lg font-bold text-ink">自测中心</h2>
        <p className="text-xs text-ink-muted mt-1">选择一种模式，检验你的掌握程度</p>
      </div>

      <button
        onClick={() => navigate('/selftest/listen')}
        className="bg-paper rounded-2xl border border-rule p-6 text-left cursor-pointer
          hover:border-ink/30 hover:shadow-sm active:scale-[0.98] transition-all"
      >
        <span className="text-3xl">🎧</span>
        <h3 className="text-base font-medium text-ink mt-3">听音辨意</h3>
        <p className="text-xs text-ink-muted mt-1">
          听单词发音，从四个释义中选出正确答案。可切换是否显示拼写，自由调节难度。
        </p>
      </button>

      <button
        onClick={() => navigate('/selftest/fillblank')}
        className="bg-paper rounded-2xl border border-rule p-6 text-left cursor-pointer
          hover:border-ink/30 hover:shadow-sm active:scale-[0.98] transition-all"
      >
        <span className="text-3xl">✏️</span>
        <h3 className="text-base font-medium text-ink mt-3">填空拼写</h3>
        <p className="text-xs text-ink-muted mt-1">
          看例句，根据上下文和中文提示填入缺失的单词。在真实语境中检验拼写能力。
        </p>
      </button>
    </div>
  );
}
