import type { WordBookMeta } from '../types/wordbook';

/**
 * 词书元数据
 * Demo 阶段只填充 CET-4 的种子单词数据
 */
export const wordBooks: WordBookMeta[] = [
  {
    id: 'middle-school',
    name: 'Junior High',
    nameZh: '初中英语',
    description: '初中大纲词汇',
    level: 'middle-school',
    wordCount: 0,
    order: 1,
    icon: '🏫',
  },
  {
    id: 'high-school',
    name: 'Senior High',
    nameZh: '高中英语',
    description: '高中大纲词汇',
    level: 'high-school',
    wordCount: 0,
    order: 2,
    icon: '📚',
  },
  {
    id: 'cet4',
    name: 'CET-4',
    nameZh: '大学英语四级',
    description: '大学英语四级考试核心词汇',
    level: 'cet4',
    wordCount: 30, // Demo: 30 词
    order: 3,
    icon: '📘',
  },
  {
    id: 'cet6',
    name: 'CET-6',
    nameZh: '大学英语六级',
    description: '大学英语六级考试核心词汇',
    level: 'cet6',
    wordCount: 0,
    order: 4,
    icon: '📙',
  },
  {
    id: 'tem4',
    name: 'TEM-4',
    nameZh: '英语专业四级',
    description: '英语专业四级核心词汇',
    level: 'tem4',
    wordCount: 0,
    order: 5,
    icon: '📗',
  },
  {
    id: 'tem8',
    name: 'TEM-8',
    nameZh: '英语专业八级',
    description: '英语专业八级核心词汇',
    level: 'tem8',
    wordCount: 0,
    order: 6,
    icon: '📕',
  },
];
