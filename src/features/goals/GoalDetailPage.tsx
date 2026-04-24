import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Segmented } from '@/components/ui/segmented'

import { useGoalStore } from '@/store/goalStore'

import type { SubGoal, PlanTask, Action } from '@/types'

import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  ListTree,
  List,
} from 'lucide-react'
import { GoalEditForm } from './GoalEditForm'
import { GoalDragAndDrop } from './GoalDragAndDrop'

function ActionItem({
  goalId,
  subGoalId,
  taskId,
  action,
}: {
  goalId: string
  subGoalId: string
  taskId: string
  action: Action
}) {
  const toggleAction = useGoalStore.use.toggleAction()
  const deleteAction = useGoalStore.use.deleteAction()

  return (
    <div className="flex items-center gap-2 py-2">
      <Checkbox
        checked={action.completed}
        onCheckedChange={() => toggleAction(goalId, subGoalId, taskId, action.id)}
      />
      <span className={`flex-1 text-sm ${action.completed ? 'line-through text-muted-foreground' : ''}`}>
        {action.title}
      </span>
      <button
        onClick={() => deleteAction(goalId, subGoalId, taskId, action.id)}
        className="text-muted-foreground hover:text-red-500"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

function TaskItem({
  goalId,
  subGoalId,
  task,
}: {
  goalId: string
  subGoalId: string
  task: PlanTask
}) {
  const [expanded, setExpanded] = useState(false)
  const [newActionTitle, setNewActionTitle] = useState('')
  const addAction = useGoalStore.use.addAction()
  const deleteTask = useGoalStore.use.deleteTask()

  const handleAddAction = () => {
    if (newActionTitle.trim()) {
      addAction(goalId, subGoalId, task.id, {
        title: newActionTitle.trim(),
        completed: false,
      })
      setNewActionTitle('')
    }
  }

  const statusIcons = {
    todo: <Circle className="w-5 h-5" />,
    in_progress: <Clock className="w-5 h-5 text-blue-500" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    cancelled: <XCircle className="w-5 h-5 text-gray-500" />,
  }

  return (
    <Card className="mt-3">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {statusIcons[task.status]}
          <CardTitle className="text-base flex-1">{task.title}</CardTitle>
          <Badge
            variant={
              task.status === 'completed'
                ? 'default'
                : task.status === 'in_progress'
                ? 'secondary'
                : 'outline'
            }
            className="text-xs"
          >
            {task.status === 'todo' ? '待办' :
             task.status === 'in_progress' ? '进行中' :
             task.status === 'completed' ? '已完成' : '已取消'}
          </Badge>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <button
            onClick={() => deleteTask(goalId, subGoalId, task.id)}
            className="text-muted-foreground hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {task.description && (
          <CardDescription className="mt-1">{task.description}</CardDescription>
        )}
      </CardHeader>
      {expanded && (
        <CardContent>
          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">任务进度</span>
              <span className="font-medium">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>

          {/* 行动项列表 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">行动项</h4>
            {task.actions.map((action) => (
              <ActionItem
                key={action.id}
                goalId={goalId}
                subGoalId={subGoalId}
                taskId={task.id}
                action={action}
              />
            ))}

            {/* 添加行动项 */}
            <div className="flex gap-2 mt-2">
              <Input
                value={newActionTitle}
                onChange={(e) => setNewActionTitle(e.target.value)}
                placeholder="添加新的行动项..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddAction()}
              />
              <Button size="sm" onClick={handleAddAction} icon={Plus}>
                添加
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function SubGoalSection({
  goalId,
  subGoal,
}: {
  goalId: string
  subGoal: SubGoal
}) {
  const [expanded, setExpanded] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const deleteSubGoal = useGoalStore.use.deleteSubGoal()
  const addTask = useGoalStore.use.addTask()

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(goalId, subGoal.id, {
        title: newTaskTitle.trim(),
        status: 'todo',
        priority: 'p2',
        actions: [],
      })
      setNewTaskTitle('')
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <div className="flex-1">
              <CardTitle className="text-lg">{subGoal.title}</CardTitle>
              {subGoal.description && (
                <CardDescription className="mt-1">{subGoal.description}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{subGoal.progress}%</p>
              <p className="text-xs text-muted-foreground">
                {subGoal.tasks.filter(t => t.status === 'completed').length}/{subGoal.tasks.length} 任务
              </p>
            </div>
            <Progress value={subGoal.progress} className="w-24 h-2" />
            <button
              onClick={() => deleteSubGoal(goalId, subGoal.id)}
              className="text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          {/* 任务列表 */}
          {subGoal.tasks.map((task) => (
            <TaskItem
              key={task.id}
              goalId={goalId}
              subGoalId={subGoal.id}
              task={task}
            />
          ))}

          {/* 添加任务 */}
          <div className="flex gap-2 mt-4">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="添加新的任务..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button size="sm" onClick={handleAddTask} icon={Plus}>
              添加任务
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function GoalDetailPage({ goalId, onBack }: { goalId: string; onBack: () => void }) {
  const [newSubGoalTitle, setNewSubGoalTitle] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [detailViewMode, setDetailViewMode] = useState<'tree' | 'drag'>('tree')
  const goal = useGoalStore.use.goals().find(g => g.id === goalId)
  const addSubGoal = useGoalStore.use.addSubGoal()
  const recalculateGoalProgress = useGoalStore.use.recalculateGoalProgress()

  if (!goal) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">目标不存在</p>
        <Button onClick={onBack} className="mt-4">
          返回列表
        </Button>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4" icon={ArrowLeft}>
          返回目标列表
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>编辑目标</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalEditForm
              goal={goal}
              onSave={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAddSubGoal = () => {
    if (newSubGoalTitle.trim()) {
      addSubGoal(goal.id, {
        title: newSubGoalTitle.trim(),
      })
      setNewSubGoalTitle('')
      recalculateGoalProgress(goal.id)
    }
  }

  const daysLeft = Math.ceil(
    (new Date(goal.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={onBack} className="mb-4" icon={ArrowLeft}>
        返回目标列表
      </Button>

      {/* 目标信息 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{goal.title}</CardTitle>
              <CardDescription>{goal.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={
                  goal.status === 'completed'
                    ? 'default'
                    : goal.status === 'active'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {goal.status === 'active' ? '进行中' :
                 goal.status === 'completed' ? '已完成' :
                 goal.status === 'cancelled' ? '已取消' : '已暂停'}
              </Badge>
              <Badge>{goal.priority.toUpperCase()}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                icon={Edit}
              >
                编辑
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 总体进度 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">总体进度</span>
              <span className="text-lg font-bold">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-3" />
          </div>

          {/* 指标信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">衡量指标</p>
              <p className="text-lg font-medium">
                {goal.metric.type === 'boolean'
                  ? '是否完成'
                  : `${goal.metric.current}/${goal.metric.target}${goal.metric.unit || ''}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">难度</p>
              <p className="text-lg font-medium">{goal.difficulty}/5</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">剩余时间</p>
              <p className={`text-lg font-medium ${daysLeft <= 7 ? 'text-orange-500' : ''}`}>
                {daysLeft > 0 ? `${daysLeft} 天` : '已过期'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SMART 评分</p>
              <p className="text-lg font-medium">{goal.smartScore?.total || '-'}/100</p>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="text-sm text-muted-foreground">
            <Target className="w-4 h-4 inline mr-2" />
            {goal.startDate} 至 {goal.dueDate}
          </div>
        </CardContent>
      </Card>

      {/* 子目标列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>子目标和任务</CardTitle>
              <CardDescription>将大目标拆解为可执行的子目标和任务</CardDescription>
            </div>
            <Segmented
              value={detailViewMode}
              onChange={(value) => setDetailViewMode(value as 'tree' | 'drag')}
              options={[
                { label: '树形视图', value: 'tree', icon: List },
                { label: '拖拽排序', value: 'drag', icon: ListTree },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          {detailViewMode === 'drag' ? (
            <GoalDragAndDrop goal={goal} />
          ) : (
            <>
              {goal.subGoals.map((subGoal) => (
                <SubGoalSection
                  key={subGoal.id}
                  goalId={goal.id}
                  subGoal={subGoal}
                />
              ))}

              {/* 添加子目标 */}
              <div className="flex gap-2 mt-6 pt-6 border-t">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
