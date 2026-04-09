import { useState, ReactNode } from 'react'
import { ChevronRight, Repeat } from 'lucide-react'

import { ItemSelectorDialog } from './ItemSelectorDialog'

interface SelectorItem {
  id: string
  title: string
  isCompleted: boolean
  isRecurring: boolean
}

/** 通用项目选择器 Props */
export interface ItemSelectorProps {
  /** 当前选中的项目 ID */
  selectedId: string | null
  /** 所有可用的项目列表 */
  items: SelectorItem[]
  /** 选择/取消选择项目时的回调（传入 null 表示取消选中） */
  onSelect: (id: string | null) => void
  /** 图标组件 */
  icon: React.ComponentType<{ className?: string }>
  /** 弹窗标题 */
  dialogTitle: string
  /** 未选中时的提示文字 */
  placeholder: string
  /** 空列表提示文字 */
  emptyMessage: string
  /** 选中时的样式类名 */
  activeClassName: string
  /** 未选中时的文字样式类名 */
  placeholderClassName?: string
  /** 已选中时的文字样式类名 */
  selectedClassName?: string
  /** 外层容器额外样式 */
  className?: string
  /** 自定义徽章渲染 */
  renderBadges?: (item: { isRecurring: boolean }) => ReactNode
}

/**
 * 通用项目选择器组件
 * 显示当前选中项，点击可打开选择弹窗
 */
export const ItemSelector = ({
  selectedId,
  items,
  onSelect,
  icon: Icon,
  dialogTitle,
  placeholder,
  emptyMessage,
  activeClassName,
  placeholderClassName = 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
  selectedClassName = 'text-white/80 hover:text-white',

  renderBadges,
}: ItemSelectorProps) => {
  const [open, setOpen] = useState(false)

  const currentItem = items.find(t => t.id === selectedId)

  const handleSelect = (id: string) => {
    onSelect(id === selectedId ? null : id)
    setOpen(false)
  }

  const defaultRenderBadges = (item: { isRecurring: boolean }) =>
    item.isRecurring && (
      <span key="recurring" className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5">
        <Repeat className="w-3 h-3" />
        循环
      </span>
    )

  const dialogItems: { id: string; label: string; badges?: ReactNode[] }[] = items
    .filter(t => !t.isCompleted)
    .map(task => ({
      id: task.id,
      label: task.title,
      badges: [renderBadges ? renderBadges(task) : defaultRenderBadges(task)].filter(Boolean),
    }))

  return (
    <>
      {currentItem ? (
        <button
          className={`inline-flex items-center gap-1.5 cursor-pointer transition-colors text-sm font-medium ${selectedClassName}`}
          onClick={() => setOpen(true)}
        >
          <Icon className="w-4 h-4" />
          <span>{currentItem.title}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          className={`inline-flex items-center gap-1.5 cursor-pointer transition-colors text-sm font-medium ${placeholderClassName}`}
          onClick={() => setOpen(true)}
        >
          <Icon className="w-4 h-4" />
          <span>{placeholder}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <ItemSelectorDialog
        open={open}
        onOpenChange={setOpen}
        title={dialogTitle}
        items={dialogItems}
        selectedId={selectedId}
        onSelect={handleSelect}
        emptyMessage={emptyMessage}
        activeClassName={activeClassName}
      />
    </>
  )
}
