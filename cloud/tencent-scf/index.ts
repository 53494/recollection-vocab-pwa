import { REVIEW_CHECK_SYSTEM_PROMPT, buildReviewCheckPrompt, type ReviewRequestBody } from '../../worker/src/prompt';

type HttpHeaders = Record<string, string | undefined>;

declare const Buffer: {
  from(value: string, encoding: 'base64'): { toString(encoding: 'utf8'): string };
};

interface TencentHttpEvent {
  httpMethod?: string;
  path?: string;
  headers?: HttpHeaders;
  body?: string | null;
  isBase64Encoded?: boolean;
}

interface TencentHttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded: false;
}

interface TencentEnv {
  UPSTREAM_API_KEY: string;
  UPSTREAM_BASE_URL: string;
  UPSTREAM_MODEL: string;
  ALLOWED_ORIGINS: string;
}

const UPSTREAM_TIMEOUT_MS = 45_000;

function originOf(event: TencentHttpEvent): string | undefined {
  const origin = event.headers?.origin ?? event.headers?.Origin;
  return origin && event.headers ? (event.headers.origin ?? event.headers.Origin) : undefined;
}

function response(statusCode: number, value: unknown, origin?: string): TencentHttpResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(origin ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        Vary: 'Origin',
      } : {}),
    },
    body: JSON.stringify(value),
    isBase64Encoded: false,
  };
}

function allowedOrigin(event: TencentHttpEvent, env: TencentEnv): string | undefined {
  const origin = originOf(event);
  if (!origin) return undefined;
  return env.ALLOWED_ORIGINS.split(',').map((item) => item.trim()).includes(origin) ? origin : undefined;
}

export async function main(event: TencentHttpEvent, env: TencentEnv): Promise<TencentHttpResponse> {
  const origin = allowedOrigin(event, env);
  const method = (event.httpMethod ?? 'GET').toUpperCase();
  const path = event.path ?? '/';

  if (method === 'OPTIONS') return response(204, null, origin);
  if (path === '/health' && method === 'GET') return response(200, { ok: true }, origin);
  if (path !== '/api/review' || method !== 'POST') return response(404, { error: '接口不存在' }, origin);
  if (!origin) return response(403, { error: '不允许的请求来源' });

  let body: ReviewRequestBody;
  try {
    const raw = event.body ?? '';
    const decoded = event.isBase64Encoded ? Buffer.from(raw, 'base64').toString('utf8') : raw;
    body = JSON.parse(decoded) as ReviewRequestBody;
  } catch {
    return response(400, { error: '请求体不是有效 JSON' }, origin);
  }

  if (![body.chineseSentence, body.targetWord, body.userAnswer, body.originalEnglish].every(
    (value) => typeof value === 'string' && value.trim().length > 0,
  )) return response(400, { error: '请求字段不完整' }, origin);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const baseUrl = env.UPSTREAM_BASE_URL.replace(/\/+$/, '');
    const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.UPSTREAM_API_KEY}`, 'Content-Type': 'application/json' },
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
    if (!upstream.ok) return response(502, { error: 'AI 上游服务暂时不可用，请稍后重试' }, origin);
    const payload = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return response(502, { error: 'AI 返回格式异常，请重试' }, origin);
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd < jsonStart) return response(502, { error: 'AI 返回格式异常，请重试' }, origin);
    return response(200, JSON.parse(content.slice(jsonStart, jsonEnd + 1)), origin);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    return response(timedOut ? 504 : 502, {
      error: timedOut ? 'AI 响应超时，请重试' : 'AI 上游连接失败，请稍后重试',
    }, origin);
  } finally {
    clearTimeout(timeout);
  }
}
