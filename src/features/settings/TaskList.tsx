import { useState } from 'react'
import { useStore, ActivityType, Task } from '../../store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, CheckCircle, Eye, Trash2, Briefcase, Gamepad2, Edit, Repeat } from 'lucide-react'
import TaskCreationModal from './TaskCreationModal'
import TaskDetailModal from './TaskDetailModal'
import { toast } from '@/components/ui/toast'

const TaskList = () => {
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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">活动列表</h3>
        <Button onClick={() => { setEditingTask(null); setIsModalOpen(true) }} className="bg-[#0071e3] hover:bg-[#0077ed] rounded-xl h-9 px-4 text-sm font-medium shadow-[0_2px_6px_rgba(0,113,227,0.2)] transition-all duration-200">
          <Plus className="w-4 h-4 mr-1.5" />
          新建活动
        </Button>
      </div>

      {/* 类型筛选 */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filterType === 'all'
              ? 'bg-black/10 text-gray-900 dark:bg-white/10 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c2c2e]'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilterType('task')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filterType === 'task'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c2c2e]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          任务
        </button>
        <button
          onClick={() => setFilterType('entertainment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filterType === 'entertainment'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c2c2e]'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          娱乐
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-base">暂无活动，点击上方按钮创建第一个活动</p>
        </div>
      ) : activeTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-base">没有符合筛选条件的活动</p>
        </div>
      ) : (
        <>
          {/* 进行中的活动 */}
          {activeTasks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3 px-1">进行中</h4>
              <div className="space-y-2">
                {activeTasks.map(task => {
                  const completedSubtasks = task.subtasks.filter(st => st.completed).length
                  const totalSubtasks = task.subtasks.length
                  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

                  return (
                    <Card
                      key={task.id}
                      className="transition-all duration-200 hover:shadow-md border-gray-200 dark:border-gray-700 dark:bg-[#2c2c2e] rounded-xl"
                    >
                      <CardContent className="pt-4 pb-4 px-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {task.type === 'task' ? (
                                <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              ) : (
                                <Gamepad2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              )}
                              <h5 className="font-medium text-base text-gray-900 dark:text-gray-100">{task.title}</h5>
                              <Badge variant="blue" className={`${
                                task.type === 'task'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0'
                                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0'
                              } text-xs font-medium px-2 py-0.5`}>
                                {task.type === 'task' ? '任务' : '娱乐'}
                              </Badge>
                              {task.isRecurring && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs font-medium px-2 py-0.5 flex items-center gap-1">
                                  <Repeat className="w-3 h-3" />
                                  循环
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                            )}
                            {totalSubtasks > 0 && (
                              <div>
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                  <span>子活动进度</span>
                                  <span>{completedSubtasks}/{totalSubtasks}</span>
                                </div>
                                <Progress value={progress} className="h-1.5 bg-gray-200 dark:bg-gray-700" />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditTask(task)
                              }}
                              title="编辑活动"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCompleteTask(task.id)
                              }}
                              title={task.isRecurring ? '重置任务' : '完成活动'}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewingTask(task.id)
                              }}
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTask(task.id)
                              }}
                              title="删除活动"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* 已完成的活动 */}
          {completedTasks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3 px-1">已完成</h4>
              <div className="space-y-2 opacity-60">
                {completedTasks.map(task => (
                  <Card key={task.id} className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-[#2c2c2e]">
                    <CardContent className="pt-4 pb-4 px-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {task.type === 'task' ? (
                              <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            ) : (
                              <Gamepad2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            )}
                            <h5 className="font-medium line-through text-gray-500 dark:text-gray-400">{task.title}</h5>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 活动创建/编辑模态框 */}
      <TaskCreationModal
        open={isModalOpen}
        onClose={handleModalClose}
        initialTask={editingTask}
      />

      {/* 活动详情模态框 */}
      <TaskDetailModal
        taskId={viewingTask}
        onClose={() => setViewingTask(null)}
      />
    </div>
  )
}

export default TaskList
