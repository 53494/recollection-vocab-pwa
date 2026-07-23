const CHUNK_RECOVERY_KEY = 'recollection_chunk_recovery';

interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** 判断当前会话是否应为动态模块加载失败自动刷新。 */
export function shouldReloadForChunkError(storage: SessionStorageLike, failedUrl: string): boolean {
  if (storage.getItem(CHUNK_RECOVERY_KEY) === failedUrl) return false;
  storage.setItem(CHUNK_RECOVERY_KEY, failedUrl);
  return true;
}

/** 用户主动重试时允许再次执行自动恢复。 */
export function resetChunkRecovery(storage: SessionStorageLike): void {
  storage.removeItem(CHUNK_RECOVERY_KEY);
}

/** 提取动态模块加载错误中的资源地址，用作防循环标记。 */
export function getChunkErrorUrl(error: unknown): string {
  if (error instanceof Error) {
    const match = error.message.match(/https?:\/\/\S+\.js/);
    if (match) return match[0];
    return error.message;
  }
  return String(error);
}

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|Unable to preload/i.test(message);
}
