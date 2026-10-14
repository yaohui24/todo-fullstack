import { useState } from 'react'
import type { FormEvent } from 'react'

interface Props {
  onAdd: (text: string) => void
}

/** 输入框 + 添加按钮：一个典型的"受控组件"（输入框的值由 state 控制） */
export default function TodoForm({ onAdd }: Props) {
  const [text, setText] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault() // 阻止表单提交时刷新页面
    const trimmed = text.trim() // 去掉首尾空格
    if (!trimmed) return // 空内容不添加
    onAdd(trimmed)
    setText('') // 添加完清空输入框
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="添加一条待办，比如：学完 React 组件"
        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="shrink-0 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        添加
      </button>
    </form>
  )
}
