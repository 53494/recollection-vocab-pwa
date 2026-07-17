const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function endsWithConsonantY(word: string): boolean {
  if (!word.endsWith('y') || word.length < 2) return false;
  return !VOWELS.has(word[word.length - 2] ?? '');
}

function shouldDoubleFinalConsonant(word: string): boolean {
  if (word.length < 3 || word.length > 4) return false;

  const [beforeVowel, vowel, consonant] = word.slice(-3);
  return (
    !VOWELS.has(beforeVowel)
    && VOWELS.has(vowel)
    && !VOWELS.has(consonant)
    && !['w', 'x', 'y'].includes(consonant)
  );
}

/** 生成学习场景中需要识别的常见规则词形。 */
export function getWordForms(target: string): string[] {
  const word = target.trim().toLowerCase();
  if (!word) return [];

  const forms = new Set<string>([word]);

  // 复数 / 第三人称单数
  if (endsWithConsonantY(word)) {
    forms.add(`${word.slice(0, -1)}ies`);
  } else if (/(?:s|x|z|ch|sh|o)$/.test(word)) {
    forms.add(`${word}es`);
  } else {
    forms.add(`${word}s`);
  }

  // 规则过去式 / 过去分词
  if (endsWithConsonantY(word)) {
    forms.add(`${word.slice(0, -1)}ied`);
  } else if (word.endsWith('e')) {
    forms.add(`${word}d`);
  } else if (shouldDoubleFinalConsonant(word)) {
    forms.add(`${word}${word[word.length - 1]}ed`);
  } else {
    forms.add(`${word}ed`);
  }

  // 现在分词
  if (word.endsWith('ie')) {
    forms.add(`${word.slice(0, -2)}ying`);
  } else if (word.endsWith('e') && !word.endsWith('ee')) {
    forms.add(`${word.slice(0, -1)}ing`);
  } else if (shouldDoubleFinalConsonant(word)) {
    forms.add(`${word}${word[word.length - 1]}ing`);
  } else {
    forms.add(`${word}ing`);
  }

  return [...forms].sort((a, b) => b.length - a.length);
}

/** 创建仅匹配完整单词的正则，默认忽略大小写并匹配全文。 */
export function createWordFormsRegex(target: string, flags = 'gi'): RegExp | null {
  const forms = getWordForms(target);
  if (forms.length === 0) return null;

  return new RegExp(`\\b(?:${forms.map(escapeRegExp).join('|')})\\b`, flags);
}

/** 将句子中的目标词及其规则变形统一替换。 */
export function replaceWordForms(text: string, target: string, replacement: string): string {
  const regex = createWordFormsRegex(target);
  return regex ? text.replace(regex, replacement) : text;
}
