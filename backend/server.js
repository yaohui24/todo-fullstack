import express from 'express'
import cors from 'cors'
import { createMemoryStore } from './store.memory.js'
import { createPgStore } from './store.pg.js'

/**
 * ============================================================
 * 待办清单后端（阶段三：存储抽象层版）
 * ============================================================
 * 这是一个"常驻运行的服务程序"：启动后监听 3001 端口，
 * 收到 HTTP 请求后，按「路径 + 方法」分发到对应的处理函数。
 *
 * REST 接口约定（路径是名词，方法是动词）：
 *   GET    /api/todos                  获取全部待办
 *   POST   /api/todos                  新建一条待办      body: { text }
 *   PUT    /api/todos/:id              更新一条待办      body: { text?, completed? }
 *   DELETE /api/todos/:id              删除一条待办
 *   POST   /api/todos/clear-completed  清除所有已完成
 *
 * ⭐ 阶段三的核心变化：数据操作从路由里抽出来，交给"存储层"（store）：
 *   - backend/.env 配置了 DATABASE_URL → store.pg.js   → PostgreSQL，数据永久保存
 *   - 没配置                           → store.memory.js → 内存兜底，重启清零
 * 两个存储对外的五个方法完全一样，所以路由代码不关心数据存在哪——
 * 换存储方式，路由一行都不用改。
 */

const app = express()
// 云平台（如 Render）会用环境变量 PORT 告诉我们该监听哪个端口；
// 本地没有 PORT 就用 3001。|| 的意思是"左边有值就用左边，没有就用右边"
const PORT = process.env.PORT || 3001

// ---------- 中间件（每个请求进来都会先经过它们） ----------

// 允许跨域：前端(5173)和后端(3001)端口不同，浏览器默认拦截。
// 本地开发放行所有来源；线上部署后可在云平台设置 CORS_ORIGIN 环境变量，
// 限定为前端域名（如 https://todo-xxx.vercel.app），更安全
const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN }
  : {}
app.use(cors(corsOptions))

// 让 req.body 能自动解析 JSON 请求体（前端 POST/PUT 发来的数据）
app.use(express.json())

// ---------- 启动时选择数据存储（二选一） ----------

let store
if (process.env.DATABASE_URL) {
  try {
    store = await createPgStore() // 内部会自动建表
    console.log('🗄️  数据存储：PostgreSQL（数据永久保存）')
  } catch (err) {
    console.error('❌ 数据库连接失败！请检查 backend/.env 里的 DATABASE_URL 是否正确')
    console.error('   错误信息:', err.message)
    process.exit(1) // 配了数据库但连不上：直接退出，避免带着坏配置运行
  }
} else {
  store = createMemoryStore()
  console.log('⚠️  数据存储：内存（重启会清零）。永久保存请参照 backend/.env.example 配置 DATABASE_URL')
}

// ---------- 接口路由（和阶段二完全一致，只是数据操作换成了 store） ----------

// 获取全部待办
app.get('/api/todos', async (req, res) => {
  const todos = await store.list()
  res.json(todos)
})

// 新建待办
app.post('/api/todos', async (req, res) => {
  // 校验参数：text 必须是非空字符串
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''
  if (!text) {
    return res.status(400).json({ error: 'text 不能为空' })
  }
  const todo = await store.add(text)
  // 201 = Created，创建成功；把新建的这条返回给前端
  res.status(201).json(todo)
})

// 更新待办（可以只改 text、只改 completed，或都改）
app.put('/api/todos/:id', async (req, res) => {
  // :id 是"路径参数"，比如 PUT /api/todos/3 时 req.params.id === '3'
  const todo = await store.update(req.params.id, {
    text: req.body?.text,
    completed: req.body?.completed,
  })
  if (!todo) {
    return res.status(404).json({ error: '待办不存在' })
  }
  res.json(todo)
})

// 删除单条待办
app.delete('/api/todos/:id', async (req, res) => {
  const ok = await store.remove(req.params.id)
  if (!ok) {
    return res.status(404).json({ error: '待办不存在' })
  }
  // 204 = No Content，删除成功但没有内容需要返回
  res.status(204).end()
})

// 清除所有已完成的待办
app.post('/api/todos/clear-completed', async (req, res) => {
  await store.clearCompleted()
  res.json({ ok: true })
})

// ---------- 兜底处理 ----------

// 上面都没匹配到的路径 → 404
app.use((req, res) => {
  res.status(404).json({ error: `接口不存在: ${req.method} ${req.path}` })
})

// 统一错误处理：任何处理函数里抛出的异常都会到这里，避免程序崩溃
app.use((err, req, res, next) => {
  console.error('服务器出错:', err)
  res.status(500).json({ error: '服务器内部错误' })
})

// ---------- 启动服务 ----------

app.listen(PORT, () => {
  console.log(`✅ 后端已启动，端口: ${PORT}`)
  console.log(`   自测命令: curl http://localhost:${PORT}/api/todos`)
})
