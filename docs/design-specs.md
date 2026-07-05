# 设计规范 - Recollection

## 设计理念

**极简 · 克制 · 聚焦内容**

Recollection 的设计哲学是"让文字说话"。界面作为安静的容器，让用户的注意力完全集中在单词和例句上。黑白灰为主调，黄色仅作为目标词的视觉锚点。

## 色彩系统

### 核心色板

```
ink (文字)
├── DEFAULT:   #1A1A1A    主要文字
├── light:     #4B5563    次要文字
└── muted:     #9CA3AF    禁用/提示文字

paper (背景)
├── DEFAULT:   #FFFFFF    卡片/表面背景
└── off:       #F9FAFB    页面底色（微灰）

rule (分割)
└── DEFAULT:   #E5E7EB    边框、分割线

accent (强调)
└── DEFAULT:   #1A1A1A    按钮背景、活跃导航

word (黄色 - 唯一彩色)
└── DEFAULT:   #F59E0B    目标单词高亮标记
```

### 使用原则
- **黄色仅在以下场景使用**：复习页目标词标注、学习页"不认识"按钮反馈
- **不要**将黄色用于装饰、图标、或非单词标注的地方
- 界面保持 95% 以上黑白灰占比

## 字体

### 字号体系

| 用途 | 大小 | 字重 |
|------|------|------|
| 单词大标题 | text-3xl (30px) | font-bold |
| 中文释义 | text-lg (18px) | font-medium |
| 例句正文 | text-base (16px) | font-normal |
| 辅助信息 | text-sm (14px) | font-normal |
| 标签/徽章 | text-xs (12px) | font-medium |

### 字体选择
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
             'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
```
使用系统默认字体，确保中英文混排效果最佳。

## 间距

- 使用 Tailwind 默认间距（4px 基准）
- 页面左右内边距：px-4（16px）
- 卡片内边距：p-4（16px）或 p-6（24px）
- 组件间距：gap-3（12px）或 gap-4（16px）
- 章节间距：mb-6（24px）或 mb-8（32px）

## 组件规范

### 底部导航栏（BottomNav）
- 高度：h-14（56px）
- 固定在底部（fixed bottom-0）
- 4 个入口：首页 / 词书 / 复习 / 我的
- 活跃项：ink 色图标 + 文字
- 非活跃项：ink-muted 色图标 + 文字

### 顶部导航栏（TopHeader）
- 高度：h-12（48px）
- 居中标题（text-sm, font-medium）
- 左侧：返回按钮（如有）
- 右侧：操作按钮（如有）

### 卡片
- 白色背景 + 1px 灰色边框（border-rule）
- 圆角：rounded-xl（12px）或 rounded-2xl（16px）
- 轻微阴影：shadow-sm

### 按钮
- 主按钮：全黑背景 + 白色文字（bg-ink text-white）
- 次按钮：白色背景 + 灰色边框（bg-white border border-rule）
- 圆角：rounded-full（全圆角，胶囊形）
- 高度：h-10（40px）或 h-12（48px）
- 禁用状态：opacity-50

### 输入框
- 白色背景 + 底部灰色下划线（border-b border-rule）
- 聚焦时：下划线变深（border-b-2 border-ink）
- 圆角：rounded-none 或 rounded-lg

## 交互规范

### 反馈
- 正确操作：绿色短动画（scale + color flash）
- 错误操作：红色短动画 + 正确答案展示
- 学习进展：进度条平滑过渡（transition-all duration-300）

### 动画
- 页面切换：无动画（即时渲染）
- 卡片出现：fade-in + slide-up（animations 自定义）
- 反馈提示：200ms ease-out
- 避免过度动画，保持界面响应迅速

## 移动端适配

- 基准设计宽度：375px（iPhone 6/7/8）
- 最大内容宽度：max-w-lg（512px，居中显示）
- 触摸目标最小尺寸：44×44px（iOS HIG 标准）
- 底部安全区域：pb-safe（env(safe-area-inset-bottom)）

## 可访问性
- 颜色对比度：文字与背景 ≥ 4.5:1（WCAG AA）
- 按钮有明确的 hover/active/focus 状态
- 输入框有明确的 focus 视觉提示
- 语音功能提供视觉替代（文字同步显示）
