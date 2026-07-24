import { afterEach, describe, expect, it, vi } from 'vitest';
import { AIServiceError, checkTranslationWithProxies, parseProxyUrls } from './aiService';

const request = {
  chineseSentence: '她陪母亲去医院。',
  targetWord: 'accompany',
  userAnswer: 'She accompanied her mother to the hospital.',
  originalEnglish: 'She accompanied her mother to the hospital.',
};

const feedback = {
  overallAssessment: '回答正确',
  targetWordCorrect: true,
  targetWordUsed: 'accompanied',
  unrememberedWords: [],
  grammarIssues: [],
  collocationIssues: [],
  originalSentence: { english: request.originalEnglish, idiomaticExpressions: [] },
  suggestedAccumulation: null,
  score: 100,
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => vi.restoreAllMocks());

describe('AI proxy failover', () => {
  it('解析主备入口并去除重复项', () => {
    expect(parseProxyUrls({
      VITE_AI_PROXY_URLS: 'https://primary.example/, https://backup.example, https://primary.example',
    })).toEqual(['https://primary.example', 'https://backup.example']);
  });

  it('主入口成功时不访问备用入口', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(feedback));

    await expect(checkTranslationWithProxies(request, ['https://primary', 'https://backup']))
      .resolves.toMatchObject({ score: 100 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://primary/api/review');
  });

  it.each([502, 503, 504])('主入口返回 %s 时切换备用入口', async (status) => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(response({ error: '暂时不可用' }, status))
      .mockResolvedValueOnce(response(feedback));

    await expect(checkTranslationWithProxies(request, ['https://primary', 'https://backup']))
      .resolves.toMatchObject({ score: 100 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('主入口网络失败时切换备用入口', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(response(feedback));

    await expect(checkTranslationWithProxies(request, ['https://primary', 'https://backup']))
      .resolves.toMatchObject({ score: 100 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('4xx 业务错误不切换备用入口', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValue(response({ error: '请求参数不完整' }, 400));

    await expect(checkTranslationWithProxies(request, ['https://primary', 'https://backup']))
      .rejects.toMatchObject({ code: 400 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('两个入口都失败时返回明确错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fetch failed'));

    await expect(checkTranslationWithProxies(request, ['https://primary', 'https://backup']))
      .rejects.toEqual(new AIServiceError(0, 'AI 主入口和备用入口均不可用，请稍后重试'));
  });
});
