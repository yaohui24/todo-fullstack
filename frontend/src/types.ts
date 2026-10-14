/**
 * 数据结构定义：整个项目（前端、后端、数据库）都围绕这两个类型来
 */

// 一条待办事项
export interface Todo {
  id: string // 唯一标识
  text: string // 待办内容
  completed: boolean // 是否已完成
  createdAt: number // 创建时间戳（毫秒）
}

// 筛选类型：全部 / 未完成 / 已完成
export type FilterType = 'all' | 'active' | 'completed'
