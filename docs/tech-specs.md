# 技术规范 - Recollection

## 技术栈

| 维度 | 选型 | 版本 | 选择理由 |
|------|------|------|----------|
| 前端框架 | React + TypeScript | 18.3+ | 用户确认 PWA 方案 |
| 构建工具 | Vite | 6.0+ | 快速开发、原生 ESM |
| CSS | Tailwind CSS | 4.0+ | 黑白灰简约风格，效率高 |
| 路由 | React Router | 6.28+ | 客户端 SPA 路由标准方案 |
| 本地数据库 | Dexie.js | 4.0+ | IndexedDB 封装，TypeScript 友好 |
| 状态管理 | Zustand | 5.0+ | 轻量、支持持久化中间件 |
| PWA | vite-plugin-pwa + Workbox | 1.3+ | Vite 生态集成最好的 PWA 方案 |
| AI | DeepSeek API | V4 Flash (免费) | 用户已有 Key，中文能力强 |
| TTS | Web Speech API | 浏览器原生 | 免费、跨平台 |

## 不使用的技术（有意的选择）

- **无后端服务器**：纯前端，数据全在 IndexedDB
- **无 Axios**：`fetch()` 原生支持足以覆盖单一 API 调用
- **无 UI 组件库**：Tailwind + 自定义组件更轻且可控
- **无 i18n 库**：应用单语言（中文 UI），字符串硬编码
- **无 Zod**：AI 响应校验用自定义 type guard

## 项目架构

```
Recollection/
├── index.html                 # SPA 入口 HTML
├── package.json
├── vite.config.ts             # Vite + PWA + Tailwind 配置
├── tsconfig.json
├── docs/                      # 项目文档
├── public/icons/              # PWA 图标
└── src/
    ├── main.tsx               # ReactDOM 入口
    ├── App.tsx                # Router + Provider 组合
    ├── index.css              # Tailwind 指令 + 全局样式
    ├── types/                 # TypeScript 类型定义
    ├── db/                    # Dexie 数据库（Schema + Seed）
    ├── stores/                # Zustand 状态管理
    ├── services/              # 业务逻辑层
    ├── hooks/                 # 自定义 Hooks
    ├── data/                  # 种子数据（词书+单词+例句）
    ├── routes/                # 页面组件（13页）
    ├── components/            # 可复用 UI 组件
    └── utils/                 # 通用工具函数
```

## 数据流

```
用户操作 → Zustand Store → dataService → Dexie DB (IndexedDB)
                ↕
          React Component (重渲染)
                ↕
          AI Service → DeepSeek API (仅作文本检查)
```

## 关键技术决策

### 1. 本地优先（Offline-First）
- 所有词书、单词、学习进度数据存储在 IndexedDB
- AI 功能检测网络状态，断网时入待处理队列，恢复后自动重试
- Service Worker 缓存所有静态资源（JS/CSS/HTML/图标）

### 2. DeepSeek API 集成
- Endpoint: `POST https://api.deepseek.com/v1/chat/completions`
- Model: `deepseek-v4-flash`（免费额度 500万 tokens）
- Response Format: `json_object`（确保返回结构化 JSON）
- Temperature: 0.3（低温度保证评分一致性）
- Max Tokens: 1200（单次复习检查）
- 单次调用约 980 tokens（System 400 + User 80 + Response 500）

### 3. 艾宾浩斯遗忘曲线算法
- 8 阶段固定间隔：0 → 20min → 1h → 1d → 2d → 6d → 14d → 30d → 已掌握
- 质量评分驱动推进：5=正确轻松(+1) / 3-4=正确犹豫(保持) / 0-2=错误(-1)
- 保留率 = 基础理论保留率 + 质量加成

### 4. Web Speech API 使用
- 单词发音：`SpeechSynthesisUtterance(word)` + `lang='en-US'`
- 月播客队列：逐词朗读 + 3秒间隔（setInterval）
- 已知限制：不同 Android 设备/浏览器音质差异大

### 5. IndexedDB 数据库设计
- 9 张表：wordBooks, words, learningProgress, reviewEntries, reviewAttempts, reviewSessions, accumulationEntries, selfTestAttempts, dailyLogs, settings
- 主键策略：wordBooks/words/learningProgress 使用业务 ID，其余使用 UUID
- 索引策略：按外键、日期、状态建立索引以优化查询

## 开发环境要求

- Node.js 18+
- npm 9+
- 现代浏览器（Chrome/Edge 支持 Web Speech API）
- DeepSeek API Key（免费注册获取）
