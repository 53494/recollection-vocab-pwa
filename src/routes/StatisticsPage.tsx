import { useState, useEffect } from 'react';
import { db } from '../db/schema';
import { getAllDailyLogs, getStreak } from '../services/dataService';
import type { DailyLog } from '../types/dailyLog';

export default function StatisticsPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [mastery, setMastery] = useState({ news: 0, learning: 0, reviewing: 0, mastered: 0 });
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [allLogs, allProgress, s] = await Promise.all([
        getAllDailyLogs(),
        db.learningProgress.toArray(),
        getStreak(),
      ]);
      setLogs(allLogs);
      setStreak(s);
      setMastery({
        news: allProgress.filter((p) => p.status === 'new').length,
        learning: allProgress.filter((p) => p.status === 'learning').length,
        reviewing: allProgress.filter((p) => p.status === 'reviewing').length,
        mastered: allProgress.filter((p) => p.status === 'mastered').length,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-5 h-5 border-2 border-ink rounded-full animate-spin border-t-transparent" /></div>;
  }

  // 最近 14 天柱状图数据
  const barData: { date: string; learned: number; reviewed: number; tested: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().split('T')[0];
    const log = logs.find((l) => l.date === key);
    barData.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      learned: log?.wordsLearned ?? 0,
      reviewed: log?.reviewSentencesSubmitted ?? 0,
      tested: log?.selfTestsCompleted ?? 0,
    });
  }
  const maxBar = Math.max(1, ...barData.flatMap((d) => [d.learned, d.reviewed, d.tested]));

  // 总掌握
  const totalWords = mastery.news + mastery.learning + mastery.reviewing + mastery.mastered || 1;

  // 打卡热力图（最近 84 天 = 12 周）
  const heatData: { date: string; level: number }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().split('T')[0];
    const log = logs.find((l) => l.date === key);
    const total = log ? (log.wordsLearned + log.reviewSentencesSubmitted + log.selfTestsCompleted) : 0;
    let level = 0;
    if (total > 0) level = 1;
    if (total >= 5) level = 2;
    if (total >= 15) level = 3;
    if (total >= 30) level = 4;
    heatData.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, level });
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* 摘要卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-paper rounded-2xl border border-rule p-4 text-center">
          <p className="text-2xl font-bold text-ink">{streak}</p>
          <p className="text-xs text-ink-muted mt-1">连续打卡（天）</p>
        </div>
        <div className="bg-paper rounded-2xl border border-rule p-4 text-center">
          <p className="text-2xl font-bold text-ink">{mastery.mastered + mastery.reviewing}</p>
          <p className="text-xs text-ink-muted mt-1">学习中/已掌握</p>
        </div>
        <div className="bg-paper rounded-2xl border border-rule p-4 text-center">
          <p className="text-2xl font-bold text-ink">{logs.length}</p>
          <p className="text-xs text-ink-muted mt-1">活跃天数</p>
        </div>
        <div className="bg-paper rounded-2xl border border-rule p-4 text-center">
          <p className="text-2xl font-bold text-ink">{totalWords - mastery.news}</p>
          <p className="text-xs text-ink-muted mt-1">已学习单词</p>
        </div>
      </div>

      {/* 每日学习柱状图 */}
      <div className="bg-paper rounded-2xl border border-rule p-5">
        <h3 className="text-sm font-medium text-ink mb-4">每日学习（近 14 天）</h3>
        <div className="flex items-end gap-1 h-28">
          {barData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
              <div className="flex flex-col gap-0.5 w-full items-center">
                {d.learned > 0 && (
                  <div className="w-full max-w-[10px] rounded-sm bg-ink"
                    style={{ height: `${Math.max(4, (d.learned / maxBar) * 100)}%`, minHeight: d.learned > 0 ? 4 : 0 }} />
                )}
                {d.reviewed > 0 && (
                  <div className="w-full max-w-[10px] rounded-sm bg-ink-light"
                    style={{ height: `${Math.max(4, (d.reviewed / maxBar) * 100)}%`, minHeight: d.reviewed > 0 ? 4 : 0 }} />
                )}
                {d.tested > 0 && (
                  <div className="w-full max-w-[10px] rounded-sm bg-word"
                    style={{ height: `${Math.max(4, (d.tested / maxBar) * 100)}%`, minHeight: d.tested > 0 ? 4 : 0 }} />
                )}
              </div>
              {/* 每 3 个显示日期 */}
              {i % 3 === 0 && (
                <span className="text-[9px] text-ink-muted mt-1">{d.date}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 pt-3 border-t border-rule">
          <span className="text-[10px] text-ink-muted flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-ink inline-block" /> 新学
          </span>
          <span className="text-[10px] text-ink-muted flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-ink-light inline-block" /> 复习
          </span>
          <span className="text-[10px] text-ink-muted flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-word inline-block" /> 自测
          </span>
        </div>
      </div>

      {/* 掌握率环形图 */}
      <div className="bg-paper rounded-2xl border border-rule p-5">
        <h3 className="text-sm font-medium text-ink mb-4">掌握分布</h3>
        <div className="flex items-center gap-6">
          {/* SVG 环形图 */}
          <svg viewBox="0 0 100 100" className="w-28 h-28 shrink-0">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="12" />
            {renderArc(0, mastery.mastered / totalWords, '#1A1A1A')}
            {renderArc(mastery.mastered / totalWords, (mastery.mastered + mastery.reviewing) / totalWords, '#4B5563')}
            {renderArc((mastery.mastered + mastery.reviewing) / totalWords, (mastery.mastered + mastery.reviewing + mastery.learning) / totalWords, '#9CA3AF')}
            <circle cx="50" cy="50" r="30" fill="white" />
            <text x="50" y="48" textAnchor="middle" className="text-lg font-bold" fill="#1A1A1A" fontSize="14">
              {totalWords > 0 ? Math.round((mastery.mastered / totalWords) * 100) : 0}%
            </text>
            <text x="50" y="62" textAnchor="middle" fill="#9CA3AF" fontSize="7">已掌握</text>
          </svg>
          <div className="flex-1 space-y-2">
            <Legend color="#1A1A1A" label="已掌握" count={mastery.mastered} />
            <Legend color="#4B5563" label="复习中" count={mastery.reviewing} />
            <Legend color="#9CA3AF" label="学习中" count={mastery.learning} />
            <Legend color="#E5E7EB" label="未开始" count={mastery.news} />
          </div>
        </div>
      </div>

      {/* 打卡热力图 */}
      <div className="bg-paper rounded-2xl border border-rule p-5">
        <h3 className="text-sm font-medium text-ink mb-3">学习热力图（近 12 周）</h3>
        <div className="grid grid-cols-12 gap-1">
          {heatData.map((d, i) => {
            const colors = ['bg-rule', 'bg-ink/15', 'bg-ink/30', 'bg-ink/60', 'bg-ink'];
            return (
              <div
                key={i}
                className={`aspect-square rounded-sm ${colors[d.level]}`}
                title={`${d.date}: 学习量 ${d.level}`}
              />
            );
          })}
        </div>
        <p className="text-[10px] text-ink-muted mt-2">每个小格代表一天，颜色越深学习量越大</p>
      </div>
    </div>
  );
}

/** SVG 弧形片段 */
function renderArc(fromRatio: number, toRatio: number, color: string) {
  if (fromRatio === toRatio) return null;
  const fromAngle = fromRatio * 360 - 90;
  const toAngle = toRatio * 360 - 90;
  const r = 42;
  const cx = 50, cy = 50;
  const fromRad = (fromAngle * Math.PI) / 180;
  const toRad = (toAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(fromRad);
  const y1 = cy + r * Math.sin(fromRad);
  const x2 = cx + r * Math.cos(toRad);
  const y2 = cy + r * Math.sin(toRad);
  const large = toRatio - fromRatio > 0.5 ? 1 : 0;
  return (
    <path
      key={color}
      d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
      fill="none"
      stroke={color}
      strokeWidth="12"
      strokeLinecap="round"
    />
  );
}

function Legend({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
      <span className="text-ink-light flex-1">{label}</span>
      <span className="text-ink font-medium">{count}</span>
    </div>
  );
}
