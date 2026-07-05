/** 例句 */
export interface ExampleSentence {
  english: string;
  chinese: string;
  source?: string;         // "电影《xxx》" | "牛津词典" | "日常对话" 等
}

/** 单词 */
export interface Word {
  id: string;              // 格式: "{bookId}-{index}", 如 "cet4-0001"
  word: string;            // 单词
  phonetic: string;        // IPA 音标，如 "/əˈbændən/"
  partOfSpeech: string;    // 词性，如 "v." "n." "adj."
  chineseDefinition: string; // 中文释义，如 "v. 放弃；抛弃"
  bookId: string;          // 所属词书ID
  exampleSentences: ExampleSentence[];  // 3-4 条例句
}
