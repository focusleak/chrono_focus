import { useState } from 'react'
import { useStore, ActivityType, Task } from '../../store/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, CheckCircle, Trash2, Briefcase, Gamepad2, Edit, Repeat } from 'lucide-react'
import TaskCreationModal from './TaskCreationModal'
import TaskDetailModal from './TaskDetailModal'
import { toast } from '@/components/ui/toast'

const ActivitiesPage = () => {
  const { tasks = [], completeTask, deleteTask } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewingTask, setViewingTask] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all')

  const activeTasks = tasks.filter(t => !t.isCompleted && (filterType === 'all' || t.type === filterType))
  const completedTasks = tasks.filter(t => t.isCompleted && (filterType === 'all' || t.type === filterType))

  const handleCompleteTask = (id: string) => {
    completeTask(id)
    toast.success('活动已完成！')
  }

  const handleDeleteTask = (id: string) => {
    deleteTask(id)
    toast.info('活动已删除')
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  return (
    <div>
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-sm">
        {/* 筛选按钮 */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterType === 'all'
                ? 'bg-black/10 text-gray-900 dark:bg-white/10 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e]'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterType('task')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterType === 'task'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            任务
          </button>
          <button
            onClick={() => setFilterType('entertainment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterType === 'entertainment'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            娱乐
          </button>

          <div className="flex-1" />

          <Button
            onClick={() => { setEditingTask(null); setIsModalOpen(true) }}
            className="bg-[#0071e3] hover:bg-[#0077ed] rounded-lg h-8 px-3 text-sm font-medium shadow-[0_2px_6px_rgba(0,113,227,0.2)] transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            新建活动
          </Button>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">

          {/* 进行中的活动 */}
          {activeTasks.length > 0 && (
            <div className="p-6">
              <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">
                进行中 ({activeTasks.length})
              </h3>
              <div className="space-y-4">
                {activeTasks.map(task => {
                  const completedSubtasks = task.subtasks.filter(st => st.completed).length
                  const totalSubtasks = task.subtasks.length
                  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {task.type === 'task' ? (
                              <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            ) : (
                              <Gamepad2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            )}
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{task.title}</h4>
                            <Badge className={`${
                              task.type === 'task'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            } text-xs font-medium px-2 py-0.5 border-0`}>
                              {task.type === 'task' ? '任务' : '娱乐'}
                            </Badge>
                            {task.isRecurring && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium px-2 py-0.5 border-0 flex items-center gap-1">
                                <Repeat className="w-3 h-3" />
                                循环
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                          )}
                          {totalSubtasks > 0 && (
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <span>子活动进度</span>
                                <span>{completedSubtasks}/{totalSubtasks}</span>
                              </div>
                              <Progress value={progress} className="h-1 bg-gray-200 dark:bg-gray-700" />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-4 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTask(task)}
                            className="h-8 w-8 p-0"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCompleteTask(task.id)}
                            className="h-8 w-8 p-0"
                            title={task.isRecurring ? '重置' : '完成'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingTask(task.id)}
                            className="h-8 w-8 p-0"
                            title="详情"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 16v-4" />
                              <path d="M12 8h.01" />
                            </svg>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTask(task.id)}
                            className="h-8 w-8 p-0"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 已完成的活动 */}
          {completedTasks.length > 0 && (
            <div className="p-6">
              <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">
                已完成 ({completedTasks.length})
              </h3>
              <div className="space-y-3 opacity-60">
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {task.type === 'task' ? (
                        <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      ) : (
                        <Gamepad2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      )}
                      <span className="text-sm line-through text-gray-500 dark:text-gray-400 truncate">{task.title}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTask(task.id)}
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {tasks.length === 0 && (
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">暂无活动，点击上方按钮创建第一个活动</p>
              </div>
            </div>
          )}

          {tasks.length > 0 && activeTasks.length === 0 && completedTasks.length === 0 && (
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">没有符合筛选条件的活动</p>
              </div>
            </div>
          )}

          {/* 模态框 */}
          <TaskCreationModal
            open={isModalOpen}
            onClose={handleModalClose}
            initialTask={editingTask}
          />

          <TaskDetailModal
            taskId={viewingTask}
            onClose={() => setViewingTask(null)}
          />
        </div>
      </div>
    </div>
  )
}

export default ActivitiesPage
