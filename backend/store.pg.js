import pg from 'pg'

const { Pool } = pg

/**
 * PostgreSQL 存储实现（阶段三）。
 *
 * 关键知识点：
 * 1. Pool（连接池）：和数据库建立连接很耗时，Pool 提前准备好若干条连接反复使用
 * 2. 参数化查询：SQL 里的 $1、$2 是占位符，值单独传——用户输入永远
 *    不会被拼进 SQL 语句，从根源上防住"SQL 注入"攻击
 * 3. RETURNING：INSERT/UPDATE 后直接把新数据查回来，不用再发一次 SELECT
 */

// pg 默认把 BIGINT（8 字节整数）查出来是字符串，这里改回数字——
// 前端的数据模型约定 createdAt 是 number。20 是 BIGINT 的类型编号
pg.types.setTypeParser(20, (value) => parseInt(value, 10))

export async function createPgStore() {
  const connectionString = process.env.DATABASE_URL

  // Neon / Supabase 等云数据库强制 TLS 加密连接；localhost 不需要
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString)

  const pool = new Pool({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  })

  // 启动时自动建表：IF NOT EXISTS 保证重复启动也不报错（这叫"幂等"）
  // 表结构和前端的数据模型一一对应：{ id, text, completed, createdAt }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id         TEXT PRIMARY KEY,
      text       TEXT NOT NULL,
      completed  BOOLEAN NOT NULL DEFAULT false,
      created_at BIGINT NOT NULL
    )
  `)

  // SELECT 的公共部分：把数据库的下划线命名 created_at 转成前端的驼峰 createdAt
  const SELECT_COLS = 'id, text, completed, created_at AS "createdAt"'

  return {
    /** 查询全部待办，新的排在前面 */
    async list() {
      const { rows } = await pool.query(
        `SELECT ${SELECT_COLS} FROM todos ORDER BY created_at DESC`,
      )
      return rows
    },

    /** 新建一条待办，返回创建好的数据 */
    async add(text) {
      const { rows } = await pool.query(
        `INSERT INTO todos (id, text, completed, created_at)
         VALUES ($1, $2, false, $3)
         RETURNING ${SELECT_COLS}`,
        [crypto.randomUUID(), text, Date.now()], // 值单独传，不拼进 SQL
      )
      return rows[0]
    },

    /** 更新待办（可改 text / completed），找不到返回 null */
    async update(id, patch) {
      // 按传入的字段动态拼 SET 子句，值全部走占位符
      const sets = []
      const values = []
      if (typeof patch?.text === 'string' && patch.text.trim()) {
        values.push(patch.text.trim())
        sets.push(`text = $${values.length}`)
      }
      if (typeof patch?.completed === 'boolean') {
        values.push(patch.completed)
        sets.push(`completed = $${values.length}`)
      }

      if (sets.length === 0) {
        // 什么都没传：原样查回来（找不到仍然返回 null）
        const { rows } = await pool.query(
          `SELECT ${SELECT_COLS} FROM todos WHERE id = $1`,
          [id],
        )
        return rows[0] ?? null
      }

      values.push(id) // id 放在最后一个占位符
      const { rows } = await pool.query(
        `UPDATE todos SET ${sets.join(', ')} WHERE id = $${values.length}
         RETURNING ${SELECT_COLS}`,
        values,
      )
      return rows[0] ?? null
    },

    /** 删除待办，返回是否真的删掉了 */
    async remove(id) {
      const { rowCount } = await pool.query('DELETE FROM todos WHERE id = $1', [id])
      return rowCount > 0
    },

    /** 清除所有已完成的待办 */
    async clearCompleted() {
      await pool.query('DELETE FROM todos WHERE completed = true')
    },
  }
}
