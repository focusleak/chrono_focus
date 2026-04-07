import { useState } from 'react'
import { useStore } from '../../store/store'
import type { ActivityType, Task } from '../../types'
import { Button } from '@/components/ui/button'
import { Plus, Briefcase, Gamepad2, Trash2 } from 'lucide-react'
import TaskCreationModal from './TaskCreationModal'
import TaskDetailModal from './TaskDetailModal'
import TaskCard from './TaskCard'
import FilterButton from './FilterButton'
import { SortableList, type SortableItemProps } from '../../components/SortableList'
import { toast } from '@/components/ui/toast'

const ActivitiesPage = () => {
  const { tasks = [], completeTask, deleteTask, reorderTasks } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewingTask, setViewingTask] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all')

  const sortedTasks = [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const activeTasks = sortedTasks.filter(t => !t.isCompleted && (filterType === 'all' || t.type === filterType))
  const completedTasks = sortedTasks.filter(t => t.isCompleted && (filterType === 'all' || t.type === filterType))

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
        {/* 筛选和新建按钮 */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
          <FilterButton label="全部" type="all" activeType={filterType} onClick={setFilterType} />
          <FilterButton label="任务" type="task" activeType={filterType} onClick={setFilterType} icon={Briefcase} />
          <FilterButton label="娱乐" type="entertainment" activeType={filterType} onClick={setFilterType} icon={Gamepad2} />

          <div className="flex-1" />

          <Button
            onClick={() => { setEditingTask(null); setIsModalOpen(true) }}
            className="bg-[#0071e3] hover:bg-[#0077ed] rounded-lg h-8 px-3 text-sm font-medium shadow-[0_2px_6px_rgba(0,113,227,0.2)] transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-1.5" /> 新建活动
          </Button>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* 进行中的活动 */}
          {activeTasks.length > 0 && (
            <div className="p-6">
              <SortableList
                items={activeTasks}
                onReorder={reorderTasks}
                renderItem={({ item, drag }: SortableItemProps<Task>) => (
                  <TaskCard
                    task={item}
                    drag={drag}
                    onEdit={handleEditTask}
                    onComplete={handleCompleteTask}
                    onView={setViewingTask}
                    onDelete={handleDeleteTask}
                  />
                )}
              />
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
                      {task.type === 'task'
                        ? <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        : <Gamepad2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      }
                      <span className="text-sm line-through text-gray-500 dark:text-gray-400 truncate">
                        {task.title}
                      </span>
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
        </div>

        <TaskCreationModal open={isModalOpen} onClose={handleModalClose} initialTask={editingTask} />
        <TaskDetailModal taskId={viewingTask} onClose={() => setViewingTask(null)} />
      </div>
    </div>
  )
}

export default ActivitiesPage
