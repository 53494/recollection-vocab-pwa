import type { AIFeedback } from '../types/ai';
import { REVIEW_CHECK_SYSTEM_PROMPT, buildReviewCheckPrompt } from './promptTemplates';

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1';

/** 从 localStorage 获取 API Key */
function getApiKey(): string | null {
  return localStorage.getItem('recollection_api_key');
}

/** 设置 API Key */
export function setApiKey(key: string): void {
  localStorage.setItem('recollection_api_key', key);
}

/** 检查是否已配置 API Key */
export function hasApiKey(): boolean {
  const key = getApiKey();
  return key !== null && key.length > 10;
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

/**
 * 调用 DeepSeek API 批改翻译
 */
export async function checkTranslation(args: {
  chineseSentence: string;
  targetWord: string;
  userAnswer: string;
  originalEnglish: string;
}): Promise<AIFeedback> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new AIServiceError(0, '请先在设置中配置 DeepSeek API Key');
  }

  const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',         // V3 模型（免费额度）
      messages: [
        { role: 'system', content: REVIEW_CHECK_SYSTEM_PROMPT },
        { role: 'user', content: buildReviewCheckPrompt(args) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    let errMsg = `API 请求失败 (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody.error?.message) errMsg = errBody.error.message;
    } catch { /* ignore parse errors */ }
    throw new AIServiceError(response.status, errMsg);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new AIServiceError(0, 'AI 返回内容为空，请重试');
  }

  let parsed: AIFeedback;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new AIServiceError(0, 'AI 返回格式异常，请重试');
  }

  // 字段兜底校验
  return {
    overallAssessment: parsed.overallAssessment || '评估完成',
    targetWordCorrect: parsed.targetWordCorrect ?? false,
    targetWordUsed: parsed.targetWordUsed || '',
    unrememberedWords: parsed.unrememberedWords || [],
    grammarIssues: parsed.grammarIssues || [],
    collocationIssues: parsed.collocationIssues || [],
    originalSentence: {
      english: parsed.originalSentence?.english || '',
      idiomaticExpressions: parsed.originalSentence?.idiomaticExpressions || [],
    },
    suggestedAccumulation: parsed.suggestedAccumulation || null,
    score: typeof parsed.score === 'number' ? parsed.score : 70,
  };
}
