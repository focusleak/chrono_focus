import { CheckCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/toast'

import { useRuntimeStore } from '@/store/runtimeStore'

import type { Task, SubTask } from '@/types'

interface TaskDetailModalProps {
  taskId: string | null
  onClose: () => void
}

const TaskDetailModal = ({ taskId, onClose }: TaskDetailModalProps) => {
  const tasks = useRuntimeStore.use.tasks()
  const toggleSubtask = useRuntimeStore.use.toggleSubtask()
  const completeTask = useRuntimeStore.use.completeTask()

  const task = tasks.find((t: Task) => t.id === taskId)

  if (!task) return null

  const completedSubtasks = task.subtasks.filter((st: SubTask) => st.completed).length
  const totalSubtasks = task.subtasks.length
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  const handleCompleteTask = () => {
    completeTask(task.id)
    toast.success('任务已完成！')
    onClose()
  }

  return (
    <Dialog open={!!taskId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>任务详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{task.title}</h3>
            {task.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{task.description}</p>
            )}

            <div className="flex gap-2 mb-4">
              <Badge variant="blue">{task.completedPomodoros} 个番茄钟</Badge>
              {task.isCompleted && <Badge variant="green">已完成</Badge>}
            </div>
          </div>

          {totalSubtasks > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">子任务进度</h4>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="space-y-2">
            {task.subtasks.map((subtask: SubTask) => (
              <div
                key={subtask.id}
                className={`p-3 rounded-xl transition-all ${
                  subtask.completed
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-[#2c2c2e] hover:bg-gray-100 dark:hover:bg-[#3a3a3c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                    className="data-[state=checked]:bg-[#34c759] data-[state=checked]:border-[#34c759]"
                  />
                  <span className={subtask.completed ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}>
                    {subtask.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!task.isCompleted && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleCompleteTask}
                className="w-full rounded-xl bg-[#34c759] hover:bg-[#30b350]"
                size="lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                标记任务为已完成
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDetailModal
