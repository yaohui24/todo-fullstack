# CLAUDE.md — AI 协作项目记忆

> 给 AI 的说明：每次开始工作前先读本文件，了解项目现状与约定，保持输出风格一致。

## 项目定位

学习型项目：用户以前端入门基础为起点，用 AI 辅助按阶段学习全栈开发。
讲解要求：关键代码要有中文注释；每次改动后要解释"改了什么、为什么这么改"。

## 路线与当前进度

- 阶段一 纯前端：✅ 已完成（Vite + React + TS + Tailwind）
- 阶段二 后端 API：✅ 已完成（Node.js + Express 5，内存存储，端口 3001）
  - 前端通过 `frontend/src/api.ts` 调接口，只改数据层（useTodos），组件层未动
  - 接口约定（阶段三接数据库后保持不变）：
    GET /api/todos · POST /api/todos {text} · PUT /api/todos/:id {text?,completed?} ·
    DELETE /api/todos/:id · POST /api/todos/clear-completed
- 阶段三 数据库：✅ 已完成（Neon PostgreSQL 新加坡区已连接，DATABASE_URL 存于 backend/.env）
  - 存储抽象层：store.memory.js（兜底）与 store.pg.js（PostgreSQL，启动自动建表），按 DATABASE_URL 自动二选一
  - 持久化已实测：创建 → 重启后端 → 数据完好（含 completed 状态）
  - Neon 免费档空闲休眠：数据库一段时间不用会缩容到零，首次请求慢约半秒，属正常现象
- 安全约定：连接串/密码只放 backend/.env（已加入 .gitignore），绝不提交到 GitHub，绝不写进代码或文档
- 阶段四 部署：前端 Vercel，后端 Render / Railway，数据库用云服务

## 技术约定

- 前端目录：`frontend/`；后端目录（阶段二再创建）：`backend/`
- TypeScript 严格模式；组件一律函数式 + hooks
- 业务逻辑集中在 `src/hooks/useTodos.ts`，组件只负责展示
- 注释和 UI 文案都用中文
- 样式统一用 Tailwind 工具类，不写自定义 CSS（index.css 只放全局基础样式）
- 阶段二、三的接口与表结构必须与阶段一的数据模型保持一致：
  ```ts
  { id: string, text: string, completed: boolean, createdAt: number }
  ```

## 工作流约定

- 一次只实现一个功能点，确认能跑再做下一个（小步迭代）
- 报错时先解释错误原因，再给修复方案
- 每完成一个阶段，更新本文件的"路线与当前进度"
