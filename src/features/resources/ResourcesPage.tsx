import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/segmented'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useResourceStore, type ResourceViewMode, type ResourceType, type TimeResource, type BudgetResource, type SkillResource } from '@/store/resourceStore'

import {
  Plus,
  Clock,
  Wallet,
  Award,
  TrendingUp,
} from 'lucide-react'

function TimeResourceCard({ resource }: { resource: TimeResource }) {
  const deleteResource = useResourceStore.use.deleteResource()
  const utilization = resource.monthlyBudget > 0 ? (resource.used / resource.monthlyBudget) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">{resource.name}</CardTitle>
              <CardDescription>时间资源</CardDescription>
            </div>
          </div>
          <button
            onClick={() => deleteResource(resource.id)}
            className="text-muted-foreground hover:text-red-500"
          >
            删除
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">每日可用</p>
            <p className="text-lg font-semibold">{resource.dailyAvailable}h</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">每周可用</p>
            <p className="text-lg font-semibold">{resource.weeklyAvailable}h</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">月预算</p>
            <p className="text-lg font-semibold">{resource.monthlyBudget}h</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">已使用</p>
            <p className="text-lg font-semibold">{resource.used}h</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>利用率</span>
            <span className="font-medium">{utilization.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                utilization > 90 ? 'bg-red-500' : utilization > 70 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BudgetResourceCard({ resource }: { resource: BudgetResource }) {
  const deleteResource = useResourceStore.use.deleteResource()
  const utilization = resource.total > 0 ? (resource.used / resource.total) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">{resource.name}</CardTitle>
              <CardDescription>资金资源</CardDescription>
            </div>
          </div>
          <button
            onClick={() => deleteResource(resource.id)}
            className="text-muted-foreground hover:text-red-500"
          >
            删除
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">总预算</p>
            <p className="text-lg font-semibold">{resource.total.toLocaleString()} {resource.currency}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">已使用</p>
            <p className="text-lg font-semibold">{resource.used.toLocaleString()} {resource.currency}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">剩余</p>
            <p className="text-lg font-semibold text-green-500">{resource.remaining.toLocaleString()} {resource.currency}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>使用率</span>
            <span className="font-medium">{utilization.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                utilization > 90 ? 'bg-red-500' : utilization > 70 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SkillResourceCard({ resource }: { resource: SkillResource }) {
  const deleteResource = useResourceStore.use.deleteResource()
  const levelLabels = ['', '入门', '初级', '中级', '高级', '专家']

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">{resource.name}</CardTitle>
              <CardDescription>{resource.category}</CardDescription>
            </div>
          </div>
          <button
            onClick={() => deleteResource(resource.id)}
            className="text-muted-foreground hover:text-red-500"
          >
            删除
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">技能等级</p>
            <Badge variant="outline">{levelLabels[resource.level]}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">自评分数</p>
            <p className="text-lg font-semibold">{resource.selfAssessment}/10</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">最后使用</p>
            <p className="text-sm font-medium">{resource.lastUsed || '未使用'}</p>
          </div>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(level => (
            <div
              key={level}
              className={`h-2 flex-1 rounded-full ${
                level <= resource.level ? 'bg-purple-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ResourcesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const viewMode = useResourceStore.use.viewMode()
  const setViewMode = useResourceStore.use.setViewMode()
  const resources = useResourceStore.use.resources()

  const timeResources = resources.filter(r => r.type === 'time') as TimeResource[]
  const budgetResources = resources.filter(r => r.type === 'budget') as BudgetResource[]
  const skillResources = resources.filter(r => r.type === 'skill') as SkillResource[]

  const stats = {
    totalResources: resources.length,
    totalAllocations: 0,
    timeUtilization: timeResources.reduce((sum, r) => sum + (r.monthlyBudget > 0 ? (r.used / r.monthlyBudget) * 100 : 0), 0) / (timeResources.length || 1),
    budgetUtilization: budgetResources.reduce((sum, r) => sum + (r.total > 0 ? (r.used / r.total) * 100 : 0), 0) / (budgetResources.length || 1),
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">资源管理</h1>
          <p className="text-muted-foreground mt-1">
            盘点和分配你的时间、资金、技能资源
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} icon={Plus}>
          添加资源
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.totalResources}</div>
            <p className="text-xs text-muted-foreground">资源总数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.totalAllocations}</div>
            <p className="text-xs text-muted-foreground">分配次数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.timeUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">时间利用率</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.budgetUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">预算使用率</p>
          </CardContent>
        </Card>
      </div>

      {/* 视图切换 */}
      <div className="mb-6">
        <Segmented
          value={viewMode}
          onChange={(value) => setViewMode(value as ResourceViewMode)}
          options={[
            { label: '总览', value: 'overview' },
            { label: '时间', value: 'time' },
            { label: '资金', value: 'budget' },
            { label: '技能', value: 'skill' },
          ]}
        />
      </div>

      {/* 资源列表 */}
      {(viewMode === 'overview' || viewMode === 'time') && timeResources.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            时间资源
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeResources.map(resource => (
              <TimeResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {(viewMode === 'overview' || viewMode === 'budget') && budgetResources.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-500" />
            资金资源
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetResources.map(resource => (
              <BudgetResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {(viewMode === 'overview' || viewMode === 'skill') && skillResources.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            技能资源
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillResources.map(resource => (
              <SkillResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {resources.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">暂无资源记录</h3>
            <p className="text-muted-foreground mb-6">
              开始盘点你的资源，更好地规划和分配
            </p>
            <Button onClick={() => setShowAddForm(true)} icon={Plus}>
              添加资源
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 添加资源表单 */}
      {showAddForm && <AddResourceForm onClose={() => setShowAddForm(false)} />}
    </div>
  )
}

function AddResourceForm({ onClose }: { onClose: () => void }) {
  const addResource = useResourceStore.use.addResource()
  const [resourceType, setResourceType] = useState<ResourceType>('time')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    if (resourceType === 'time') {
      addResource({
        type: 'time',
        name: formData.get('name') as string,
        dailyAvailable: Number(formData.get('dailyAvailable')),
        weeklyAvailable: Number(formData.get('weeklyAvailable')),
        monthlyBudget: Number(formData.get('monthlyBudget')),
        used: 0,
      } as Omit<TimeResource, 'id' | 'createdAt' | 'updatedAt'>)
    } else if (resourceType === 'budget') {
      const total = Number(formData.get('total'))
      const used = Number(formData.get('used'))
      addResource({
        type: 'budget',
        name: formData.get('name') as string,
        total,
        used,
        remaining: total - used,
        currency: (formData.get('currency') as string) || '¥',
      } as Omit<BudgetResource, 'id' | 'createdAt' | 'updatedAt'>)
    } else {
      addResource({
        type: 'skill',
        name: formData.get('name') as string,
        level: Number(formData.get('level')),
        category: formData.get('category') as string,
        selfAssessment: Number(formData.get('selfAssessment')),
        lastUsed: '',
      } as Omit<SkillResource, 'id' | 'createdAt' | 'updatedAt'>)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">添加资源</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label>资源类型</Label>
            <Select value={resourceType} onValueChange={(v) => setResourceType(v as ResourceType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">时间资源</SelectItem>
                <SelectItem value="budget">资金资源</SelectItem>
                <SelectItem value="skill">技能资源</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>名称</Label>
            <Input name="name" required placeholder="输入资源名称" />
          </div>

          {resourceType === 'time' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>每日可用(h)</Label>
                  <Input name="dailyAvailable" type="number" defaultValue="8" />
                </div>
                <div>
                  <Label>每周可用(h)</Label>
                  <Input name="weeklyAvailable" type="number" defaultValue="40" />
                </div>
              </div>
              <div>
                <Label>月预算(h)</Label>
                <Input name="monthlyBudget" type="number" defaultValue="160" />
              </div>
            </>
          )}

          {resourceType === 'budget' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>总预算</Label>
                  <Input name="total" type="number" defaultValue="10000" />
                </div>
                <div>
                  <Label>已使用</Label>
                  <Input name="used" type="number" defaultValue="0" />
                </div>
              </div>
              <div>
                <Label>货币单位</Label>
                <Input name="currency" defaultValue="¥" />
              </div>
            </>
          )}

          {resourceType === 'skill' && (
            <>
              <div>
                <Label>技能分类</Label>
                <Input name="category" placeholder="例如：编程、设计、沟通" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>等级(1-5)</Label>
                  <Input name="level" type="number" min="1" max="5" defaultValue="3" />
                </div>
                <div>
                  <Label>自评(1-10)</Label>
                  <Input name="selfAssessment" type="number" min="1" max="10" defaultValue="5" />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              取消
            </Button>
            <Button type="submit" className="flex-1">
              添加
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
