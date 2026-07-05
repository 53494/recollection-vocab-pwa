/**
 * 轻量国际化 — 中/英文翻译
 * 使用方式：t('home.title') → 根据当前语言返回对应文本
 */

export type Lang = 'zh' | 'en';

const translations: Record<string, Record<string, string>> = {
  /* ---- 底部导航 ---- */
  'nav.home':          { zh: '首页', en: 'Home' },
  'nav.books':         { zh: '词书', en: 'Books' },
  'nav.review':        { zh: '复习', en: 'Review' },
  'nav.stats':         { zh: '统计', en: 'Stats' },

  /* ---- 首页 ---- */
  'home.title':        { zh: '今日学习', en: 'Today' },
  'home.learned':      { zh: '新学', en: 'New' },
  'home.reviewed':     { zh: '复习', en: 'Review' },
  'home.quizzed':      { zh: '自测', en: 'Quiz' },
  'home.start':        { zh: '开始学习', en: 'Start' },
  'home.reviewBtn':    { zh: '晚间复习', en: 'Review' },
  'home.quizBtn':      { zh: '自测中心', en: 'Quiz' },
  'home.accBtn':       { zh: '积累本', en: 'Notes' },
  'home.streak':       { zh: '连续打卡', en: 'Streak' },
  'home.days':         { zh: '天', en: 'd' },
  'home.selectBook':   { zh: '选择词书', en: 'Pick Book' },
  'home.dailyWords':   { zh: '词', en: 'w' },
  'home.pendingReviews': { zh: '待复习 0 条', en: '0 to review' },
  'home.quizSub':      { zh: '听音辨意 · 填空拼写', en: 'Listen · Fill Blank' },
  'home.accSub':       { zh: '0 条地道表达', en: '0 expressions' },

  /* ---- 词书 ---- */
  'books.pick':        { zh: '选择适合你的词书', en: 'Pick Your Book' },
  'books.subtitle':    { zh: '选定词书后，可自定义今日学习数量', en: 'Pick a book, then set your daily goal' },
  'books.coming':      { zh: '即将上线', en: 'Coming Soon' },
  'books.words':       { zh: '词', en: 'words' },

  /* ---- 学习 ---- */
  'learn.done':        { zh: '今日学习完成！', en: 'All Done!' },
  'learn.completed':   { zh: '你已完成', en: 'You completed' },
  'learn.review':      { zh: '去复习', en: 'Review' },
  'learn.back':        { zh: '返回词书', en: 'Back to Books' },
  'learn.unknown':     { zh: '不认识', en: "Don't Know" },
  'learn.fuzzy':       { zh: '模糊', en: 'Unsure' },
  'learn.known':       { zh: '认识', en: 'Know' },

  /* ---- 复习 ---- */
  'review.title':      { zh: '复习本', en: 'Review Book' },
  'review.subtitle':   { zh: '条收藏 · 构筑你的专属例句库', en: ' saved · Your personal sentence bank' },
  'review.all':        { zh: '全部', en: 'All' },
  'review.today':      { zh: '今日', en: 'Today' },
  'review.week':       { zh: '本周', en: 'This Week' },
  'review.empty':      { zh: '还没有收藏的例句', en: 'No saved sentences yet' },
  'review.hint':       { zh: '学习时点击 ⭐ 收藏喜欢的句子', en: 'Tap ⭐ while learning to save sentences' },
  'review.start':      { zh: '开始复习', en: 'Start Review' },
  'review.progress':   { zh: '句', en: ' items' },
  'review.answerPlaceholder': { zh: '在此输入英文翻译...', en: 'Type your English translation...' },
  'review.skip':       { zh: '跳过', en: 'Skip' },
  'review.submit':     { zh: '提交检查', en: 'Check' },
  'review.submitting': { zh: 'AI 批改中...', en: 'AI Checking...' },
  'review.yourAnswer': { zh: '你的答案', en: 'Your Answer' },
  'review.next':       { zh: '下一句', en: 'Next' },
  'review.finish':     { zh: '完成复习', en: 'Finish Review' },
  'review.complete':   { zh: '复习完成', en: 'Review Complete' },
  'review.avgScore':   { zh: '完成', en: 'Done' },
  'review.avg':        { zh: '平均分', en: 'Avg Score' },
  'review.toAcc':      { zh: '查看积累本', en: 'View Notes' },
  'review.backToList': { zh: '返回复习本', en: 'Back' },

  /* ---- AI 反馈 ---- */
  'ai.vocab':          { zh: '📖 单词', en: '📖 Word' },
  'ai.grammar':        { zh: '✏️ 语法', en: '✏️ Grammar' },
  'ai.collocation':    { zh: '💬 搭配', en: '💬 Collocation' },
  'ai.idiom':          { zh: '✨ 地道表达', en: '✨ Idioms' },
  'ai.original':       { zh: '参考原句', en: 'Reference' },
  'ai.addAcc':         { zh: '+ 添加到积累本', en: '+ Add to Notes' },
  'ai.added':          { zh: '已添加到积累本 ✨', en: 'Added to Notes ✨' },
  'ai.misspelled':     { zh: '（拼写有误）', en: '(misspelled)' },
  'ai.synonyms':       { zh: '同义词：', en: 'Synonyms: ' },
  'ai.used':           { zh: '使用了：', en: 'Used: ' },

  /* ---- 设置 ---- */
  'settings.title':    { zh: '设置', en: 'Settings' },
  'settings.api':      { zh: 'DeepSeek API Key', en: 'DeepSeek API Key' },
  'settings.apiHint':  { zh: 'AI 批改功能已就绪。免费注册获取 Key：platform.deepseek.com', en: 'AI review is ready. Get a free key: platform.deepseek.com' },
  'settings.apiReady': { zh: '✅ API Key 已配置', en: '✅ API Key Configured' },
  'settings.change':   { zh: '更换', en: 'Change' },
  'settings.local':    { zh: '仅保存在本地，不会上传', en: 'Stored locally only' },
  'settings.save':     { zh: '保存', en: 'Save' },
  'settings.saved':    { zh: '已保存 ✓', en: 'Saved ✓' },
  'settings.theme':    { zh: '主题', en: 'Theme' },
  'settings.language': { zh: '语言', en: 'Language' },
  'settings.feedback': { zh: '帮助与反馈', en: 'Help & Feedback' },
  'settings.more':     { zh: '更多设置将在后续版本中实现', en: 'More settings coming soon' },
  'settings.day':      { zh: '日间', en: 'Light' },
  'settings.night':    { zh: '夜间', en: 'Dark' },

  /* ---- 主题 ---- */
  'theme.accent':      { zh: '强调色', en: 'Accent' },
  'theme.bg':          { zh: '封面底色', en: 'Splash BG' },

  /* ---- 反馈 ---- */
  'feedback.title':    { zh: '你的声音，我们在听', en: 'Your Voice Matters' },
  'feedback.subtitle': { zh: '每一个反馈都帮助我们变得更好', en: 'Every piece of feedback helps us improve' },
  'feedback.version':  { zh: '版本信息', en: 'Version Info' },
  'feedback.send':     { zh: '我要反馈', en: 'Send Feedback' },
  'feedback.placeholder': { zh: '写下你的建议、问题或想法...', en: 'Share your thoughts, ideas, or issues...' },
  'feedback.submitted': { zh: '感谢你的反馈！', en: 'Thanks for your feedback!' },

  /* ---- 通用 ---- */
  'common.loading':    { zh: '加载中...', en: 'Loading...' },
  'common.back':       { zh: '返回', en: 'Back' },
  'common.retry':      { zh: '重试', en: 'Retry' },
  'common.noData':     { zh: '还没有数据', en: 'No data yet' },

  /* ---- 引导页 ---- */
  'welcome.title':     { zh: '欢迎来到 Recollection', en: 'Welcome to Recollection' },
  'welcome.pickBook':  { zh: '首先，选择适合你的词书', en: 'First, pick your word book' },
  'welcome.picked':    { zh: '已选词书', en: 'Selected Book' },
  'welcome.setGoal':   { zh: '设定每日学习目标', en: 'Set Daily Goal' },
  'welcome.goalHint':  { zh: '每天学多少词？随时可以在设置中修改', en: 'Words per day. Change anytime in settings.' },
  'welcome.easy':      { zh: '轻松', en: 'Easy' },
  'welcome.moderate':  { zh: '适中', en: 'Moderate' },
  'welcome.hard':      { zh: '挑战', en: 'Hard' },
  'welcome.custom':    { zh: '自定义数量', en: 'Custom' },
  'welcome.start':     { zh: '开始学习 · 每日', en: 'Get Started · ' },
  'welcome.reselect':  { zh: '← 重新选择词书', en: '← Pick a different book' },

  /* ---- 学习目标选择 ---- */
  'goal.title':        { zh: '开始学习', en: 'Start Learning' },
  'goal.total':        { zh: '词库共', en: 'Total' },
  'goal.choose':       { zh: '选择今日目标', en: 'Choose today\'s target' },
};

export function getLang(): Lang {
  return (localStorage.getItem('recollection_lang') as Lang) || 'zh';
}

export function setLang(lang: Lang) {
  localStorage.setItem('recollection_lang', lang);
}

export function t(key: string): string {
  const lang = getLang();
  const entry = translations[key];
  if (!entry) {
    console.warn(`[i18n] Missing key: ${key}`);
    return key;
  }
  return entry[lang] || entry.zh;
}
