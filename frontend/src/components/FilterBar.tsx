import type { FilterType } from '../types'

interface Props {
  current: FilterType // 当前选中的筛选项
  onChange: (filter: FilterType) => void
  counts: Record<FilterType, number> // 三种筛选各自的数量
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '未完成' },
  { key: 'completed', label: '已完成' },
]

/** 筛选切换栏：三个标签页按钮，选中的高亮显示 */
export default function FilterBar({ current, onChange, counts }: Props) {
  return (
    <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            current === key
              ? 'bg-white text-indigo-600 shadow-sm' // 选中的样式
              : 'text-slate-500 hover:text-slate-700' // 未选中的样式
          }`}
        >
          {label}
          <span className="ml-1 text-xs opacity-60">{counts[key]}</span>
        </button>
      ))}
    </div>
  )
}
