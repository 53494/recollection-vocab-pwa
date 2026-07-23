import { describe, expect, it } from 'vitest';
import {
  getChunkErrorUrl,
  isChunkLoadError,
  resetChunkRecovery,
  shouldReloadForChunkError,
} from './chunkRecovery';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('chunk recovery', () => {
  it('同一资源首次失败时刷新，重复失败时停止刷新', () => {
    const storage = createStorage();
    const url = 'https://example.com/assets/Page-old.js';

    expect(shouldReloadForChunkError(storage, url)).toBe(true);
    expect(shouldReloadForChunkError(storage, url)).toBe(false);
  });

  it('用户主动重试后允许再次恢复', () => {
    const storage = createStorage();
    const url = 'https://example.com/assets/Page-old.js';

    expect(shouldReloadForChunkError(storage, url)).toBe(true);
    resetChunkRecovery(storage);
    expect(shouldReloadForChunkError(storage, url)).toBe(true);
  });

  it('识别 Vite 动态导入错误并提取资源地址', () => {
    const error = new TypeError(
      'Failed to fetch dynamically imported module: https://example.com/assets/Page-old.js',
    );

    expect(isChunkLoadError(error)).toBe(true);
    expect(getChunkErrorUrl(error)).toBe('https://example.com/assets/Page-old.js');
  });
});
