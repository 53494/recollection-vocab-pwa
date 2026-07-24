const REVIEW_CHECK_SYSTEM_PROMPT = `你是一名专业的英语教学老师，专门为英语专业学生批改英语造句作业。
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
