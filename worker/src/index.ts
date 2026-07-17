import { REVIEW_CHECK_SYSTEM_PROMPT, buildReviewCheckPrompt, type ReviewRequestBody } from './prompt';

export interface Env {
  UPSTREAM_API_KEY: string;
  UPSTREAM_BASE_URL: string;
  UPSTREAM_MODEL: string;
  ALLOWED_ORIGINS: string;
}

interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

interface UpstreamResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

const MAX_BODY_BYTES = 12_000;
const FIELD_LIMITS: Record<keyof ReviewRequestBody, number> = {
  chineseSentence: 1_000,
  targetWord: 100,
  userAnswer: 4_000,
  originalEnglish: 2_000,
};
const WINDOW_MS = 60_000;
const REQUESTS_PER_WINDOW = 20;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function jsonResponse(body: unknown, status: number, origin?: string): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function getAllowedOrigin(request: Request, env: Env): string | undefined {
  const origin = request.headers.get('Origin');
  if (!origin) return undefined;
  const allowed = env.ALLOWED_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : undefined;
}

function validateBody(value: unknown): ReviewRequestBody | string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '请求内容格式不正确';
  const source = value as Record<string, unknown>;
  const result = {} as ReviewRequestBody;

  for (const [field, maxLength] of Object.entries(FIELD_LIMITS) as Array<[keyof ReviewRequestBody, number]>) {
    const fieldValue = source[field];
    if (typeof fieldValue !== 'string' || !fieldValue.trim()) return `${field} 不能为空`;
    if (fieldValue.length > maxLength) return `${field} 内容过长`;
    result[field] = fieldValue.trim();
  }

  return result;
}

function extractJson(content: string): unknown {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('AI 返回内容不是有效 JSON');
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function isFeedback(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return typeof item.overallAssessment === 'string'
    && typeof item.targetWordCorrect === 'boolean'
    && typeof item.targetWordUsed === 'string'
    && Array.isArray(item.unrememberedWords)
    && Array.isArray(item.grammarIssues)
    && Array.isArray(item.collocationIssues)
    && typeof item.originalSentence === 'object'
    && item.originalSentence !== null
    && typeof item.score === 'number'
    && item.score >= 0
    && item.score <= 100;
}

function isRateLimited(request: Request): boolean {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const now = Date.now();
  const current = rateLimits.get(ip);
  if (!current || current.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > REQUESTS_PER_WINDOW;
}

async function handleReview(request: Request, env: Env, origin?: string): Promise<Response> {
  if (!env.UPSTREAM_API_KEY) return jsonResponse({ error: 'AI 服务尚未配置' }, 503, origin);
  if (isRateLimited(request)) return jsonResponse({ error: '请求过于频繁，请稍后重试' }, 429, origin);

  const length = Number(request.headers.get('Content-Length') ?? 0);
  if (length > MAX_BODY_BYTES) return jsonResponse({ error: '请求内容过长' }, 413, origin);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonResponse({ error: '请求内容不是有效 JSON' }, 400, origin);
  }

  const body = validateBody(rawBody);
  if (typeof body === 'string') return jsonResponse({ error: body }, 400, origin);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const baseUrl = env.UPSTREAM_BASE_URL.replace(/\/+$/, '');
    const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.UPSTREAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.UPSTREAM_MODEL,
        messages: [
          { role: 'system', content: REVIEW_CHECK_SYSTEM_PROMPT },
          { role: 'user', content: buildReviewCheckPrompt(body) },
        ],
        temperature: 0.3,
        max_tokens: 1_500,
      }),
      signal: controller.signal,
    });

    let data: UpstreamResponse;
    try {
      data = await upstream.json() as UpstreamResponse;
    } catch {
      return jsonResponse({ error: 'AI 服务返回了无法识别的内容' }, 502, origin);
    }

    if (!upstream.ok) {
      const message = upstream.status === 401 || upstream.status === 403
        ? 'AI 服务认证失败，请联系管理员检查配置'
        : upstream.status === 429
          ? 'AI 服务繁忙，请稍后重试'
          : 'AI 服务暂时不可用，请稍后重试';
      return jsonResponse({ error: message }, upstream.status === 429 ? 429 : 502, origin);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) return jsonResponse({ error: 'AI 未返回批改内容' }, 502, origin);

    let feedback: unknown;
    try {
      feedback = extractJson(content);
    } catch {
      return jsonResponse({ error: 'AI 返回格式异常，请重试' }, 502, origin);
    }
    if (!isFeedback(feedback)) return jsonResponse({ error: 'AI 返回字段不完整，请重试' }, 502, origin);

    return jsonResponse(feedback, 200, origin);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    return jsonResponse({ error: timedOut ? 'AI 响应超时，请重试' : '无法连接 AI 服务，请稍后重试' }, 504, origin);
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContextLike): Promise<Response> {
    const url = new URL(request.url);
    const originHeader = request.headers.get('Origin');
    const allowedOrigin = getAllowedOrigin(request, env);

    if (originHeader && !allowedOrigin) return jsonResponse({ error: '不允许的请求来源' }, 403);

    if (request.method === 'OPTIONS') {
      if (!allowedOrigin) return jsonResponse({ error: '不允许的请求来源' }, 403);
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin',
        },
      });
    }

    if (url.pathname !== '/api/review') return jsonResponse({ error: '接口不存在' }, 404, allowedOrigin);
    if (request.method !== 'POST') return jsonResponse({ error: '仅支持 POST 请求' }, 405, allowedOrigin);
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
      return jsonResponse({ error: 'Content-Type 必须是 application/json' }, 415, allowedOrigin);
    }

    return handleReview(request, env, allowedOrigin);
  },
};
