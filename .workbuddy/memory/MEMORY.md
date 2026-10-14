# 待办清单 To-Do — 项目长期备忘

## 项目定位
AI 全栈开发教学项目。用户（前端入门水平）按阶段学习：前端 → 后端 → 数据库 → 部署。

## 已确认的关键决策
- 路线：四阶段分批开发（用户明确选择，理由是每层概念更清晰；不用 Next.js 一体化）
- 阶段一（已完成）：Vite 7 + React 19 + TS strict + Tailwind v4，数据存 localStorage
- 数据模型（贯穿全项目）：`{ id: string, text: string, completed: boolean, createdAt: number }`
- 阶段二（已完成）：Express 5 后端（backend/，端口 3001），内存数组存储；REST 五接口（GET/POST/PUT/DELETE /api/todos + clear-completed）；前端新增 api.ts 数据层，useTodos 改调接口，组件层未动
- 阶段三（已完成）：Neon PostgreSQL（新加坡区，项目 todoList-app，免费档）已连接；DATABASE_URL 在 backend/.env（已 gitignore，属机密不提交不入记忆）；存储抽象层按环境变量自动切换；重启持久化已实测；Neon 空闲会休眠，首次请求慢约半秒属正常
- 阶段四约定：前端 Vercel，后端 Render/Railway

## 项目约定（详见根目录 CLAUDE.md）
- 目录：frontend/（前端）、backend/（阶段二创建）
- 业务逻辑集中在 hooks，组件只管展示；注释与 UI 文案用中文
- 每完成一个阶段要更新 CLAUDE.md 的进度
- 交付后向用户讲解"改了什么、为什么"
