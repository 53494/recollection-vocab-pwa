const REVIEW_CHECK_SYSTEM_PROMPT = `你是一位专业的英语教师，正在评估一名中国英语专业学生的翻译练习。

学生看到了一句中文句子和一个目标单词，需要根据中文回忆并写出英文句子。请对照参考原句，评估学生的英文答案。

评估要求：
1. 判断目标词或语义和语域合适的同义词是否正确使用。
2. 找出重要的语法错误，并给出中文解释。
3. 识别不自然的搭配并提供地道替代。
4. 从参考原句提取 1-3 个值得学习的表达。
5. 按 0-100 分评分，以鼓励为主，所有解释使用中文。

只返回一个 JSON 对象，不要使用 Markdown 代码块。JSON 必须包含：overallAssessment、targetWordCorrect、targetWordUsed、unrememberedWords、grammarIssues、collocationIssues、originalSentence、suggestedAccumulation、score。`;

export interface ReviewRequestBody {
  chineseSentence: string;
  targetWord: string;
  userAnswer: string;
  originalEnglish: string;
}

export function buildReviewCheckPrompt(args: ReviewRequestBody): string {
  return [
    '请评估以下翻译练习：',
    `中文提示句：${args.chineseSentence}`,
    `目标单词：${args.targetWord}`,
    `学生英文答案：${args.userAnswer}`,
    `参考原句：${args.originalEnglish}`,
    '',
    '严格按照以下 JSON 结构返回：',
    JSON.stringify({
      overallAssessment: '中文总评，1-2句',
      targetWordCorrect: true,
      targetWordUsed: '学生实际使用的词',
      unrememberedWords: [{
        word: '目标单词',
        correctSpelling: '正确拼写',
        synonyms: ['同义词'],
        usedInAnswer: true,
        correctlySpelled: true,
        note: '中文说明',
      }],
      grammarIssues: [{ original: '问题部分', correction: '正确写法', explanation: '中文解释' }],
      collocationIssues: [{ original: '不自然搭配', correction: '地道替代', explanation: '中文解释' }],
      originalSentence: {
        english: args.originalEnglish,
        idiomaticExpressions: [{ expression: '表达', meaning: '中文释义', usage: '用法说明' }],
      },
      suggestedAccumulation: null,
      score: 85,
    }, null, 2),
  ].join('\n\n');
}

export { REVIEW_CHECK_SYSTEM_PROMPT };
