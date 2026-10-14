import { useState } from 'react'
import { useTodos } from './hooks/useTodos'
import type { FilterType } from './types'
import TodoForm from './components/TodoForm'
import FilterBar from './components/FilterBar'
import TodoItem from './components/TodoItem'

const FILTER_LABELS: Record<FilterType, string> = {
  all: '',
  active: '未完成',
  completed: '已完成',
}

/** 页面根组件：负责组装各部分，并把数据和操作函数向下分发 */
export default function App() {
  // 阶段二新增：loading（加载中）和 error（出错提示）也由 Hook 提供
  const {
    todos,
    loading,
    error,
    reload,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
  } = useTodos()
  // 当前筛选条件（纯界面状态，不需要持久化）
  const [filter, setFilter] = useState<FilterType>('all')

  // 根据筛选条件算出要显示的待办（每次渲染时重新计算，代码简单清晰）
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter((t) => !t.completed).length
  const completedCount = todos.length - activeCount

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-sky-50 to-emerald-50 px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        {/* 标题区 */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-800">📝 我的待办清单</h1>
          <p className="mt-2 text-sm text-slate-500">
            {todos.length === 0
              ? '今天想完成点什么？从添加第一条待办开始吧'
              : `共 ${todos.length} 条待办，还有 ${activeCount} 条未完成`}
          </p>
        </header>

        {/* 主体卡片 */}
        <main className="rounded-2xl bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur">
          <div className="p-5 sm:p-6">
            {/* 添加待办 */}
            <TodoForm onAdd={addTodo} />

            {/* 错误横幅：接口失败时显示原因 + 重试按钮 */}
            {error && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                <span>⚠️ {error}</span>
                <button
                  onClick={reload}
                  className="shrink-0 rounded-lg bg-rose-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-rose-600"
                >
                  重试
                </button>
              </div>
            )}

            {loading ? (
              /* 加载中：首次从后端拉数据时的占位提示 */
              <div className="py-10 text-center text-sm text-slate-400">
                正在从后端加载数据…
              </div>
            ) : (
              <>
                {/* 筛选切换 */}
                <FilterBar
                  current={filter}
                  onChange={setFilter}
                  counts={{
                    all: todos.length,
                    active: activeCount,
                    completed: completedCount,
                  }}
                />

                {/* 待办列表（列表项必须有唯一的 key，React 靠它识别每一项） */}
                {filteredTodos.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400">
                    {todos.length === 0
                      ? '还没有待办，先添加一条吧 👆'
                      : `没有${FILTER_LABELS[filter]}的待办`}
                  </div>
                ) : (
                  <ul className="mt-2 divide-y divide-slate-100">
                    {filteredTodos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={toggleTodo}
                        onDelete={deleteTodo}
                        onEdit={editTodo}
                      />
                    ))}
                  </ul>
                )}

                {/* 底部统计 */}
                {todos.length > 0 && (
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                    <span>
                      已完成 {completedCount} / {todos.length}
                    </span>
                    {completedCount > 0 && (
                      <button
                        onClick={clearCompleted}
                        className="transition hover:text-rose-500"
                      >
                        清除已完成
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <footer className="mt-6 text-center text-xs text-slate-400">
          阶段三 · 数据由 Express 后端提供 · 配置数据库（DATABASE_URL）后永久保存
        </footer>
      </div>
    </div>
  )
}
