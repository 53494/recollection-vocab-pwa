import { db } from './schema';
import { wordBooks } from '../data/wordbooks';
import { cet4Words } from '../data/cet4';
import { cet4WordsPart2 } from '../data/cet4-part2';

/**
 * 首次启动时初始化种子数据。
 * 通过检查 wordBooks 数量判断是否已初始化，避免重复填充。
 */
export async function seedDatabase(): Promise<void> {
  const count = await db.wordBooks.count();
  console.log(`[Recollection] 当前词书数量: ${count}`);

  if (count > 0) {
    console.log('[Recollection] 数据库已初始化，跳过种子填充');
    return;
  }

  console.log('[Recollection] 开始填充种子数据...');

  // 1. 写入词书元数据
  await db.wordBooks.bulkPut(wordBooks);

  // 更新 CET-4 词书的 wordCount 为实际数量
  const allWords = [...cet4Words, ...cet4WordsPart2];
  await db.wordBooks.update('cet4', { wordCount: allWords.length });

  // 2. 写入 CET-4 单词
  await db.words.bulkPut(allWords);

  // 3. 为每个单词创建初始 LearningProgress
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  const progressEntries = allWords.map((word) => ({
    wordId: word.id,
    status: 'new' as const,
    firstSeenAt: 0,
    lastReviewedAt: 0,
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    ebbinghausStage: 0,
    nextReviewDate: today,
    retentionScore: 100,
    lastRetentionCheckAt: today,
  }));

  await db.learningProgress.bulkPut(progressEntries);

  console.log(`[Recollection] 种子数据初始化完成：${wordBooks.length} 本词书，${allWords.length} 个单词`);
}
