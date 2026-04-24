import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/segmented'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { usePDCAStore, type PDCAViewMode, type PDCACycle, type PDCAStage, type Risk } from '@/store/pdcaStore'

import {
  Plus,
  ClipboardList,
  Play,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from 'lucide-react'

const STAGE_CONFIG = {
  plan: { label: 'Plan 计划', icon: ClipboardList, color: 'bg-blue-500' },
  do: { label: 'Do 执行', icon: Play, color: 'bg-green-500' },
  check: { label: 'Check 检查', icon: Search, color: 'bg-orange-500' },
  act: { label: 'Act 处理', icon: CheckCircle2, color: 'bg-purple-500' },
}

function PDCACard({ cycle }: { cycle: PDCACycle }) {
  const advanceStage = usePDCAStore.use.advanceStage()
  const deleteCycle = usePDCAStore.use.deleteCycle()
  const setSelectedCycle = usePDCAStore.use.setSelectedCycle()
  const stageConfig = STAGE_CONFIG[cycle.stage]
  const StageIcon = stageConfig.icon

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCycle(cycle.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${stageConfig.color}`} />
              <Badge variant="outline" className="text-xs">
                <StageIcon className="w-3 h-3 mr-1" />
                {stageConfig.label}
              </Badge>
              {cycle.status === 'completed' && (
                <Badge className="bg-green-500 text-xs">已完成</Badge>
              )}
            </div>
            <CardTitle className="text-base">{cycle.title}</CardTitle>
            {cycle.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {cycle.description}
              </CardDescription>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteCycle(cycle.id)
            }}
            className="text-muted-foreground hover:text-red-500"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">进度</span>
              <span className="font-medium">{cycle.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${cycle.progress}%` }} />
            </div>
          </div>

          {cycle.stage !== 'act' && cycle.status === 'active' && (
            <Button
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                advanceStage(cycle.id)
              }}
              icon={ArrowRight}
              iconPlacement="right"
            >
              进入下一阶段
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RiskCard({ risk }: { risk: Risk }) {
  const deleteRisk = usePDCAStore.use.deleteRisk()
  const scoreColor = risk.score >= 16 ? 'bg-red-500' : risk.score >= 12 ? 'bg-orange-500' : risk.score >= 6 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${scoreColor}`} />
              <Badge variant="outline" className="text-xs">
                风险分: {risk.score}
              </Badge>
              <Badge className="text-xs">
                {risk.status === 'identified' ? '已识别' :
                 risk.status === 'monitoring' ? '监控中' :
                 risk.status === 'mitigated' ? '已缓解' :
                 risk.status === 'occurred' ? '已发生' : '已关闭'}
              </Badge>
            </div>
            <CardTitle className="text-sm">{risk.title}</CardTitle>
          </div>
          <button
            onClick={() => deleteRisk(risk.id)}
            className="text-muted-foreground hover:text-red-500"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">发生概率</p>
            <p className="font-medium">{risk.probability}/5</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">影响程度</p>
            <p className="font-medium">{risk.impact}/5</p>
          </div>
        </div>
        {risk.mitigationPlan && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
            <p className="font-medium mb-1">缓解计划</p>
            <p className="text-muted-foreground line-clamp-2">{risk.mitigationPlan}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function PDCAPage() {
  const [showAddCycle, setShowAddCycle] = useState(false)
  const [showAddRisk, setShowAddRisk] = useState(false)
  const viewMode = usePDCAStore.use.viewMode()
  const setViewMode = usePDCAStore.use.setViewMode()
  const cycles = usePDCAStore.use.cycles()
  const risks = usePDCAStore.use.risks()

  const cyclesByStage = {
    plan: cycles.filter((c: PDCACycle) => c.stage === 'plan'),
    do: cycles.filter((c: PDCACycle) => c.stage === 'do'),
    check: cycles.filter((c: PDCACycle) => c.stage === 'check'),
    act: cycles.filter((c: PDCACycle) => c.stage === 'act'),
  }
  const highRisks = risks.filter((r: Risk) => r.score >= 12)
  const stats = {
    totalCycles: cycles.length,
    activeCycles: cycles.filter((c: PDCACycle) => c.status === 'active').length,
    completedCycles: cycles.filter((c: PDCACycle) => c.status === 'completed').length,
    totalRisks: risks.length,
    highRisks: risks.filter((r: Risk) => r.score >= 12).length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">PDCA 循环引擎</h1>
          <p className="text-muted-foreground mt-1">
            Plan-Do-Check-Act 持续改进循环
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddRisk(true)} icon={AlertTriangle}>
            添加风险
          </Button>
          <Button onClick={() => setShowAddCycle(true)} icon={Plus}>
            创建循环
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.totalCycles}</div>
            <p className="text-xs text-muted-foreground">总循环数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-blue-500">{stats.activeCycles}</div>
            <p className="text-xs text-muted-foreground">进行中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-green-500">{stats.completedCycles}</div>
            <p className="text-xs text-muted-foreground">已完成</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.totalRisks}</div>
            <p className="text-xs text-muted-foreground">风险总数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-red-500">{stats.highRisks}</div>
            <p className="text-xs text-muted-foreground">高风险</p>
          </CardContent>
        </Card>
      </div>

      {/* 视图切换 */}
      <div className="mb-6">
        <Segmented
          value={viewMode}
          onChange={(value) => setViewMode(value as PDCAViewMode)}
          options={[
            { label: '列表', value: 'list' },
            { label: '看板', value: 'kanban' },
          ]}
        />
      </div>

      {/* 高风险提示 */}
      {highRisks.length > 0 && (
        <Card className="mb-8 border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              高风险预警
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highRisks.map((risk: Risk) => (
                <div key={risk.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                  <div>
                    <p className="text-sm font-medium">{risk.title}</p>
                    <p className="text-xs text-muted-foreground">风险分: {risk.score}</p>
                  </div>
                  <Badge variant="destructive">需关注</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDCA 循环 */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {cycles.map(cycle => (
            <PDCACard key={cycle.id} cycle={cycle} />
          ))}
          {cycles.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <TrendingUp className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">暂无 PDCA 循环</h3>
                <p className="text-muted-foreground mb-6">
                  创建你的第一个 PDCA 循环，开始持续改进
                </p>
                <Button onClick={() => setShowAddCycle(true)} icon={Plus}>
                  创建循环
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {(['plan', 'do', 'check', 'act'] as PDCAStage[]).map(stage => {
            const stageConfig = STAGE_CONFIG[stage]
            return (
              <div key={stage} className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stageConfig.color}`} />
                  {stageConfig.label}
                  <Badge variant="outline" className="text-xs">
                    {cyclesByStage[stage].length}
                  </Badge>
                </h3>
                {cyclesByStage[stage].map((cycle: PDCACycle) => (
                  <PDCACard key={cycle.id} cycle={cycle} />
                ))}
                {cyclesByStage[stage].length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    暂无循环
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 风险列表 */}
      {risks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            风险登记册
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {risks.map(risk => (
              <RiskCard key={risk.id} risk={risk} />
            ))}
          </div>
        </div>
      )}

      {/* 创建循环表单 */}
      {showAddCycle && <CreateCycleForm onClose={() => setShowAddCycle(false)} />}

      {/* 添加风险表单 */}
      {showAddRisk && <AddRiskForm onClose={() => setShowAddRisk(false)} />}
    </div>
  )
}

