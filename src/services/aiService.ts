import type { AIFeedback } from '../types/ai';

const DEFAULT_AI_PROXY_URL = 'https://recollection-ai-proxy.894721114.workers.dev';
const AI_PROXY_URL = (import.meta.env.VITE_AI_PROXY_URL || DEFAULT_AI_PROXY_URL).replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 35_000;

interface ErrorResponse {
  error?: string;
}

/** AI 服务错误 */
export class AIServiceError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

function normalizeFeedback(value: unknown): AIFeedback {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AIServiceError(502, 'AI 返回格式异常，请重试');
  }

  const parsed = value as Partial<AIFeedback>;
  if (typeof parsed.overallAssessment !== 'string'
    || typeof parsed.targetWordCorrect !== 'boolean'
    || typeof parsed.targetWordUsed !== 'string'
    || !Array.isArray(parsed.unrememberedWords)
    || !Array.isArray(parsed.grammarIssues)
    || !Array.isArray(parsed.collocationIssues)
    || !parsed.originalSentence
    || typeof parsed.originalSentence.english !== 'string'
    || !Array.isArray(parsed.originalSentence.idiomaticExpressions)
    || typeof parsed.score !== 'number') {
    throw new AIServiceError(502, 'AI 返回字段不完整，请重试');
  }

  return {
    overallAssessment: parsed.overallAssessment,
    targetWordCorrect: parsed.targetWordCorrect,
    targetWordUsed: parsed.targetWordUsed,
    unrememberedWords: parsed.unrememberedWords,
    grammarIssues: parsed.grammarIssues,
    collocationIssues: parsed.collocationIssues,
    originalSentence: parsed.originalSentence,
    suggestedAccumulation: parsed.suggestedAccumulation ?? null,
    score: Math.max(0, Math.min(100, parsed.score)),
  };
}

/** 通过受控服务端代理批改翻译，浏览器不接触上游 API Key。 */
export async function checkTranslation(args: {
  chineseSentence: string;
  targetWord: string;
  userAnswer: string;
  originalEnglish: string;
}): Promise<AIFeedback> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${AI_PROXY_URL}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      signal: controller.signal,
      cache: 'no-store',
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new AIServiceError(response.status || 502, 'AI 服务返回了无法识别的内容');
    }

    if (!response.ok) {
      const message = typeof (data as ErrorResponse)?.error === 'string'
        ? (data as ErrorResponse).error!
        : `AI 服务请求失败 (${response.status})`;
      throw new AIServiceError(response.status, message);
    }

    return normalizeFeedback(data);
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIServiceError(504, 'AI 响应超时，请稍后重试');
    }
    throw new AIServiceError(0, '无法连接 AI 服务，请检查网络后重试');
  } finally {
    window.clearTimeout(timeout);
  }
}
