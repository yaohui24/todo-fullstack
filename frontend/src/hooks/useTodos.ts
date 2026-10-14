import { useEffect, useState } from 'react'
import type { Todo } from '../types'
import { api } from '../api'

/**
 * 待办清单的核心逻辑 Hook（阶段二版本）。
 *
 * ⭐ 和阶段一的区别：数据不再存浏览器 localStorage，而是全部走后端接口。
 * 流程变成：组件触发操作 → 调后端接口 → 后端处理并返回最新数据 → 更新 state → 页面刷新。
 * 这叫"服务器是数据的唯一真相源"——前端不再自己造数据，只负责展示。
 *
 * 组件层（TodoForm/FilterBar/TodoItem）一行都没改：
 * 因为阶段一我们把数据逻辑收口在 Hook 里，换数据来源只需要改这里。这就是分层的价值。
 */

/** 把未知类型的错误转成可读的提示文字 */
function toMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true) // 首次加载中
  const [error, setError] = useState<string | null>(null) // 最近一次出错的提示

  // 首次进入页面：从后端拉取数据。[] 表示只在挂载时执行一次
  useEffect(() => {
    load()
  }, [])

  /** 从后端加载全部待办（首次加载 & 出错后点"重试"都用它） */
  async function load() {
    setLoading(true)
    setError(null)
    try {
      setTodos(await api.list())
    } catch (e) {
      setError(toMessage(e, '加载失败，请确认后端已启动'))
    } finally {
      setLoading(false) // 无论成功失败都要结束"加载中"状态
    }
  }

  /** 添加一条待办 */
  async function addTodo(text: string) {
    try {
      // 先让后端创建（id 由后端生成，保证唯一）
      const created = await api.add(text)
      // 再把后端返回的新数据放进列表（新待办排在最上面）
      setTodos((prev) => [created, ...prev])
    } catch (e) {
      setError(toMessage(e, '添加失败'))
    }
  }

  /** 切换某条待办的完成状态 */
  async function toggleTodo(id: string) {
    // 先在当前数据里找到这条，算出目标状态
    const target = todos.find((t) => t.id === id)
    if (!target) return
    try {
      const updated = await api.update(id, { completed: !target.completed })
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (e) {
      setError(toMessage(e, '更新失败'))
    }
  }

  /** 删除某条待办 */
  async function deleteTodo(id: string) {
    try {
      await api.remove(id)
      // 接口成功后，再从界面上移除（后端返回 204 没有数据，本地直接过滤）
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      setError(toMessage(e, '删除失败'))
    }
  }

  /** 编辑某条待办的文字 */
  async function editTodo(id: string, newText: string) {
    try {
      const updated = await api.update(id, { text: newText })
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (e) {
      setError(toMessage(e, '编辑失败'))
    }
  }

  /** 一键清除所有已完成的待办 */
  async function clearCompleted() {
    try {
      await api.clearCompleted()
      setTodos((prev) => prev.filter((t) => !t.completed))
    } catch (e) {
      setError(toMessage(e, '清除失败'))
    }
  }

  return {
    todos,
    loading,
    error,
    reload: load, // 给错误横幅的"重试"按钮用
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
  }
}
