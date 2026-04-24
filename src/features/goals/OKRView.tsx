import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { useGoalStore } from '@/store/goalStore'

import type { Goal } from '@/types'

import { Target, ChevronDown, ChevronRight, Layers } from 'lucide-react'
import { useState } from 'react'

function OKRGoalCard({ goal }: { goal: Goal }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{goal.title}</CardTitle>
              </div>
              <CardDescription className="line-clamp-2">
                {goal.description}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{goal.progress}%</p>
            <p className="text-xs text-muted-foreground">完成度</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Objective 进度条 */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium">Objective 进度</span>
          </div>
          <Progress value={goal.progress} className="h-3" />
        </div>

        {/* Key Results（子目标） */}
        {expanded && goal.subGoals.length > 0 && (
          <div className="space-y-3 mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Key Results（子目标）
            </h4>
            {goal.subGoals.map((subGoal) => (
              <div key={subGoal.id} className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{subGoal.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {subGoal.progress}%
                  </Badge>
                </div>
                <Progress value={subGoal.progress} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {subGoal.tasks.filter(t => t.status === 'completed').length}/{subGoal.tasks.length} 任务完成
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 标签和优先级 */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t flex-wrap">
          <Badge
            variant={
              goal.priority === 'p0'
                ? 'destructive'
                : goal.priority === 'p1'
                ? 'default'
                : 'secondary'
            }
          >
            {goal.priority.toUpperCase()}
          </Badge>
          {goal.tags?.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function OKRView() {
  const goals = useGoalStore.use.goals()

  const rootGoals = goals.filter((g: Goal) => !g.parentGoalId)
  const activeGoals = rootGoals.filter((g: Goal) => g.status === 'active')
  const completedGoals = rootGoals.filter((g: Goal) => g.status === 'completed')

  return (
    <div className="space-y-8">
      {/* OKR 概览 */}
      <Card>
        <CardHeader>
          <CardTitle>OKR 总览</CardTitle>
          <CardDescription>
            Objectives and Key Results 视图
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{activeGoals.length}</p>
              <p className="text-sm text-muted-foreground mt-1">进行中目标</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">{completedGoals.length}</p>
              <p className="text-sm text-muted-foreground mt-1">已完成目标</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">
                {rootGoals.length > 0
                  ? Math.round(
                      rootGoals.reduce((sum: number, g: Goal) => sum + g.progress, 0) / rootGoals.length
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-muted-foreground mt-1">平均完成度</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 进行中的目标 */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            进行中的 Objectives
          </h2>
          <div className="space-y-4">
            {activeGoals.map((goal: Goal) => (
              <OKRGoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* 已完成的目标 */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            已完成的 Objectives
          </h2>
          <div className="space-y-4 opacity-75">
            {completedGoals.map((goal: Goal) => (
              <OKRGoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {rootGoals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">还没有创建目标</h3>
            <p className="text-muted-foreground text-center">
              使用 SMART 原则创建你的第一个 OKR 目标
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
