# CLAUDE.md - Recollection 项目指引

## 项目简介

**Recollection** 是一款面向英语专业学生的深度学习型词汇记忆 PWA 应用。核心理念：通过"中→英造句 + AI 诊断"的方式，真正掌握单词的搭配、语境和地道用法。

- **目标平台**：Android（PWA 安装到桌面）
- **当前阶段**：Demo（个人测试）
- **用户**：英专生（编程小白，由 Claude 负责开发）

## 工作原则

### 最重要：逐步推进，每步确认

- **严格按 Phase 顺序开发**，不要跳过或合并阶段
- **每个 Phase 完成后必须停下来**，向用户展示成果和验证结果
- **等待用户明确确认**（"可以进行下一步"、"下一阶段"等）后再继续
- **不要一次性生成大量代码**，保持每次交付可审查

### 沟通语言

用户是中文母语者。所有解释、汇报、文档用**中文**。代码注释用中文。

### 质量标准

- 遵循 TypeScript 严格模式
- UI 严格遵循设计规范（黑白灰 + 仅黄色用于单词标注）
- 数据库操作通过 `dataService.ts` 封装
- 所有异步操作需处理 loading / error 状态
- 组件单一职责，可复用

## 标准文件

| 文档 | 路径 | 用途 |
|------|------|------|
| 开发需求 | [docs/requirements.md](docs/requirements.md) | 功能需求、用户故事、优先级 |
| 技术规范 | [docs/tech-specs.md](docs/tech-specs.md) | 技术栈、架构、API 集成、数据库设计 |
| 设计规范 | [docs/design-specs.md](docs/design-specs.md) | 色彩、字体、间距、组件、交互规范 |
| 开发指引 | [docs/development-guide.md](docs/development-guide.md) | 工作流程、Phase 列表、质量标准 |
| 实现计划 | [.claude/plans/ai-1-2-ai-2-3-3-synthetic-hoare.md](.claude/plans/ai-1-2-ai-2-3-3-synthetic-hoare.md) | 详细技术实现计划 |

## 技术栈速查

- **前端**：React 18 + TypeScript + Vite 6
- **样式**：Tailwind CSS 4（黑白灰主调，黄色 #F59E0B 仅用于目标词标注）
- **路由**：React Router 6（13 个页面）
- **数据库**：Dexie.js（IndexedDB 封装，9 张表）
- **状态**：Zustand 5（持久化中间件）
- **AI**：OpenAI 兼容接口（`gpt-5.6-sol`，通过 Cloudflare Worker 代理）
- **语音**：Web Speech API
- **PWA**：vite-plugin-pwa + Workbox

## Phase 开发顺序

1. 项目搭建 + 基础框架 → 2. 数据库+类型+种子数据 → 3. 词书+学习流程 → 4. 复习本+AI集成 → 5. 积累本 → 6. 首页+艾宾浩斯调度器 → 6.5 自测中心 → 6.6 学习统计仪表盘 → 7. 每周复习 → 8. 每月播客 → 9. PWA离线+安装 → 10. 设置+数据管理

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm run preview  # 预览生产构建
npx tsc --noEmit # TypeScript 类型检查
```
