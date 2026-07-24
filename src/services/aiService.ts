import type { AIFeedback } from '../types/ai';

const DEFAULT_AI_PROXY_URLS = [
  'https://1329659127-j2s74mk4wl.ap-guangzhou.tencentscf.com',
  'https://recollection-ai-proxy.894721114.workers.dev',
];
const REQUEST_TIMEOUT_MS = 30_000;
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);

interface ErrorResponse {
  error?: string;
}

interface TranslationRequest {
  chineseSentence: string;
  targetWord: string;
  userAnswer: string;
  originalEnglish: string;
}

interface ProxyFailure {
  url: string;
  error: AIServiceError;
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

export function parseProxyUrls(env: {
  VITE_AI_PROXY_URLS?: string;
  VITE_AI_PROXY_URL?: string;
}): string[] {
  const configured = env.VITE_AI_PROXY_URLS || env.VITE_AI_PROXY_URL || DEFAULT_AI_PROXY_URLS.join(',');
  return [...new Set(configured.split(',').map((url) => url.trim().replace(/\/+$/, '')).filter(Boolean))];
}

function shouldTryNextProxy(error: AIServiceError): boolean {
  return error.code === 0 || RETRYABLE_STATUS_CODES.has(error.code);
}

async function requestTranslation(
  proxyUrl: string,
  args: TranslationRequest,
  timeoutMs: number,
): Promise<AIFeedback> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${proxyUrl}/api/review`, {
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
      const fallbackMessages: Record<number, string> = {
        502: 'AI 上游服务暂时不可用，请稍后重试',
        503: 'AI 服务尚未就绪，请稍后重试',
        504: 'AI 响应超时，请稍后重试',
      };
      const message = typeof (data as ErrorResponse)?.error === 'string'
        ? (data as ErrorResponse).error!
        : fallbackMessages[response.status] ?? `AI 服务请求失败 (${response.status})`;
      throw new AIServiceError(response.status, message);
    }

    return normalizeFeedback(data);
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIServiceError(504, 'AI 响应超时，请稍后重试');
    }
    throw new AIServiceError(0, '无法连接 AI 服务入口');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

/** 通过主备服务端代理批改翻译，浏览器不接触上游 API Key。 */
export async function checkTranslationWithProxies(
  args: TranslationRequest,
  proxyUrls: string[],
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<AIFeedback> {
  const failures: ProxyFailure[] = [];

  for (const proxyUrl of proxyUrls) {
    try {
      return await requestTranslation(proxyUrl, args, timeoutMs);
    } catch (error) {
      if (!(error instanceof AIServiceError)) throw error;
      failures.push({ url: proxyUrl, error });
      if (!shouldTryNextProxy(error)) throw error;
    }
  }

  if (failures.length > 1) {
    throw new AIServiceError(0, 'AI 主入口和备用入口均不可用，请稍后重试');
  }
  throw failures[0]?.error ?? new AIServiceError(0, '未配置 AI 服务入口');
}

export async function checkTranslation(args: TranslationRequest): Promise<AIFeedback> {
  return checkTranslationWithProxies(args, parseProxyUrls(import.meta.env));
}

export async function checkProxyHealth(proxyUrl: string, timeoutMs = 5_000): Promise<boolean> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${proxyUrl.replace(/\/+$/, '')}/health`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
