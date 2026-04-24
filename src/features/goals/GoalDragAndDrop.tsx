import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useGoalStore } from '@/store/goalStore'

import type { Goal } from '@/types'

import { GripVertical, Plus, ChevronDown, ChevronRight } from 'lucide-react'

// 可排序的子目标项
function SortableSubGoal({
  subGoal,
  expanded,
  onToggle,
}: {
  subGoal: { id: string; title: string }
  expanded: boolean
  onToggle: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: subGoal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-lg">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <button
        onClick={onToggle}
        className="text-muted-foreground hover:text-foreground"
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      <span className="flex-1 text-sm font-medium">{subGoal.title}</span>
    </div>
  )
}

// 可排序的任务项
function SortableTask({
  task,
}: {
  task: { id: string; title: string }
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 py-2 px-3 bg-background border rounded-lg">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="flex-1 text-sm">{task.title}</span>
    </div>
  )
}

export function GoalDragAndDrop({ goal }: { goal: Goal }) {
  const [expandedSubGoals, setExpandedSubGoals] = useState<Record<string, boolean>>({})
  const [newSubGoalTitle, setNewSubGoalTitle] = useState('')
  const [newTaskTitles, setNewTaskTitles] = useState<Record<string, string>>({})

  const subGoals = goal.subGoals
  const addSubGoal = useGoalStore.use.addSubGoal()
  const addTask = useGoalStore.use.addTask()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 处理子目标拖拽结束
  const handleSubGoalDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // TODO: 需要在 store 中添加 reorderSubGoals 方法
      // 这里暂时只做 UI 层面的重新排序
      console.log('Dragged', active.id, 'to', over.id)
    }
  }

  const handleAddSubGoal = () => {
    if (newSubGoalTitle.trim()) {
      addSubGoal(goal.id, {
        title: newSubGoalTitle.trim(),
      })
      setNewSubGoalTitle('')
    }
  }

  const handleAddTask = (subGoalId: string) => {
    const title = newTaskTitles[subGoalId]
    if (title?.trim()) {
      addTask(goal.id, subGoalId, {
        title: title.trim(),
        status: 'todo',
        priority: 'p2',
        actions: [],
      })
      setNewTaskTitles(prev => ({ ...prev, [subGoalId]: '' }))
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">拖拽排序</CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSubGoalDragEnd}
          >
            <SortableContext
              items={subGoals.map(sg => sg.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {subGoals.map(subGoal => (
                  <div key={subGoal.id}>
                    <SortableSubGoal
                      subGoal={subGoal}
                      expanded={!!expandedSubGoals[subGoal.id]}
                      onToggle={() => {
                        setExpandedSubGoals(prev => ({
                          ...prev,
                          [subGoal.id]: !prev[subGoal.id],
                        }))
                      }}
                    />
                    {expandedSubGoals[subGoal.id] && (
                      <div className="ml-8 mt-2 space-y-2">
                        {/* 任务列表 */}
                        <SortableContext
                          items={subGoal.tasks.map(t => t.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {subGoal.tasks.map(task => (
                              <SortableTask key={task.id} task={task} />
                            ))}
                          </div>
                        </SortableContext>

                        {/* 添加任务 */}
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={newTaskTitles[subGoal.id] || ''}
                            onChange={(e) => setNewTaskTitles(prev => ({
                              ...prev,
                              [subGoal.id]: e.target.value,
                            }))}
                            placeholder="添加任务..."
                            className="flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask(subGoal.id)}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddTask(subGoal.id)}
                            icon={Plus}
                          >
                            添加
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* 添加子目标 */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Input
              value={newSubGoalTitle}
              onChange={(e) => setNewSubGoalTitle(e.target.value)}
              placeholder="添加新的子目标..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubGoal()}
            />
            <Button size="sm" onClick={handleAddSubGoal} icon={Plus}>
              添加子目标
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        💡 提示：拖拽左侧手柄可以调整顺序
      </div>
    </div>
  )
}
