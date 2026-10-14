import type { Todo } from './types'

/**
 * 数据层：前端所有对后端接口的调用都集中在这个文件里。
 * 好处：以后换接口地址（比如阶段四部署上线）只需要改 API_BASE 这一行。
 */

// 后端接口地址：
// - 本地开发：不设置环境变量，默认连 localhost:3001
// - 线上部署：在 Vercel 配置环境变量 VITE_API_BASE = https://你的后端域名/api
//   （?? 是"空值合并"：左边是 undefined/null 时才用右边的默认值）
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001/api'

/** 通用请求封装：统一拼接地址、处理 JSON 解析和错误信息 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  // HTTP 状态码不在 2xx 范围 = 请求失败
  if (!res.ok) {
    // 后端约定返回 { error: "原因" }，尽量把原因显示出来
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? `请求失败（状态码 ${res.status}）`)
  }

  // 204 = 删除成功但没有返回体，直接返回 undefined
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/** 五个接口，和后端的 REST 约定一一对应 */
export const api = {
  // 获取全部待办
  list: () => request<Todo[]>('/todos'),

  // 新建待办
  add: (text: string) =>
    request<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // 更新待办（可以只传要改的字段）
  update: (id: string, patch: { text?: string; completed?: boolean }) =>
    request<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  // 删除待办
  remove: (id: string) => request<void>(`/todos/${id}`, { method: 'DELETE' }),

  // 清除所有已完成
  clearCompleted: () =>
    request<void>('/todos/clear-completed', { method: 'POST' }),
}
