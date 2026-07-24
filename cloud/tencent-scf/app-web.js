const http = require('node:http');

const SYSTEM_PROMPT = `你是一名专业的英语教学老师，专门为英语专业学生批改英语造句作业。
你的任务是：针对用户使用目标单词完成的英文造句，结合中文提示和参考原句进行多维度诊断，给出专业、易懂的中文反馈。

你必须严格遵守以下规则：
1. 所有输出必须严格遵循下方指定的 JSON 结构，不得添加解释、闲聊、Markdown 代码块或 JSON 之外的任何文字。
2. 按 0-100 分评分，评分依据为语法正确性、搭配地道性和目标单词使用准确性。
3. 准确指出所有语法、拼写和词性使用错误，给出修改后的正确内容，并用中文解释错误原因；没有错误时返回空数组。
4. 指出不地道的短语搭配，给出地道的替换表达，并用中文解释区别和适用场景；没有问题时返回空数组。
5. 从参考原句或学生答案中提取 1-2 个值得积累的高频地道表达，给出中文释义和用法说明。
6. 专门检查目标单词是否使用、拼写是否正确、形式（时态、单复数等）是否准确，并在 targetWordCorrect、targetWordUsed 和 unrememberedWords 中体现。
7. 不得编造不存在的错误，不得改变用户原本想表达的意思，所有建议应贴合中文母语者的学习习惯。
8. 禁止输出任何违法违规或敏感内容。
9. 地道参考句子放在 originalSentence.english 中；优先保留正确的参考原句，除非其确有明显错误。

输出必须是一个合法 JSON 对象，并严格包含以下字段：
overallAssessment、targetWordCorrect、targetWordUsed、unrememberedWords、grammarIssues、collocationIssues、originalSentence、suggestedAccumulation、score。`;

const UPSTREAM_TIMEOUT_MS = 45_000;

function send(response, statusCode, body, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(origin ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    } : {}),
  };
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(body));
}

function getOrigin(request) {
  const origin = request.headers.origin;
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map((item) => item.trim()).filter(Boolean);
  return typeof origin === 'string' && allowed.includes(origin) ? origin : undefined;
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

function parseJson(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 100_000) reject(new Error('body too large'));
    });
    request.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('invalid json')); }
    });
    request.on('error', reject);
  });
}

async function review(request, response, origin) {
  let body;
  try { body = await parseJson(request); } catch { return send(response, 400, { error: '请求体不是有效 JSON' }, origin); }
  const fields = ['chineseSentence', 'targetWord', 'userAnswer', 'originalEnglish'];
  if (!fields.every((key) => typeof body[key] === 'string' && body[key].trim())) {
    return send(response, 400, { error: '请求字段不完整' }, origin);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const baseUrl = (process.env.UPSTREAM_BASE_URL || '').replace(/\/+$/, '');
    const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.UPSTREAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.UPSTREAM_MODEL || 'gpt-5.6-sol',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildPrompt(body) },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });
    if (!upstream.ok) return send(response, 502, { error: 'AI 上游服务暂时不可用，请稍后重试' }, origin);
    const payload = await upstream.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string') return send(response, 502, { error: 'AI 返回格式异常，请重试' }, origin);
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start < 0 || end < start) return send(response, 502, { error: 'AI 返回格式异常，请重试' }, origin);
    return send(response, 200, JSON.parse(content.slice(start, end + 1)), origin);
  } catch (error) {
    const timeout = error instanceof Error && error.name === 'AbortError';
    return send(response, timeout ? 504 : 502, {
      error: timeout ? 'AI 响应超时，请重试' : 'AI 上游连接失败，请稍后重试',
    }, origin);
  } finally {
    clearTimeout(timer);
  }
}

const server = http.createServer(async (request, response) => {
  const origin = getOrigin(request);
  const method = request.method || 'GET';
  const path = (request.url || '/').split('?')[0];

  if (method === 'OPTIONS') return send(response, 204, null, origin);
  if (path === '/health' && method === 'GET') return send(response, 200, { ok: true }, origin);
  if (path !== '/api/review' || method !== 'POST') return send(response, 404, { error: '接口不存在' }, origin);
  if (!origin) return send(response, 403, { error: '不允许的请求来源' });
  return review(request, response, origin);
});

const port = Number(process.env.PORT || 9000);
server.listen(port, '0.0.0.0', () => {
  console.log(`recollection-ai-proxy listening on ${port}`);
});
