import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Segmented } from '@/components/ui/segmented'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useGoalStore } from '@/store/goalStore'

import type { Goal, GoalStatus, GoalPriority } from '@/types'

import { Plus, Target, ChevronRight, Calendar, TrendingUp, AlertCircle, LayoutGrid, List, Search, X } from 'lucide-react'
import { GoalCreateForm } from './GoalCreateForm'
import { GoalDetailPage } from './GoalDetailPage'
import { GoalTemplateSelector } from './GoalTemplateSelector'
import { OKRView } from './OKRView'

type ViewMode = 'tree' | 'okr'
type PageMode = 'list' | 'create' | 'template' | 'detail'

interface FilterState {
  search: string
  status: GoalStatus | 'all'
  priority: GoalPriority | 'all'
  tag: string | 'all'
}

function GoalCard({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  const daysLeft = Math.ceil(
    (new Date(goal.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const statusColors = {
    active: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-gray-500',
    paused: 'bg-yellow-500',
  }

  const priorityColors = {
    p0: 'bg-red-500',
    p1: 'bg-orange-500',
    p2: 'bg-blue-500',
    p3: 'bg-gray-400',
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${statusColors[goal.status]}`} />
              <CardTitle className="text-lg">{goal.title}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">
              {goal.description}
            </CardDescription>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* 进度条 */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">进度</span>
              <span className="font-medium">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>

          {/* 指标和标签 */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              {goal.metric.type === 'boolean'
                ? '是否完成'
                : `${goal.metric.current}/${goal.metric.target}${goal.metric.unit || ''}`}
            </Badge>
            <Badge className={`text-xs ${priorityColors[goal.priority]}`}>
              {goal.priority.toUpperCase()}
            </Badge>
            {goal.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* 时间信息 */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {goal.startDate} 至 {goal.dueDate}
              </span>
            </div>
            {daysLeft > 0 ? (
              <span className={daysLeft <= 7 ? 'text-orange-500' : ''}>
                剩余 {daysLeft} 天
              </span>
            ) : (
              <span className="text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                已过期
              </span>
            )}
          </div>

          {/* 子目标数量 */}
          {goal.subGoals.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {goal.subGoals.length} 个子目标 · {goal.subGoals.reduce((sum, sg) => sum + sg.tasks.length, 0)} 个任务
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function GoalsPage() {
  const [pageMode, setPageMode] = useState<PageMode>('list')
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    tag: 'all',
  })
  const goals = useGoalStore.use.goals()
  const viewMode = useGoalStore.use.viewMode()
  const setViewMode = useGoalStore.use.setViewMode()

  // 获取所有标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    goals.forEach(g => g.tags?.forEach(t => tagSet.add(t)))
    return Array.from(tagSet)
  }, [goals])

  // 筛选目标
  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      // 搜索过滤
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !goal.title.toLowerCase().includes(searchLower) &&
          !goal.description.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // 状态过滤
      if (filters.status !== 'all' && goal.status !== filters.status) {
        return false
      }

      // 优先级过滤
      if (filters.priority !== 'all' && goal.priority !== filters.priority) {
        return false
      }

      // 标签过滤
      if (filters.tag !== 'all' && (!goal.tags || !goal.tags.includes(filters.tag))) {
        return false
      }

      return true
    })
  }, [goals, filters])

  const rootGoals = filteredGoals.filter(g => !g.parentGoalId)

  // 渲染不同模式
  if (pageMode === 'create') {
    return <GoalCreateForm onCancel={() => setPageMode('list')} />
  }

  if (pageMode === 'template') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              目标模板库
            </h1>
            <p className="text-muted-foreground mt-1">
              从预设模板快速创建你的目标
            </p>
          </div>
          <Button variant="outline" onClick={() => setPageMode('list')}>
            返回列表
          </Button>
        </div>
        <GoalTemplateSelector onSelect={() => setPageMode('list')} />
      </div>
    )
  }

  if (pageMode === 'detail' && selectedGoalId) {
    return <GoalDetailPage goalId={selectedGoalId} onBack={() => setPageMode('list')} />
  }

  // 列表模式
  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            目标管理
          </h1>
          <p className="text-muted-foreground mt-1">
            基于 SMART 原则，科学制定和追踪你的目标
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPageMode('template')} icon={LayoutGrid}>
            模板库
          </Button>
          <Button onClick={() => setPageMode('create')} icon={Plus}>
            创建目标
          </Button>
        </div>
      </div>

      {/* 视图切换和筛选器 */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={[
              { label: '树形视图', value: 'tree', icon: List },
              { label: 'OKR 视图', value: 'okr', icon: Target },
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
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="搜索目标名称或描述..."
                  className="pl-10 pr-10"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 筛选条件 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">状态</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as GoalStatus | 'all' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="active">进行中</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="paused">已暂停</SelectItem>
                      <SelectItem value="cancelled">已取消</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">优先级</label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value as GoalPriority | 'all' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部优先级</SelectItem>
                      <SelectItem value="p0">P0 - 紧急重要</SelectItem>
                      <SelectItem value="p1">P1 - 重要不紧急</SelectItem>
                      <SelectItem value="p2">P2 - 一般优先级</SelectItem>
                      <SelectItem value="p3">P3 - 低优先级</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">标签</label>
                  <Select
                    value={filters.tag}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, tag: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部标签</SelectItem>
                      {allTags.map(tag => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 清除筛选 */}
              {(filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.tag !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ search: '', status: 'all', priority: 'all', tag: 'all' })}
                  className="text-sm"
                >
                  清除所有筛选条件
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总目标数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              进行中 {goals.filter(g => g.status === 'active').length} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {goals.filter(g => g.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              完成率 {goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {goals.filter(g => {
                const daysLeft = Math.ceil((new Date(g.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                return daysLeft <= 7 && daysLeft > 0 && g.status === 'active'
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">7 天内到期</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">已过期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {goals.filter(g => {
                const daysLeft = Math.ceil((new Date(g.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                return daysLeft < 0 && g.status === 'active'
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">需要处理</p>
          </CardContent>
        </Card>
      </div>

      {/* 根据视图模式渲染 */}
      {viewMode === 'okr' ? (
        <OKRView />
      ) : (
        /* 目标列表 */
        rootGoals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Target className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">还没有创建目标</h3>
              <p className="text-muted-foreground mb-6 text-center">
                开始创建你的第一个目标，使用 SMART 原则让目标更清晰
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setPageMode('create')} icon={Plus}>
                  创建目标
                </Button>
                <Button variant="outline" onClick={() => setPageMode('template')} icon={LayoutGrid}>
                  从模板创建
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rootGoals.map((goal: Goal) => (
              <GoalCard key={goal.id} goal={goal} onClick={() => {
                setSelectedGoalId(goal.id)
                setPageMode('detail')
              }} />
            ))}
          </div>
        )
      )}
    </div>
  )
}
