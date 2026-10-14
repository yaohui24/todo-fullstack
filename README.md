# 待办清单 To-Do

一个用于学习「AI 全栈开发」的教学项目：从一个纯前端 To-Do 开始，按
**前端 → 后端 → 数据库 → 部署** 四个阶段逐步演进，最终做成一个完整的全栈应用。

## 路线图

| 阶段 | 内容 | 技术栈 | 状态 |
|---|---|---|---|
| 一 | 纯前端 To-Do（增删改查 + 筛选 + 本地存储） | Vite + React + TypeScript + Tailwind CSS | ✅ 已完成 |
| 二 | 后端 REST API（内存存储） | Node.js + Express 5 | ✅ 已完成 |
| 三 | 数据库持久化 | PostgreSQL（Neon 免费云端，已连接） | ✅ 已完成 |
| 四 | 部署上线 | Vercel（前端）+ Render / Railway（后端） | ⬜ 待开始 |

## 如何运行（需要开两个终端）

```bash
# 终端 1：启动后端（端口 3001）
cd backend
npm install   # 第一次运行前安装依赖（只需一次）
npm run dev   # 启动后端，文件改动自动重启

# 终端 2：启动前端（端口 5173）
cd frontend
npm install   # 第一次运行前安装依赖（只需一次）
npm run dev   # 浏览器打开 http://localhost:5173
```

**后端启动时会打印当前的数据存储模式**：

- `⚠️ 数据存储：内存` —— 没配置数据库（重启后端数据清零）
- `🗄️ 数据存储：PostgreSQL` —— 已连接数据库（数据永久保存）

## 数据库配置（✅ 已完成，步骤留档备查）

1. 打开 <https://neon.tech> → 注册 / 登录（用 GitHub 账号最快）
2. 创建项目：名字随意（如 `todo-app`），Region 选离你近的（如 Singapore）
3. 进入项目 Dashboard → 点 **Connect** → 复制 **Pooled connection** 连接串
   （形如 `postgresql://用户名:密码@ep-xxx-pooler.xxx.aws.neon.tech/neondb?sslmode=require`）
4. 复制 `backend/.env.example` 为 `backend/.env`，把连接串粘贴到 `DATABASE_URL=` 后面
5. 重启后端（`Ctrl+C` 后重新 `npm run dev`），看到 `🗄️ 数据存储：PostgreSQL` 即成功

> ⚠️ 安全规则：`.env` 里有数据库密码，已写入 `.gitignore`，**绝不提交到 GitHub**。
> （不用 Neon 也行：Supabase 的 Database 设置页同样能拿到 PostgreSQL 连接串。）

## 如何查看数据库里的数据（三种方式）

```bash
# 方式一：项目自带的查看器（推荐，直接看表内容）
cd backend
node --env-file-if-exists=.env view.js

# 方式二：走后端接口（看"正式入口"返回的数据）
curl http://localhost:3001/api/todos
```

方式三：**Neon 控制台**（图形界面，适合浏览和手动改数据）
1. 打开 <https://neon.tech> 进入项目
2. 左侧 **Tables**（数据表）→ 点 `todos` 表 → 直接看到每一行，还能手动编辑/删除
3. 或左侧 **SQL Editor** → 输入 `SELECT * FROM todos;` → Run 执行

> 三者的关系：页面和接口是"正式入口"（走后端、有校验）；view.js 是"直接撬开数据库看"（调试用）；Neon 控制台是数据库厂商提供的官方管理界面。

## 功能清单（阶段三）

- [x] 存储抽象层：`store.memory.js`（内存兜底）与 `store.pg.js`（PostgreSQL）提供完全相同的五个方法
- [x] 后端启动时按 `DATABASE_URL` 自动选择存储方式，路由与接口一行不改
- [x] PostgreSQL：启动自动建表（`CREATE TABLE IF NOT EXISTS` 幂等）
- [x] 全部 SQL 使用参数化查询（`$1` 占位符），防 SQL 注入
- [x] `RETURNING` 语法让增删改直接返回最新数据
- [x] 接入真实数据库（Neon PostgreSQL）：写入 → 重启后端 → 数据完好，已实测验证

## 目录结构

```
待办清单 To-Do/
├── backend/                     # 后端项目（Node.js + Express 5）
│   ├── server.js                # 入口：中间件 + 选存储 + 5 个接口 + 兜底
│   ├── store.memory.js          # 存储实现①：内存（没配数据库时兜底）
│   ├── store.pg.js              # 存储实现②：PostgreSQL（配置 DATABASE_URL 后启用）
│   ├── schema.sql               # 表结构参考（学习用，建表已自动化）
│   ├── view.js                  # 数据库查看器：node --env-file-if-exists=.env view.js
│   ├── .env.example             # 环境变量模板（复制为 .env 使用）
│   └── package.json             # 依赖：express + cors + pg
├── frontend/                    # 前端项目（Vite + React + TS + Tailwind）
│   └── src/
│       ├── api.ts               # 所有后端接口调用集中在这里
│       ├── hooks/useTodos.ts    # 增删改查逻辑（调后端接口）
│       ├── components/          # TodoForm / FilterBar / TodoItem
│       └── ...                  # 其余见阶段一说明
├── CLAUDE.md                    # AI 协作约定（给 AI 看的项目记忆）
└── README.md                    # 本文件
```

## 学习要点

### 阶段一（前端基础）
1. **组件化** / **状态提升** / **受控组件** / **不可变更新** / **列表 key**（详见代码注释）

### 阶段二（前后端分离）
1. **后端是什么**：常驻程序监听 3001 端口，按「路径 + 方法」分发处理
2. **REST 风格**：路径是名词，方法是动词（GET 查 / POST 增 / PUT 改 / DELETE 删）
3. **CORS 跨域**：端口不同浏览器默认拦截，后端 `cors` 中间件放行
4. **状态码**：200 / 201 / 204 / 400 / 404 / 500 各自的含义
5. **服务器为真相源**：先调接口成功，再更新界面；失败显示错误横幅
6. **分层红利**：只改 `useTodos` 就完成数据源切换，UI 组件零改动

### 阶段三（数据库与配置）
1. **存储抽象层**：路由只管调用 `store.list()` 等方法，不关心数据存在哪——和前端 `api.ts` 的思路完全对称
2. **环境变量与 .env**：连接串属于机密，放 `.env` 文件（gitignore 排除），Node 用 `--env-file-if-exists=.env` 自动加载
3. **连接池（Pool）**：建立数据库连接很耗时，Pool 复用连接而不是每次新建
4. **参数化查询**：`WHERE id = $1` + 单独传值，用户输入永远不拼进 SQL，防注入
5. **幂等建表**：`CREATE TABLE IF NOT EXISTS`，启动时自动执行，重复运行也不报错
6. **RETURNING**：INSERT/UPDATE 直接返回新数据，省一次查询
7. **命名转换**：数据库用下划线 `created_at`，接口用驼峰 `createdAt`，SQL 里 `AS "createdAt"` 转换
8. **BIGINT 的坑**：pg 默认把 BIGINT 查成字符串，用 `setTypeParser(20, ...)` 转回数字
