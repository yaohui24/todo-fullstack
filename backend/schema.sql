-- 待办表结构（参考文件）
-- 实际建表由 store.pg.js 启动时自动执行（CREATE TABLE IF NOT EXISTS），
-- 这个文件留给你学习：字段和前端数据模型 { id, text, completed, createdAt } 一一对应

CREATE TABLE IF NOT EXISTS todos (
  id         TEXT PRIMARY KEY,               -- 唯一标识（对应 id: string）
  text       TEXT NOT NULL,                  -- 待办内容（对应 text: string）
  completed  BOOLEAN NOT NULL DEFAULT false, -- 是否完成（对应 completed: boolean）
  created_at BIGINT NOT NULL                 -- 创建时间戳毫秒（对应 createdAt: number）
                                             -- 用 BIGINT 因为毫秒数超过了 int4 的上限（约 21 亿）
);

-- store.pg.js 里用到的 SQL 语句速查：
--   查询：  SELECT id, text, completed, created_at AS "createdAt" FROM todos ORDER BY created_at DESC;
--   插入：  INSERT INTO todos (id, text, completed, created_at) VALUES ($1, $2, false, $3) RETURNING ...;
--   更新：  UPDATE todos SET text = $1 WHERE id = $2 RETURNING ...;
--   删除：  DELETE FROM todos WHERE id = $1;
--   清已完成：DELETE FROM todos WHERE completed = true;
