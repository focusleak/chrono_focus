import type { ReactNode } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/** 拖拽手柄 Props，合并到可拖拽元素的 attributes 和 listeners */
export interface DragHandleProps {
  /** 拖拽属性（无障碍访问） */
  dragHandleAttributes: Record<string, any>
  /** 拖拽事件监听器 */
  dragHandleListeners: Record<string, any>
  /** 是否正在拖拽 */
  isDragging: boolean
}

/** SortableList 每项可用的 Props */
export interface SortableItemProps<T> {
  /** 数据项 */
  item: T
  /** 在列表中的索引 */
  index: number
  /** 拖拽手柄（需绑定到拖拽触发元素） */
  drag: DragHandleProps
}

/** SortableList Props */
export interface SortableListProps<T extends { id: string }> {
  /** 列表数据 */
  items: T[]
  /** 排序变更回调 */
  onReorder: (orderedIds: string[]) => void
  /** 每项渲染函数 */
  renderItem: (props: SortableItemProps<T>) => ReactNode
  /** 每项间距类名 */
  gapClassName?: string
  /** 自定义拖拽传感器 */
  sensors?: ReturnType<typeof useSensors>
}

/** 内部包装组件，使用 useSortable */
function SortableItem<T extends { id: string }>({
  item,
  index,
  renderItem,
}: {
  item: T
  index: number
  renderItem: (props: SortableItemProps<T>) => ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  const drag: DragHandleProps = {
    dragHandleAttributes: attributes,
    dragHandleListeners: listeners ?? {},
    isDragging,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {renderItem({ item, index, drag })}
    </div>
  )
}

/**
 * 可拖拽排序列表组件
 * 封装了 @dnd-kit 的全部逻辑，使用者无需直接引用 dnd-kit
 *
 * @example
 * ```tsx
 * <SortableList
 *   items={tasks}
 *   onReorder={(ids) => reorderTasks(ids)}
 *   renderItem={({ item, drag }) => (
 *     <div>
 *       <span {...drag.dragHandleAttributes} {...drag.dragHandleListeners}>
 *         ☰
 *       </span>
 *       {item.title}
 *     </div>
 *   )}
 * />
 * ```
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  gapClassName = 'space-y-4',
  sensors: customSensors,
}: SortableListProps<T>) {
  // 默认拖拽传感器
  const defaultSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const sensors = customSensors ?? defaultSensors

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(t => t.id === active.id)
    const newIndex = items.findIndex(t => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(items, oldIndex, newIndex)
    onReorder(newOrder.map(t => t.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={gapClassName}>
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              item={item}
              index={index}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
