/** 词书等级 */
export type BookLevel =
  | 'middle-school'
  | 'high-school'
  | 'cet4'
  | 'cet6'
  | 'tem4'
  | 'tem8';

/** 词书元数据 */
export interface WordBookMeta {
  id: string;              // e.g. "cet4"
  name: string;            // "CET-4"
  nameZh: string;          // "大学英语四级"
  description: string;     // "大学英语四级考试核心词汇"
  level: BookLevel;
  wordCount: number;       // 词汇量
  order: number;           // 展示排序
  icon: string;            // emoji 图标
}
