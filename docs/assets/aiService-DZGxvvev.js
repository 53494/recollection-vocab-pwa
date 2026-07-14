const h=`你是一位专业的英语教师，正在评估一名中国英语专业学生的翻译练习。

## 任务
学生看到了一句中文句子和一个目标单词，需要根据中文回忆并写出英文句子。
请对照参考原句，评估学生的英文答案。

## 评估规则
1. **目标单词**：学生是否使用了目标词？同义词替换是**可以接受的**（只要意思和语域匹配）。
   仅当同义词改变了句子的语气、正式程度或细微含义时才标注。
2. **语法**：找出所有语法错误——时态、主谓一致、冠词、介词、语序、从句结构。
3. **搭配**：识别不自然的词组搭配（中式英语）。对每个问题给出更地道的英文替代。
4. **地道表达**：从**参考原句**中提取 1-3 个值得学生学习的地道表达或词组。
5. **评分**：0-100 分制：
   - 90-100: 几乎完美，目标词正确，无语法/搭配错误
   - 70-89: 基本正确，有轻微语法或搭配问题，意思保留
   - 50-69: 意思大体保留，但有明显语法错误
   - 30-49: 意思部分保留，错误较多
   - 0-29: 意思不清晰或完全错误

## 语气
以**鼓励为主**，学生正在学习中。聚焦最重要的错误，不要纠结无关紧要的细节。
所有解释用中文。

## 输出格式
只返回一个 JSON 对象，严格遵循以下结构：
{
  "overallAssessment": "中文总评，1-2句",
  "targetWordCorrect": true/false,
  "targetWordUsed": "学生实际使用的词",
  "unrememberedWords": [
    {
      "word": "目标单词",
      "correctSpelling": "正确拼写",
      "synonyms": ["同义词1", "同义词2"],
      "usedInAnswer": true/false,
      "correctlySpelled": true/false,
      "note": "中文说明"
    }
  ],
  "grammarIssues": [
    {
      "original": "学生写的有问题的部分",
      "correction": "正确的写法",
      "explanation": "中文解释"
    }
  ],
  "collocationIssues": [
    {
      "original": "学生的不自然搭配",
      "correction": "更地道的替代",
      "explanation": "中文解释"
    }
  ],
  "originalSentence": {
    "english": "参考原句全句",
    "idiomaticExpressions": [
      {
        "expression": "地道表达",
        "meaning": "中文释义",
        "usage": "中文用法说明"
      }
    ]
  },
  "suggestedAccumulation": null 或者 {
    "expression": "值得积累的表达",
    "contextSentence": "包含该表达的完整例句",
    "chineseTranslation": "中文翻译"
  },
  "score": 85
}`;function S(e){return["请评估以下翻译练习：","",`**中文提示句：** ${e.chineseSentence}`,"",`**目标单词：** ${e.targetWord}`,"",`**学生英文答案：** ${e.userAnswer}`,"",`**参考原句：** ${e.originalEnglish}`,"","请按照 JSON 格式返回完整评估结果。"].join(`
`)}const y="https://api.deepseek.com/v1";function p(){return localStorage.getItem("recollection_api_key")}function f(e){localStorage.setItem("recollection_api_key",e)}function E(){const e=p();return e!==null&&e.length>10}class o extends Error{constructor(r,s){super(s),this.code=r,this.name="AIServiceError"}}async function I(e){var a,c,i,l,u,m;const r=p();if(!r)throw new o(0,"请先在设置中配置 DeepSeek API Key");const s=await fetch(`${y}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r}`},body:JSON.stringify({model:"deepseek-chat",messages:[{role:"system",content:h},{role:"user",content:S(e)}],response_format:{type:"json_object"},temperature:.3,max_tokens:1500})});if(!s.ok){let d=`API 请求失败 (${s.status})`;try{const g=await s.json();(a=g.error)!=null&&a.message&&(d=g.error.message)}catch{}throw new o(s.status,d)}const n=(l=(i=(c=(await s.json()).choices)==null?void 0:c[0])==null?void 0:i.message)==null?void 0:l.content;if(!n)throw new o(0,"AI 返回内容为空，请重试");let t;try{t=JSON.parse(n)}catch{throw new o(0,"AI 返回格式异常，请重试")}return{overallAssessment:t.overallAssessment||"评估完成",targetWordCorrect:t.targetWordCorrect??!1,targetWordUsed:t.targetWordUsed||"",unrememberedWords:t.unrememberedWords||[],grammarIssues:t.grammarIssues||[],collocationIssues:t.collocationIssues||[],originalSentence:{english:((u=t.originalSentence)==null?void 0:u.english)||"",idiomaticExpressions:((m=t.originalSentence)==null?void 0:m.idiomaticExpressions)||[]},suggestedAccumulation:t.suggestedAccumulation||null,score:typeof t.score=="number"?t.score:70}}export{o as A,I as c,E as h,f as s};
