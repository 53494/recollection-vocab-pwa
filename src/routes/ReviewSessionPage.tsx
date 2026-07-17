import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/schema';
import { checkTranslation, AIServiceError } from '../services/aiService';
import { incrementTodayLog } from '../services/dataService';
import { useReviewStore, type ReviewSentenceItem } from '../stores/useReviewStore';
import type { ReviewEntry } from '../types/review';
import type { AIFeedback } from '../types/ai';

type Step = 'answering' | 'feedback' | 'complete';

export default function ReviewSessionPage() {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [entries, setEntries] = useState<ReviewSentenceItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 当前题目状态
  const [step, setStep] = useState<Step>('answering');
  const [userAnswer, setUserAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);

  // 统计
  const [scoreTotal, setScoreTotal] = useState(0);
  const [sessionAttempts, setSessionAttempts] = useState<number>(0);

  // 加载待复习条目（优先 store，fallback DB）
  useEffect(() => {
    const storeSentences = useReviewStore.getState().sentences;
    if (storeSentences.length > 0) {
      setEntries(storeSentences);
      setLoading(false);
      return;
    }
    db.reviewEntries.orderBy('dateAdded').reverse().toArray().then((data) => {
      setEntries(data.map((e) => ({
        sentenceEnglish: e.sentenceEnglish,
        sentenceChinese: e.sentenceChinese,
        targetWord: e.targetWord,
        entryId: e.id,
      })));
      setLoading(false);
    });
  }, []);

  // 自动聚焦输入框
  useEffect(() => {
    if (step === 'answering' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [step, index]);

  /** 提交答案 → 调用 AI */
  const handleSubmit = useCallback(async () => {
    const trimmed = userAnswer.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);

    const entry = entries[index];

    try {
      const result = await checkTranslation({
        chineseSentence: entry.sentenceChinese,
        targetWord: entry.targetWord,
        userAnswer: trimmed,
        originalEnglish: entry.sentenceEnglish,
      });

      setFeedback(result);
      setScoreTotal((prev) => prev + result.score);
      setSessionAttempts((prev) => prev + 1);

      // 保存到数据库（仅收藏条目，跳过生成的）
      if (!entry.entryId.startsWith('gen-')) {
        const attemptId = crypto.randomUUID();
        await db.reviewAttempts.put({
          id: attemptId,
          reviewEntryId: entry.entryId,
          date: Date.now(),
          userAnswer: trimmed,
          originalSentence: entry.sentenceEnglish,
          targetWord: entry.targetWord,
          isCorrect: result.targetWordCorrect,
          score: result.score,
          aiFeedbackJSON: JSON.stringify(result),
        });
      }

      // 每日日志：复习句子 +1
      await incrementTodayLog('reviewSentencesSubmitted');

      setStep('feedback');
    } catch (err) {
      if (err instanceof AIServiceError) {
        setError(err.message);
      } else {
        setError('网络异常，请检查连接后重试');
      }
    } finally {
      setSubmitting(false);
    }
  }, [userAnswer, entries, index]);

  /** 进入下一题 */
  const handleNext = useCallback(() => {
    if (index + 1 < entries.length) {
      setIndex((prev) => prev + 1);
      setUserAnswer('');
      setFeedback(null);
      setError(null);
      setStep('answering');
    } else {
      setStep('complete');
    }
  }, [index, entries.length]);

  /** 跳过（不想写答案，直接看原句） */
  const handleSkip = useCallback(() => {
    setUserAnswer('');
    setFeedback({
      overallAssessment: '你选择了跳过这道题。看看参考原句吧 👇',
      targetWordCorrect: false,
      targetWordUsed: '',
      unrememberedWords: [{
        word: entries[index]?.targetWord ?? '',
        correctSpelling: entries[index]?.targetWord ?? '',
        synonyms: [],
        usedInAnswer: false,
        correctlySpelled: false,
        note: '跳过的题目，建议下次尝试自己造句',
      }],
      grammarIssues: [],
      collocationIssues: [],
      originalSentence: {
        english: entries[index]?.sentenceEnglish ?? '',
        idiomaticExpressions: [],
      },
      suggestedAccumulation: null,
      score: 0,
    });
    setStep('feedback');
  }, [index, entries]);

  // === 加载中 ===
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  // === 没有复习条目 ===
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <p className="text-4xl">📭</p>
        <p className="text-sm text-ink-light">还没有收藏的例句</p>
        <button
          className="text-xs text-ink-muted underline cursor-pointer"
          onClick={() => navigate('/review')}
        >
          返回复习本
        </button>
      </div>
    );
  }

  // === 完成 ===
  if (step === 'complete') {
    const avg = sessionAttempts > 0 ? Math.round(scoreTotal / sessionAttempts) : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
        <span className="text-5xl">🎉</span>
        <h2 className="text-xl font-bold text-ink">复习完成</h2>
        <p className="text-sm text-ink-light">
          完成 {sessionAttempts} 句 · 平均分 {avg} 分
        </p>
        <div className="flex gap-3 mt-2">
          <button
            className="px-6 py-2.5 bg-ink text-paper rounded-full text-sm cursor-pointer hover:opacity-90"
            onClick={() => navigate('/accumulate')}
          >
            查看积累本
          </button>
          <button
            className="px-6 py-2.5 border border-rule rounded-full text-sm text-ink-light cursor-pointer hover:border-ink/30"
            onClick={() => navigate('/review')}
          >
            返回复习本
          </button>
        </div>
      </div>
    );
  }

  const entry = entries[index];

  // === 答题中 ===
  if (step === 'answering') {
    return (
      <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
        {/* 进度 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-rule rounded-full overflow-hidden">
            <div
              className="h-full bg-ink rounded-full transition-all duration-500"
              style={{ width: `${((index + 1) / entries.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-ink-muted tabular-nums">
            {index + 1}/{entries.length}
          </span>
        </div>

        {/* 中文提示（隐藏目标词，考用户能否回忆） */}
        <div className="bg-paper rounded-2xl border border-rule p-6 text-center">
          <p className="text-lg text-ink leading-relaxed">
            {entry.sentenceChinese}
          </p>
          <p className="text-xs text-ink-muted mt-3">
            请根据中文意思，用对应的英文单词造句
          </p>
        </div>

        {/* 输入区 */}
        <textarea
          ref={textareaRef}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="在此输入英文翻译..."
          rows={3}
          className="w-full p-4 rounded-2xl border border-rule bg-paper text-sm text-ink
            placeholder:text-ink-muted resize-none
            focus:outline-none focus:border-ink transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        {/* 错误提示 */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* 按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            disabled={submitting}
            className="flex-1 py-3 rounded-full border border-rule text-sm text-ink-muted
              cursor-pointer hover:border-ink/30 active:scale-[0.97] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            跳过
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !userAnswer.trim()}
            className="flex-1 py-3 rounded-full bg-ink text-paper text-sm font-medium
              cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'AI 批改中...' : '提交检查'}
          </button>
        </div>
      </div>
    );
  }

  // === 展示 AI 反馈 ===
  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto w-full pb-8">
      {/* 进度 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 bg-rule rounded-full overflow-hidden">
          <div
            className="h-full bg-ink rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / entries.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-ink-muted tabular-nums">
          {index + 1}/{entries.length}
        </span>
      </div>

      {/* 你的答案 */}
      {userAnswer && (
        <div className="bg-paper rounded-xl border border-rule p-4">
          <p className="text-xs text-ink-muted mb-1">你的答案</p>
          <p className="text-sm text-ink">{userAnswer}</p>
        </div>
      )}

      {/* 总评 + 分数 */}
      {feedback && (
        <>
          <div className="flex items-center gap-4 bg-paper rounded-xl border border-rule p-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold
              ${feedback.score >= 80 ? 'bg-green-100 text-green-700' :
                feedback.score >= 50 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'}`}>
              {feedback.score}
            </div>
            <div className="flex-1">
              <p className="text-sm text-ink">{feedback.overallAssessment}</p>
              <p className="text-xs text-ink-muted mt-1">
                使用了：<span className="text-ink font-medium">{feedback.targetWordUsed || '—'}</span>
              </p>
            </div>
          </div>

          {/* 单词检查 */}
          {feedback.unrememberedWords.length > 0 && (
            <div className="bg-paper rounded-xl border border-rule p-4">
              <p className="text-xs font-medium text-ink mb-2">📖 单词</p>
              {feedback.unrememberedWords.map((w, i) => (
                <div key={i} className="text-sm text-ink-light mb-1 last:mb-0">
                  <span className="font-semibold text-ink">{w.word}</span>
                  {!w.correctlySpelled && (
                    <span className="text-red-500 ml-1">（拼写有误）</span>
                  )}
                  <p className="text-xs text-ink-muted mt-0.5">{w.note}</p>
                  {w.synonyms.length > 0 && (
                    <p className="text-xs text-ink-muted">
                      同义词：{w.synonyms.join(' · ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 语法问题 */}
          {feedback.grammarIssues.length > 0 && (
            <div className="bg-paper rounded-xl border border-rule p-4">
              <p className="text-xs font-medium text-ink mb-2">✏️ 语法</p>
              {feedback.grammarIssues.map((g, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <p className="text-sm">
                    <span className="text-red-500 line-through">{g.original}</span>
                    <span className="mx-1.5">→</span>
                    <span className="text-green-600">{g.correction}</span>
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">{g.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* 搭配问题 */}
          {feedback.collocationIssues.length > 0 && (
            <div className="bg-paper rounded-xl border border-rule p-4">
              <p className="text-xs font-medium text-ink mb-2">💬 搭配</p>
              {feedback.collocationIssues.map((c, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <p className="text-sm">
                    <span className="text-amber-500 line-through">{c.original}</span>
                    <span className="mx-1.5">→</span>
                    <span className="text-green-600">{c.correction}</span>
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">{c.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* 原句地道表达 */}
          {feedback.originalSentence.idiomaticExpressions.length > 0 && (
            <div className="bg-paper rounded-xl border border-rule p-4">
              <p className="text-xs font-medium text-ink mb-2">✨ 地道表达</p>
              {feedback.originalSentence.idiomaticExpressions.map((ex, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <p className="text-sm font-medium text-ink">{ex.expression}</p>
                  <p className="text-xs text-ink-muted">{ex.meaning} · {ex.usage}</p>
                </div>
              ))}
            </div>
          )}

          {/* 参考原句 */}
          <div className="bg-paper rounded-xl border border-rule p-4">
            <p className="text-xs text-ink-muted mb-1">参考原句</p>
            <p className="text-sm text-ink leading-relaxed">
              {feedback.originalSentence.english}
            </p>
          </div>

          {/* 添加到积累本按钮 */}
          {feedback.suggestedAccumulation && (
            <button
              onClick={async () => {
                const acc = feedback.suggestedAccumulation!;
                await db.accumulationEntries.put({
                  id: crypto.randomUUID(),
                  expression: acc.expression,
                  contextSentence: acc.contextSentence,
                  chineseTranslation: acc.chineseTranslation,
                  source: 'ai-suggested',
                  tags: [],
                  notes: '',
                  dateAdded: Date.now(),
                  reviewedCount: 0,
                });
                alert('已添加到积累本 ✨');
              }}
              className="w-full py-3 rounded-full border-2 border-word/30 text-word text-sm font-medium
                cursor-pointer hover:bg-word/5 active:scale-[0.98] transition-all"
            >
              + 添加到积累本
            </button>
          )}
        </>
      )}

      {/* 下一题 */}
      <button
        onClick={handleNext}
        className="w-full py-3 bg-ink text-paper rounded-full text-sm font-medium
          cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
      >
        {index + 1 < entries.length ? '下一句' : '完成复习'}
      </button>
    </div>
  );
}
