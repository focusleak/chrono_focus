import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/segmented'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useTaskStore, type Task, type TaskStatus, type TaskPriority, type TaskViewMode } from '@/store/taskStore'

import {
  Plus,
  Search,
  X,
  List,
  Columns,
  Calendar,
  Clock,
  Flag,
  CheckCircle2,
  Circle,
  Timer,
  XCircle,
  Trash2,
} from 'lucide-react'
import { TaskQuickAdd } from './TaskQuickAdd'

function TaskCard({ task }: { task: Task }) {
  const toggleTaskStatus = useTaskStore.use.toggleTaskStatus()
  const deleteTask = useTaskStore.use.deleteTask()
  const setSelectedTask = useTaskStore.use.setSelectedTask()

  const priorityColors = {
    p0: 'text-red-500',
    p1: 'text-orange-500',
    p2: 'text-blue-500',
    p3: 'text-gray-400',
  }

  const statusIcons = {
    todo: <Circle className="w-5 h-5" />,
    in_progress: <Timer className="w-5 h-5 text-blue-500" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    cancelled: <XCircle className="w-5 h-5 text-gray-500" />,
  }

  const daysLeft = task.dueDate
    ? Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => setSelectedTask(task.id)}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              const nextStatus = task.status === 'todo' ? 'in_progress' :
                                task.status === 'in_progress' ? 'completed' : 'todo'
              toggleTaskStatus(task.id, nextStatus)
            }}
            className="mt-0.5"
          >
            {statusIcons[task.status]}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteTask(task.id)
                  }}
                  className="p-1 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Flag className={`w-3 h-3 ${priorityColors[task.priority]}`} />
              <Badge variant="outline" className="text-xs">
                {task.priority.toUpperCase()}
              </Badge>

              {task.dueDate && (
                <span className={`text-xs flex items-center gap-1 ${
                  daysLeft !== null && daysLeft <= 0 ? 'text-red-500' :
                  daysLeft !== null && daysLeft <= 3 ? 'text-orange-500' : 'text-muted-foreground'
                }`}>
                  <Calendar className="w-3 h-3" />
                  {daysLeft !== null ? (daysLeft > 0 ? `${daysLeft}天` : daysLeft === 0 ? '今天' : '已过期') : ''}
                </span>
              )}

              {task.estimatedHours && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.estimatedHours}h
                </span>
              )}

              {task.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function KanbanColumn({ title, tasks, count }: {
  title: string
  tasks: Task[]
  count: number
}) {
  return (
    <div className="flex-1 min-w-[280px] bg-muted/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center gap-2">
          {title}
          <Badge variant="outline" className="text-xs">{count}</Badge>
        </h3>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          暂无任务
        </div>
      )}
    </div>
  )
}

export function TasksPage() {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const viewMode = useTaskStore.use.viewMode()
  const setViewMode = useTaskStore.use.setViewMode()
  const filters = useTaskStore.use.filters()
  const setFilters = useTaskStore.use.setFilters()
  const resetFilters = useTaskStore.use.resetFilters()
  const tasks = useTaskStore.use.tasks()

  // 手动实现筛选逻辑
  const filteredTasks = tasks.filter(task => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (
        !task.title.toLowerCase().includes(searchLower) &&
        !task.description?.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }
    if (filters.status !== 'all' && task.status !== filters.status) return false
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false
    if (filters.tag !== 'all' && (!task.tags || !task.tags.includes(filters.tag))) return false
    if (filters.hasDueDate === true && !task.dueDate) return false
    return true
  }).sort((a, b) => a.order - b.order)

  const tasksByStatus = {
    todo: filteredTasks.filter((t: Task) => t.status === 'todo'),
    in_progress: filteredTasks.filter((t: Task) => t.status === 'in_progress'),
    completed: filteredTasks.filter((t: Task) => t.status === 'completed'),
    cancelled: filteredTasks.filter((t: Task) => t.status === 'cancelled'),
  }

  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || [])))

  return (
    <div className="max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">任务管理</h1>
          <p className="text-muted-foreground mt-1">
            高效管理和追踪你的所有任务
          </p>
        </div>
        <Button onClick={() => setShowQuickAdd(true)} icon={Plus}>
          快速添加
        </Button>
      </div>

      {/* 视图切换和筛选器 */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as TaskViewMode)}
            options={[
              { label: '列表视图', value: 'list', icon: List },
              { label: '看板视图', value: 'kanban', icon: Columns },
            ]}
          />
        </div>

        {/* 筛选器 */}
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  placeholder="搜索任务..."
                  className="pl-10 pr-10"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters({ search: '' })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 筛选条件 */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">状态</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ status: value as TaskStatus | 'all' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="todo">待办</SelectItem>
                      <SelectItem value="in_progress">进行中</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="cancelled">已取消</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">优先级</label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => setFilters({ priority: value as TaskPriority | 'all' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部优先级</SelectItem>
                      <SelectItem value="p0">P0 - 紧急重要</SelectItem>
                      <SelectItem value="p1">P1 - 重要</SelectItem>
                      <SelectItem value="p2">P2 - 一般</SelectItem>
                      <SelectItem value="p3">P3 - 低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">标签</label>
                  <Select
                    value={filters.tag}
                    onValueChange={(value) => setFilters({ tag: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部标签</SelectItem>
                      {allTags.map((tag: string) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">截止日期</label>
                  <Select
                    value={filters.hasDueDate === 'all' ? 'all' : filters.hasDueDate ? 'yes' : 'no'}
                    onValueChange={(value) => setFilters({
                      hasDueDate: value === 'all' ? 'all' : value === 'yes',
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="yes">有截止日期</SelectItem>
                      <SelectItem value="no">无截止日期</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 清除筛选 */}
              {(filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.tag !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-sm"
                >
                  清除所有筛选条件
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 任务统计 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{tasksByStatus.todo.length}</div>
            <p className="text-xs text-muted-foreground">待办</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-500">{tasksByStatus.in_progress.length}</div>
            <p className="text-xs text-muted-foreground">进行中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{tasksByStatus.completed.length}</div>
            <p className="text-xs text-muted-foreground">已完成</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{filteredTasks.length}</div>
            <p className="text-xs text-muted-foreground">筛选结果</p>
          </CardContent>
        </Card>
      </div>

      {/* 任务列表/看板 */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {filteredTasks.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <List className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">暂无任务</h3>
                <p className="text-muted-foreground mb-6">
                  点击"快速添加"创建你的第一个任务
                </p>
                <Button onClick={() => setShowQuickAdd(true)} icon={Plus}>
                  快速添加
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn
            title="待办"
            tasks={tasksByStatus.todo}
            count={tasksByStatus.todo.length}
          />
          <KanbanColumn
            title="进行中"
            tasks={tasksByStatus.in_progress}
            count={tasksByStatus.in_progress.length}
          />
          <KanbanColumn
            title="已完成"
            tasks={tasksByStatus.completed}
            count={tasksByStatus.completed.length}
          />
          <KanbanColumn
            title="已取消"
            tasks={tasksByStatus.cancelled}
            count={tasksByStatus.cancelled.length}
          />
        </div>
      )}

      {/* 快速添加弹窗 */}
      {showQuickAdd && (
        <TaskQuickAdd onClose={() => setShowQuickAdd(false)} />
      )}
    </div>
  )
}
