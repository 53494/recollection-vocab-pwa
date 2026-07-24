const SYSTEM_PROMPT = `你是一位专业的英语教师，正在评估一名中国英语专业学生的翻译练习。

学生看到了一句中文句子和一个目标单词，需要根据中文回忆并写出英文句子。请对照参考原句，评估学生的英文答案。

评估要求：
1. 判断目标词或语义和语域合适的同义词是否正确使用。
2. 找出重要的语法错误，并给出中文解释。
3. 识别不自然的搭配并提供地道替代。
4. 从参考原句提取 1-3 个值得学习的表达。
5. 按 0-100 分评分，以鼓励为主，所有解释使用中文。

只返回一个 JSON 对象，不要使用 Markdown 代码块。JSON 必须包含：overallAssessment、targetWordCorrect、targetWordUsed、unrememberedWords、grammarIssues、collocationIssues、originalSentence、suggestedAccumulation、score。`;

const UPSTREAM_TIMEOUT_MS = 45_000;

function json(statusCode, body, origin) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(origin ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      } : {}),
    },
    body: JSON.stringify(body),
    isBase64Encoded: false,
  };
}

function getHeader(headers, name) {
  if (!headers) return undefined;
  const key = Object.keys(headers).find((item) => item.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : undefined;
}

function allowedOrigin(event) {
  const origin = getHeader(event.headers, 'origin');
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map((item) => item.trim()).filter(Boolean);
  return origin && allowed.includes(origin) ? origin : undefined;
}

function buildPrompt(body) {
  return [
    '请评估以下翻译练习：',
    `中文提示句：${body.chineseSentence}`,
    `目标单词：${body.targetWord}`,
    `学生英文答案：${body.userAnswer}`,
    `参考原句：${body.originalEnglish}`,
    '',
    '严格按照以下 JSON 结构返回：',
    JSON.stringify({
      overallAssessment: '中文总评，1-2句', targetWordCorrect: true,
      targetWordUsed: '学生实际使用的词',
      unrememberedWords: [{ word: '目标单词', correctSpelling: '正确拼写', synonyms: ['同义词'], usedInAnswer: true, correctlySpelled: true, note: '中文说明' }],
      grammarIssues: [{ original: '问题部分', correction: '正确写法', explanation: '中文解释' }],
      collocationIssues: [{ original: '不自然搭配', correction: '地道替代', explanation: '中文解释' }],
      originalSentence: { english: body.originalEnglish, idiomaticExpressions: [{ expression: '表达', meaning: '中文释义', usage: '用法说明' }] },
      suggestedAccumulation: null, score: 85,
    }, null, 2),
  ].join('\n\n');
}

function parseBody(event) {
  const raw = event.body || '';
  const text = event.isBase64Encoded ? Buffer.from(raw, 'base64').toString('utf8') : raw;
  return JSON.parse(text);
}

exports.main_handler = async function mainHandler(event) {
  const origin = allowedOrigin(event);
  const method = (event.httpMethod || 'GET').toUpperCase();
  const path = event.path || event.requestContext?.path || '/';

  if (method === 'OPTIONS') return json(204, null, origin);
  if (path === '/health' && method === 'GET') return json(200, { ok: true }, origin);
  if (path !== '/api/review' || method !== 'POST') return json(404, { error: '接口不存在' }, origin);
  if (!origin) return json(403, { error: '不允许的请求来源' });

  let body;
  try { body = parseBody(event); } catch { return json(400, { error: '请求体不是有效 JSON' }, origin); }
  const fields = ['chineseSentence', 'targetWord', 'userAnswer', 'originalEnglish'];
  if (!fields.every((key) => typeof body[key] === 'string' && body[key].trim())) {
    return json(400, { error: '请求字段不完整' }, origin);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const baseUrl = (process.env.UPSTREAM_BASE_URL || '').replace(/\/+$/, '');
    const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.UPSTREAM_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.UPSTREAM_MODEL || 'gpt-5.6-sol',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: buildPrompt(body) }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });
    if (!upstream.ok) return json(502, { error: 'AI 上游服务暂时不可用，请稍后重试' }, origin);
    const payload = await upstream.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string') return json(502, { error: 'AI 返回格式异常，请重试' }, origin);
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start < 0 || end < start) return json(502, { error: 'AI 返回格式异常，请重试' }, origin);
    return json(200, JSON.parse(content.slice(start, end + 1)), origin);
  } catch (error) {
    const timeout = error instanceof Error && error.name === 'AbortError';
    return json(timeout ? 504 : 502, { error: timeout ? 'AI 响应超时，请重试' : 'AI 上游连接失败，请稍后重试' }, origin);
  } finally {
    clearTimeout(timer);
  }
};
