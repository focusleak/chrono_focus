import { GripVertical, Briefcase, Gamepad2, Edit, Trash2, CheckCircle, Repeat } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  drag: {
    isDragging: boolean
    dragHandleAttributes: Record<string, any>
    dragHandleListeners: Record<string, any>
  }
  onEdit: (task: Task) => void
  onComplete: (id: string) => void
  onView: (id: string) => void
  onDelete: (id: string) => void
}

const TaskCard = ({ task, drag, onEdit, onComplete, onView, onDelete }: TaskCardProps) => {
  const completedSubtasks = task.subtasks.filter(st => st.completed).length
  const totalSubtasks = task.subtasks.length
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  return (
    <div className={`p-4 rounded-xl bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700 transition-opacity ${drag.isDragging ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div
              {...drag.dragHandleAttributes}
              {...drag.dragHandleListeners}
              className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <GripVertical className="w-4 h-4" />
            </div>
            {task.type === 'task' ? (
              <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0" />
            ) : (
              <Gamepad2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
            )}
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{task.title}</h4>
            <Badge className={`${task.type === 'task' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'} text-xs font-medium px-2 py-0.5 border-0`}>
              {task.type === 'task' ? '任务' : '娱乐'}
            </Badge>
            {task.isRecurring && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium px-2 py-0.5 border-0 flex items-center gap-1">
                <Repeat className="w-3 h-3" /> 循环
              </Badge>
            )}
          </div>
          {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>}
          {totalSubtasks > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>子活动进度</span><span>{completedSubtasks}/{totalSubtasks}</span>
              </div>
              <Progress value={progress} className="h-1 bg-gray-200 dark:bg-gray-700" />
            </div>
          )}
        </div>
        <div className="flex gap-1 ml-2 flex-shrink-0">
          <Button size="sm" variant="ghost" onClick={() => onEdit(task)} className="h-8 w-8 p-0" title="编辑">
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onComplete(task.id)} className="h-8 w-8 p-0" title={task.isRecurring ? '重置' : '完成'}>
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onView(task.id)} className="h-8 w-8 p-0" title="详情">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(task.id)} className="h-8 w-8 p-0" title="删除">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
