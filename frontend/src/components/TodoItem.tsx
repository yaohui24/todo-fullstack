import { useEffect, useRef, useState } from 'react'
import type { Todo } from '../types'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, newText: string) => void
}

/** 单条待办：完成/取消完成、双击编辑、删除 */
export default function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false) // 是否处于编辑状态
  const [draft, setDraft] = useState(todo.text) // 编辑中的草稿内容
  const inputRef = useRef<HTMLInputElement>(null) // 用来拿到输入框 DOM 实现自动聚焦

  // 进入编辑状态时，自动让输入框获得焦点
  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  /** 保存编辑：内容有效且真的改了才提交 */
  function commitEdit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.text) {
      onEdit(todo.id, trimmed)
    }
    setIsEditing(false)
  }

  /** 取消编辑：恢复原文，退出编辑状态 */
  function cancelEdit() {
    setDraft(todo.text)
    setIsEditing(false)
  }

  return (
    <li className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
      {/* 自定义圆形复选框：点击切换完成状态 */}
      <button
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? '标记为未完成' : '标记为已完成'}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          todo.completed
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-slate-300 hover:border-indigo-400'
        }`}
      >
        {todo.completed && (
          <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true">
            <path
              d="M4 10.5l4 4 8-9"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {isEditing ? (
        /* 编辑态：Enter 保存，Esc 取消，点别处（失焦）也保存 */
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit()
            if (e.key === 'Escape') cancelEdit()
          }}
          className="flex-1 rounded-lg border border-indigo-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
        />
      ) : (
        /* 展示态：双击进入编辑 */
        <span
          onDoubleClick={() => setIsEditing(true)}
          title="双击可编辑"
          className={`flex-1 cursor-default text-sm ${
            todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'
          }`}
        >
          {todo.text}
        </span>
      )}

      {/* 删除按钮：鼠标悬停在该行时才显示（手机上始终显示） */}
      <button
        onClick={() => onDelete(todo.id)}
        aria-label="删除这条待办"
        className="rounded-lg px-2 py-1 text-xs text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 md:opacity-0 md:group-hover:opacity-100"
      >
        删除
      </button>
    </li>
  )
}
