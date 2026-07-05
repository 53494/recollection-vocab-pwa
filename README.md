# Recollection - 英专生深度学习词汇记忆PWA
## 项目简介
**Recollection** 是面向英语专业学生的轻量化深度学习型词汇记忆PWA网页应用，核心学习逻辑为「中文释义→自主英文造句 + DeepSeek AI语法诊断」，帮助使用者掌握单词地道搭配、语境与实用句式，完整落地教育类AI产品雏形Demo。
- 目标运行平台：支持PWA打包，可安装至Android手机桌面离线使用
- 当前开发阶段：个人测试Demo版本，完整实现核心学习链路
- 目标用户：英语专业学生群体

## 技术栈
React 18 + TypeScript + Vite 6
Tailwind CSS 4 | React Router 6
Dexie.js(IndexedDB本地数据库) | Zustand 5 状态管理
DeepSeek V4 Flash API | Web Speech 语音朗读
vite-plugin-pwa + Workbox（离线PWA能力）

## 核心产品功能
1. 单词词书系统：分级词汇库、本地离线存储单词数据，自定义词书导入
2. 核心学习流程：中文提示自主造句，调用DeepSeek大模型完成英文句子语法诊断、用词优化、搭配解析
3. 记忆复习体系：基于艾宾浩斯遗忘曲线调度复习，区分生词、熟词、错题
4. 配套学习模块：积累本、自测中心、学习数据统计仪表盘、周/月度定期复习计划
5. 辅助能力：单词语音朗读、离线PWA安装、本地数据导入导出、个性化设置
6. 异常容错：AI接口加载/失败状态处理、数据库读写封装、空输入拦截

## 设计规范
整体黑白灰极简主色调，仅使用黄色`#F59E0B`作为单词高亮标注色，统一组件间距、字体、交互反馈，全页面响应式适配手机/电脑端。

## 本地完整运行教程
1. 克隆项目至本地
```bash
git clone https://53494.github.io/recollection-vocab-pwa.git