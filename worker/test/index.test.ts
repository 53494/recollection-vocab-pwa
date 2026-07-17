import { afterEach, describe, expect, it, vi } from 'vitest';
import worker, { type Env } from '../src/index';

const env: Env = {
  UPSTREAM_API_KEY: 'test-key',
  UPSTREAM_BASE_URL: 'https://api.avemujica.moe',
  UPSTREAM_MODEL: 'gpt-5.6-sol',
  ALLOWED_ORIGINS: 'https://53494.github.io,http://localhost:5173',
};

const body = {
  chineseSentence: '她陪母亲去医院。',
  targetWord: 'accompany',
  userAnswer: 'She accompanied her mother to the hospital.',
  originalEnglish: 'She accompanied her mother to the hospital.',
};

const feedback = {
  overallAssessment: '表达准确。',
  targetWordCorrect: true,
  targetWordUsed: 'accompanied',
  unrememberedWords: [],
  grammarIssues: [],
  collocationIssues: [],
  originalSentence: { english: body.originalEnglish, idiomaticExpressions: [] },
  suggestedAccumulation: null,
  score: 95,
};

function request(overrides: RequestInit = {}, url = 'https://worker.example/api/review') {
  return new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://53494.github.io',
      'CF-Connecting-IP': crypto.randomUUID(),
    },
    body: JSON.stringify(body),
    ...overrides,
  });
}

const ctx = { waitUntil: () => undefined };

afterEach(() => vi.restoreAllMocks());

describe('AI review Worker', () => {
  it('转发到带 /v1 的 OpenAI 兼容接口并返回批改结果', async () => {
    const upstream = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: `\`\`\`json\n${JSON.stringify(feedback)}\n\`\`\`` } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const response = await worker.fetch(request(), env, ctx);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(feedback);

    const [url, init] = upstream.mock.calls[0];
    expect(url).toBe('https://api.avemujica.moe/v1/chat/completions');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer test-key');
    const payload = JSON.parse(String(init?.body));
    expect(payload.model).toBe('gpt-5.6-sol');
    expect(payload).not.toHaveProperty('response_format');
  });

  it('拒绝非白名单来源', async () => {
    const response = await worker.fetch(request({
      headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.example' },
    }), env, ctx);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: '不允许的请求来源' });
  });

  it('拒绝缺少字段的请求', async () => {
    const response = await worker.fetch(request({ body: JSON.stringify({ targetWord: 'accompany' }) }), env, ctx);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'chineseSentence 不能为空' });
  });

  it('拒绝超长输入', async () => {
    const response = await worker.fetch(request({ body: JSON.stringify({ ...body, userAnswer: 'a'.repeat(4_001) }) }), env, ctx);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'userAnswer 内容过长' });
  });

  it('隐藏上游认证错误细节', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      error: { message: 'secret upstream diagnostic' },
    }), { status: 401, headers: { 'Content-Type': 'application/json' } }));

    const response = await worker.fetch(request(), env, ctx);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'AI 服务认证失败，请联系管理员检查配置' });
  });

  it('将上游超时转换为明确错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('aborted', 'AbortError'));
    const response = await worker.fetch(request(), env, ctx);
    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({ error: 'AI 响应超时，请重试' });
  });

  it('拒绝字段不完整的 AI 返回值', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '{"score":95}' } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const response = await worker.fetch(request(), env, ctx);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'AI 返回字段不完整，请重试' });
  });

  it('为预检请求返回受限 CORS 响应', async () => {
    const response = await worker.fetch(new Request('https://worker.example/api/review', {
      method: 'OPTIONS',
      headers: { Origin: 'https://53494.github.io' },
    }), env, ctx);
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://53494.github.io');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
  });
});
