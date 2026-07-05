import { useState, useEffect } from 'react';
import { seedDatabase } from '../db/seed';

/** 数据库就绪状态 */
interface DBState {
  ready: boolean;
  error: string | null;
}

/**
 * 应用启动 hook — 等待 IndexedDB 初始化并填充种子数据
 */
export function useDBReady(): DBState {
  const [state, setState] = useState<DBState>({ ready: false, error: null });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await seedDatabase();
        if (!cancelled) setState({ ready: true, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : '数据库初始化失败';
        if (!cancelled) setState({ ready: false, error: message });
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
