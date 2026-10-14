/**
 * 内存存储实现（阶段二的方案，现在保留作为"没配数据库时的兜底"）。
 *
 * 和 store.pg.js 对外提供完全一样的五个方法（方法签名一致）：
 *   list() / add(text) / update(id, patch) / remove(id) / clearCompleted()
 *
 * 这样 server.js 的路由代码不关心数据到底存在哪——想换存储方式，
 * 路由一行都不用改。这个思路叫"面向接口编程"，和前端把接口调用
 * 收口在 api.ts 是同一个道理。
 */
export function createMemoryStore() {
  let todos = [] // 全部待办数据
  let nextId = 1 // 自增 id 计数器

  return {
    /** 查询全部待办 */
    async list() {
      return todos
    },

    /** 新建一条待办，返回创建好的数据 */
    async add(text) {
      const todo = {
        id: String(nextId++), // 转成字符串，和前端约定的 id:string 一致
        text,
        completed: false,
        createdAt: Date.now(),
      }
      todos.unshift(todo) // 新的排在最前面
      return todo
    },

    /** 更新待办（可改 text / completed），找不到返回 null */
    async update(id, patch) {
      const todo = todos.find((t) => t.id === id)
      if (!todo) return null
      if (typeof patch?.text === 'string' && patch.text.trim()) {
        todo.text = patch.text.trim()
      }
      if (typeof patch?.completed === 'boolean') {
        todo.completed = patch.completed
      }
      return todo
    },

    /** 删除待办，返回是否真的删掉了（没找到返回 false） */
    async remove(id) {
      const before = todos.length
      todos = todos.filter((t) => t.id !== id)
      return todos.length < before
    },

    /** 清除所有已完成的待办 */
    async clearCompleted() {
      todos = todos.filter((t) => !t.completed)
    },
  }
}
