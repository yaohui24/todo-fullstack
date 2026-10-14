/**
 * 数据库查看器（调试工具）
 * 用法：cd backend && node --env-file-if-exists=.env view.js
 *
 * 作用：绕过后端接口，直接连 PostgreSQL 把 todos 表的内容打印出来。
 * 平时看数据走接口（curl / 页面）就行；这个脚本是"直接撬开数据库看一眼"，
 * 用来排查"接口返回的到底是不是数据库里的"这类问题。
 */
import pg from 'pg'

const { Pool } = pg

// 和 store.pg.js 一样：把 BIGINT 查询结果转回数字
pg.types.setTypeParser(20, (v) => parseInt(v, 10))

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon 云数据库需要 TLS 加密
})

try {
  const { rows } = await pool.query(
    `SELECT id, text, completed, created_at AS "createdAt"
     FROM todos ORDER BY created_at DESC`,
  )

  const doneCount = rows.filter((t) => t.completed).length
  console.log(`🗄️  todos 表共 ${rows.length} 条（已完成 ${doneCount}，未完成 ${rows.length - doneCount}）`)
  console.log('─'.repeat(60))

  for (const t of rows) {
    const time = new Date(t.createdAt).toLocaleString('zh-CN')
    const flag = t.completed ? '✅' : '⬜'
    console.log(`${flag} ${t.text}`)
    console.log(`   id: ${t.id}  创建于 ${time}`)
  }

  if (rows.length === 0) {
    console.log('（表是空的，去页面添加一条吧）')
  }
} catch (err) {
  console.error('❌ 查询失败:', err.message)
  console.error('   请确认 DATABASE_URL 已配置且 Neon 项目正常运行')
  process.exit(1)
} finally {
  await pool.end() // 用完关闭连接池，程序才能正常退出
}