function CreateCycleForm({ onClose }: { onClose: () => void }) {
  const createCycle = usePDCAStore.use.createCycle()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    createCycle({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      stage: 'plan',
      status: 'active',
      plan: {
        objectives: [],
        tasks: [],
        risks: [],
        baseline: '',
        version: 1,
        createdAt: new Date().toISOString(),
      },
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">创建 PDCA 循环</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label>循环标题</Label>
            <Input name="title" required placeholder="输入标题" />
          </div>
          <div>
            <Label>描述</Label>
            <Textarea name="description" placeholder="输入描述（可选）" />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              取消
            </Button>
            <Button type="submit" className="flex-1">
              创建
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddRiskForm({ onClose }: { onClose: () => void }) {
  const addRisk = usePDCAStore.use.addRisk()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    addRisk({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as any,
      probability: Number(formData.get('probability')),
      impact: Number(formData.get('impact')),
      status: 'identified',
      mitigationPlan: formData.get('mitigationPlan') as string,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">添加风险</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label>风险名称</Label>
            <Input name="title" required />
          </div>
          <div>
            <Label>类别</Label>
            <Select name="category" defaultValue="other">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">技术风险</SelectItem>
                <SelectItem value="resource">资源风险</SelectItem>
                <SelectItem value="external">外部风险</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>发生概率(1-5)</Label>
              <Input name="probability" type="number" min="1" max="5" defaultValue="3" />
            </div>
            <div>
              <Label>影响程度(1-5)</Label>
              <Input name="impact" type="number" min="1" max="5" defaultValue="3" />
            </div>
          </div>
          <div>
            <Label>缓解计划</Label>
            <Textarea name="mitigationPlan" />
          </div>
          <div className="flex gap-3">
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
