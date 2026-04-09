import { useState, useEffect } from 'react'
import { Plus, Trash2, Lightbulb, Briefcase, Gamepad2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'

import { useRuntimeStore } from '@/store/runtimeStore'

import type { SubTask, ActivityType, Task } from '@/types'

interface TaskCreationModalProps {
  open: boolean
  onClose: () => void
  initialTask?: Task | null
}

const TaskCreationModal = ({ open, onClose, initialTask }: TaskCreationModalProps) => {
  const addTask = useRuntimeStore.use.addTask()
  const updateTask = useRuntimeStore.use.updateTask()
  const isEditMode = !!initialTask

  const [currentStep, setCurrentStep] = useState<'basic' | 'subtasks'>('basic')
  const [subtasks, setSubtasks] = useState<SubTask[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [activityType, setActivityType] = useState<ActivityType>('task')
  const [isRecurring, setIsRecurring] = useState(false)
  const [isSimple, setIsSimple] = useState(false)

  // Initialize form when modal opens or task changes
  useEffect(() => {
    if (open) {
      if (initialTask) {
        setTaskTitle(initialTask.title)
        setTaskDescription(initialTask.description || '')
        setActivityType(initialTask.type)
        setSubtasks(initialTask.subtasks || [])
        setIsRecurring(initialTask.isRecurring || false)
        setIsSimple(initialTask.isSimple || false)
      } else {
        setTaskTitle('')
        setTaskDescription('')
        setActivityType('task')
        setSubtasks([])
        setIsRecurring(false)
        setIsSimple(false)
      }
      setCurrentStep('basic')
      setNewSubtask('')
    }
  }, [open, initialTask])

  const handleNext = () => {
    if (!taskTitle.trim()) {
      toast.error('请填写活动名称')
      return
    }
    // 无需分解的任务，直接跳过
    if (isSimple) {
      handleSubmit()
      return
    }
    setCurrentStep('subtasks')
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: Date.now().toString(),
          title: newSubtask.trim(),
          completed: false
        }
      ])
      setNewSubtask('')
    }
  }

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id))
  }

  const handleSubmit = () => {
    if (!taskTitle.trim()) {
      toast.error('请填写活动名称')
      return
    }

    if (isEditMode && initialTask) {
      updateTask(initialTask.id, {
        title: taskTitle,
        description: taskDescription,
        type: activityType,
        subtasks: subtasks,
        isRecurring,
        isSimple,
      })
      toast.success('活动已更新')
    } else {
      addTask({
        title: taskTitle,
        description: taskDescription,
        type: activityType,
        subtasks: subtasks,
        isRecurring,
        isSimple,
      })
      toast.success('活动创建成功')
    }

    setTaskTitle('')
    setTaskDescription('')
    setSubtasks([])
    setCurrentStep('basic')
    setIsRecurring(false)
    setIsSimple(false)
    onClose()
  }

  const handleCancel = () => {
    setTaskTitle('')
    setTaskDescription('')
    setSubtasks([])
    setCurrentStep('basic')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'basic' ? (isEditMode ? '编辑活动' : '创建新活动') : (isEditMode ? '编辑子活动' : '活动分解')}
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'basic' ? (
          <div className="space-y-4">
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                选择一个活动类型，任务应该有明确的目标，娱乐项目用于休闲放松。
              </AlertDescription>
            </Alert>

            {/* 活动类型选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">活动类型 *</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActivityType('task')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
                    activityType === 'task'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2c2c2e]'
                  )}
                >
                  <Briefcase className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">任务</div>
                    <div className="text-xs opacity-70">工作学习目标</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActivityType('entertainment')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
                    activityType === 'entertainment'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2c2c2e]'
                  )}
                >
                  <Gamepad2 className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">娱乐项目</div>
                    <div className="text-xs opacity-70">休闲放松</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">活动名称 *</label>
              <Input
                placeholder={activityType === 'task' ? '例如：完成项目报告' : '例如：看一部电影'}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="dark:bg-[#3a3a3c] dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">活动描述（可选）</label>
              <Textarea
                placeholder={activityType === 'task' ? '简要描述任务内容和目标' : '描述娱乐活动内容'}
                rows={3}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="dark:bg-[#3a3a3c] dark:border-gray-600"
              />
            </div>

            {/* 任务选项 */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">循环任务</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">完成后自动重置，重新开始</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSimple}
                  onChange={(e) => setIsSimple(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">无需分解</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">简单任务，不需要子任务分解</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>取消</Button>
              <Button onClick={handleNext}>下一步：活动分解 →</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert variant="success">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                将大活动拆分成小的可执行的子活动，每完成一个子活动都会让你离目标更近一步。
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-medium mb-2">{activityType === 'task' ? '任务' : '娱乐项目'}：{taskTitle}</h4>

              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="输入子活动，例如：收集资料"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <Button onClick={handleAddSubtask} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {subtasks.length > 0 ? (
                <div className="space-y-2">
                  {subtasks.map((st, index) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#2c2c2e] rounded-xl hover:bg-gray-100 dark:hover:bg-[#3a3a3c] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-500 text-sm">{index + 1}.</span>
                        <span className="text-gray-900 dark:text-gray-100">{st.title}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveSubtask(st.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-500">
                  <p>还没有添加子活动</p>
                  <p className="text-sm mt-2">你可以将大活动拆分成多个小步骤</p>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('basic')}>
                ← 上一步
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSubmit}>
                  {isEditMode ? '保存修改' : '跳过，直接创建'}
                </Button>
                {!isEditMode && (
                  <Button
                    onClick={handleSubmit}
                    disabled={subtasks.length === 0}
                  >
                    创建活动 ({subtasks.length} 个子活动)
                  </Button>
                )}
                {isEditMode && (
                  <Button onClick={handleSubmit}>
                    保存修改 ({subtasks.length} 个子活动)
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TaskCreationModal
