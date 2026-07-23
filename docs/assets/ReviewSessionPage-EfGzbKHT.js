import{u as K,r as i,d as S,j as e}from"./index-D9FZ1uHJ.js";import{i as P}from"./dataService-D6E1v1YH.js";import{u as _}from"./useReviewStore-Duz6Y_Ub.js";const O=`你是一位专业的英语教师，正在评估一名中国英语专业学生的翻译练习。

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
}`;function R(o){return["请评估以下翻译练习：","",`**中文提示句：** ${o.chineseSentence}`,"",`**目标单词：** ${o.targetWord}`,"",`**学生英文答案：** ${o.userAnswer}`,"",`**参考原句：** ${o.originalEnglish}`,"","请按照 JSON 格式返回完整评估结果。"].join(`
`)}const J="https://api.deepseek.com/v1";function I(){return localStorage.getItem("recollection_api_key")}function B(){const o=I();return o!==null&&o.length>10}class N extends Error{constructor(m,t){super(t),this.code=m,this.name="AIServiceError"}}async function M(o){var k,g,x,u,d,p;const m=I();if(!m)throw new N(0,"请先在设置中配置 DeepSeek API Key");const t=await fetch(`${J}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m}`},body:JSON.stringify({model:"deepseek-chat",messages:[{role:"system",content:O},{role:"user",content:R(o)}],response_format:{type:"json_object"},temperature:.3,max_tokens:1500})});if(!t.ok){let h=`API 请求失败 (${t.status})`;try{const f=await t.json();(k=f.error)!=null&&k.message&&(h=f.error.message)}catch{}throw new N(t.status,h)}const r=(u=(x=(g=(await t.json()).choices)==null?void 0:g[0])==null?void 0:x.message)==null?void 0:u.content;if(!r)throw new N(0,"AI 返回内容为空，请重试");let c;try{c=JSON.parse(r)}catch{throw new N(0,"AI 返回格式异常，请重试")}return{overallAssessment:c.overallAssessment||"评估完成",targetWordCorrect:c.targetWordCorrect??!1,targetWordUsed:c.targetWordUsed||"",unrememberedWords:c.unrememberedWords||[],grammarIssues:c.grammarIssues||[],collocationIssues:c.collocationIssues||[],originalSentence:{english:((d=c.originalSentence)==null?void 0:d.english)||"",idiomaticExpressions:((p=c.originalSentence)==null?void 0:p.idiomaticExpressions)||[]},suggestedAccumulation:c.suggestedAccumulation||null,score:typeof c.score=="number"?c.score:70}}function H(){const o=K(),m=i.useRef(null),[t,v]=i.useState([]),[r,c]=i.useState(0),[k,g]=i.useState(!0),[x,u]=i.useState("answering"),[d,p]=i.useState(""),[h,f]=i.useState(!1),[A,b]=i.useState(null),[a,y]=i.useState(null),[W,C]=i.useState(0),[w,T]=i.useState(0);i.useEffect(()=>{const s=_.getState().sentences;if(s.length>0){v(s),g(!1);return}S.reviewEntries.orderBy("dateAdded").reverse().toArray().then(n=>{v(n.map(l=>({sentenceEnglish:l.sentenceEnglish,sentenceChinese:l.sentenceChinese,targetWord:l.targetWord,entryId:l.id}))),g(!1)})},[]),i.useEffect(()=>{x==="answering"&&m.current&&m.current.focus()},[x,r]);const E=i.useCallback(async()=>{const s=d.trim();if(!s)return;if(!B()){b("请先在设置页面配置 DeepSeek API Key");return}f(!0),b(null);const n=t[r];try{const l=await M({chineseSentence:n.sentenceChinese,targetWord:n.targetWord,userAnswer:s,originalEnglish:n.sentenceEnglish});if(y(l),C(j=>j+l.score),T(j=>j+1),!n.entryId.startsWith("gen-")){const j=crypto.randomUUID();await S.reviewAttempts.put({id:j,reviewEntryId:n.entryId,date:Date.now(),userAnswer:s,originalSentence:n.sentenceEnglish,targetWord:n.targetWord,isCorrect:l.targetWordCorrect,score:l.score,aiFeedbackJSON:JSON.stringify(l)})}await P("reviewSentencesSubmitted"),u("feedback")}catch(l){l instanceof N?b(l.message):b("网络异常，请检查连接后重试")}finally{f(!1)}},[d,t,r]),U=i.useCallback(()=>{r+1<t.length?(c(s=>s+1),p(""),y(null),b(null),u("answering")):u("complete")},[r,t.length]),$=i.useCallback(()=>{var s,n,l;p(""),y({overallAssessment:"你选择了跳过这道题。看看参考原句吧 👇",targetWordCorrect:!1,targetWordUsed:"",unrememberedWords:[{word:((s=t[r])==null?void 0:s.targetWord)??"",correctSpelling:((n=t[r])==null?void 0:n.targetWord)??"",synonyms:[],usedInAnswer:!1,correctlySpelled:!1,note:"跳过的题目，建议下次尝试自己造句"}],grammarIssues:[],collocationIssues:[],originalSentence:{english:((l=t[r])==null?void 0:l.sentenceEnglish)??"",idiomaticExpressions:[]},suggestedAccumulation:null,score:0}),u("feedback")},[r,t]);if(k)return e.jsx("div",{className:"flex justify-center py-20",children:e.jsx("div",{className:"w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent"})});if(t.length===0)return e.jsxs("div",{className:"flex flex-col items-center py-20 gap-3",children:[e.jsx("p",{className:"text-4xl",children:"📭"}),e.jsx("p",{className:"text-sm text-ink-light",children:"还没有收藏的例句"}),e.jsx("button",{className:"text-xs text-ink-muted underline cursor-pointer",onClick:()=>o("/review"),children:"返回复习本"})]});if(x==="complete"){const s=w>0?Math.round(W/w):0;return e.jsxs("div",{className:"flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4",children:[e.jsx("span",{className:"text-5xl",children:"🎉"}),e.jsx("h2",{className:"text-xl font-bold text-ink",children:"复习完成"}),e.jsxs("p",{className:"text-sm text-ink-light",children:["完成 ",w," 句 · 平均分 ",s," 分"]}),e.jsxs("div",{className:"flex gap-3 mt-2",children:[e.jsx("button",{className:"px-6 py-2.5 bg-ink text-paper rounded-full text-sm cursor-pointer hover:opacity-90",onClick:()=>o("/accumulate"),children:"查看积累本"}),e.jsx("button",{className:"px-6 py-2.5 border border-rule rounded-full text-sm text-ink-light cursor-pointer hover:border-ink/30",onClick:()=>o("/review"),children:"返回复习本"})]})]})}const D=t[r];return x==="answering"?e.jsxs("div",{className:"flex flex-col gap-5 max-w-md mx-auto w-full",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex-1 h-1 bg-rule rounded-full overflow-hidden",children:e.jsx("div",{className:"h-full bg-ink rounded-full transition-all duration-500",style:{width:`${(r+1)/t.length*100}%`}})}),e.jsxs("span",{className:"text-xs text-ink-muted tabular-nums",children:[r+1,"/",t.length]})]}),e.jsxs("div",{className:"bg-paper rounded-2xl border border-rule p-6 text-center",children:[e.jsx("p",{className:"text-lg text-ink leading-relaxed",children:D.sentenceChinese}),e.jsx("p",{className:"text-xs text-ink-muted mt-3",children:"请根据中文意思，用对应的英文单词造句"})]}),e.jsx("textarea",{ref:m,value:d,onChange:s=>p(s.target.value),placeholder:"在此输入英文翻译...",rows:3,className:`w-full p-4 rounded-2xl border border-rule bg-paper text-sm text-ink
            placeholder:text-ink-muted resize-none
            focus:outline-none focus:border-ink transition-colors`,onKeyDown:s=>{s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),E())}}),A&&e.jsx("p",{className:"text-sm text-red-500 text-center",children:A}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx("button",{onClick:$,disabled:h,className:`flex-1 py-3 rounded-full border border-rule text-sm text-ink-muted
              cursor-pointer hover:border-ink/30 active:scale-[0.97] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed`,children:"跳过"}),e.jsx("button",{onClick:E,disabled:h||!d.trim(),className:`flex-1 py-3 rounded-full bg-ink text-paper text-sm font-medium
              cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all
              disabled:opacity-40 disabled:cursor-not-allowed`,children:h?"AI 批改中...":"提交检查"})]})]}):e.jsxs("div",{className:"flex flex-col gap-4 max-w-md mx-auto w-full pb-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex-1 h-1 bg-rule rounded-full overflow-hidden",children:e.jsx("div",{className:"h-full bg-ink rounded-full transition-all duration-500",style:{width:`${(r+1)/t.length*100}%`}})}),e.jsxs("span",{className:"text-xs text-ink-muted tabular-nums",children:[r+1,"/",t.length]})]}),d&&e.jsxs("div",{className:"bg-paper rounded-xl border border-rule p-4",children:[e.jsx("p",{className:"text-xs text-ink-muted mb-1",children:"你的答案"}),e.jsx("p",{className:"text-sm text-ink",children:d})]}),a&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-center gap-4 bg-paper rounded-xl border border-rule p-4",children:[e.jsx("div",{className:`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold
              ${a.score>=80?"bg-green-100 text-green-700":a.score>=50?"bg-amber-100 text-amber-700":"bg-red-100 text-red-700"}`,children:a.score}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"text-sm text-ink",children:a.overallAssessment}),e.jsxs("p",{className:"text-xs text-ink-muted mt-1",children:["使用了：",e.jsx("span",{className:"text-ink font-medium",children:a.targetWordUsed||"—"})]})]})]}),a.unrememberedWords.length>0&&e.jsxs("div",{className:"bg-paper rounded-xl border border-rule p-4",children:[e.jsx("p",{className:"text-xs font-medium text-ink mb-2",children:"📖 单词"}),a.unrememberedWords.map((s,n)=>e.jsxs("div",{className:"text-sm text-ink-light mb-1 last:mb-0",children:[e.jsx("span",{className:"font-semibold text-ink",children:s.word}),!s.correctlySpelled&&e.jsx("span",{className:"text-red-500 ml-1",children:"（拼写有误）"}),e.jsx("p",{className:"text-xs text-ink-muted mt-0.5",children:s.note}),s.synonyms.length>0&&e.jsxs("p",{className:"text-xs text-ink-muted",children:["同义词：",s.synonyms.join(" · ")]})]},n))]}),a.grammarIssues.length>0&&e.jsxs("div",{className:"bg-paper rounded-xl border border-rule p-4",children:[e.jsx("p",{className:"text-xs font-medium text-ink mb-2",children:"✏️ 语法"}),a.grammarIssues.map((s,n)=>e.jsxs("div",{className:"mb-2 last:mb-0",children:[e.jsxs("p",{className:"text-sm",children:[e.jsx("span",{className:"text-red-500 line-through",children:s.original}),e.jsx("span",{className:"mx-1.5",children:"→"}),e.jsx("span",{className:"text-green-600",children:s.correction})]}),e.jsx("p",{className:"text-xs text-ink-muted mt-0.5",children:s.explanation})]},n))]}),a.collocationIssues.length>0&&e.jsxs("div",{className:"bg-paper rounded-xl border border-rule p-4",children:[e.jsx("p",{className:"text-xs font-medium text-ink mb-2",children:"💬 搭配"}),a.collocationIssues.map((s,n)=>e.jsxs("div",{className:"mb-2 last:mb-0",children:[e.jsxs("p",{className:"text-sm",children:[e.jsx("span",{className:"text-amber-500 line-through",children:s.original}),e.jsx("span",{className:"mx-1.5",children:"→"}),e.jsx("span",{className:"text-green-600",children:s.correction})]}),e.jsx("p",{className:"text-xs text-ink-muted mt-0.5",children:s.explanation})]},n))]}),a.originalSentence.idiomaticExpressions.length>0&&e.jsxs("div",{className:"bg-paper rounded-xl border border-rule p-4",children:[e.jsx("p",{className:"text-xs font-medium text-ink mb-2",children:"✨ 地道表达"}),a.originalSentence.idiomaticExpressions.map((s,n)=>e.jsxs("div",{className:"mb-2 last:mb-0",children:[e.jsx("p",{className:"text-sm font-medium text-ink",children:s.expression}),e.jsxs("p",{className:"text-xs text-ink-muted",children:[s.meaning," · ",s.usage]})]},n))]}),e.jsxs("div",{className:"bg-paper rounded-xl border border-rule p-4",children:[e.jsx("p",{className:"text-xs text-ink-muted mb-1",children:"参考原句"}),e.jsx("p",{className:"text-sm text-ink leading-relaxed",children:a.originalSentence.english})]}),a.suggestedAccumulation&&e.jsx("button",{onClick:async()=>{const s=a.suggestedAccumulation;await S.accumulationEntries.put({id:crypto.randomUUID(),expression:s.expression,contextSentence:s.contextSentence,chineseTranslation:s.chineseTranslation,source:"ai-suggested",tags:[],notes:"",dateAdded:Date.now(),reviewedCount:0}),alert("已添加到积累本 ✨")},className:`w-full py-3 rounded-full border-2 border-word/30 text-word text-sm font-medium
                cursor-pointer hover:bg-word/5 active:scale-[0.98] transition-all`,children:"+ 添加到积累本"})]}),e.jsx("button",{onClick:U,className:`w-full py-3 bg-ink text-paper rounded-full text-sm font-medium
          cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all`,children:r+1<t.length?"下一句":"完成复习"})]})}export{H as default};
