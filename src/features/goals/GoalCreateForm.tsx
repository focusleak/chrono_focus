import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'

import { useGoalStore } from '@/store/goalStore'

import type { Goal, GoalPriority, MetricType, SmartScore } from '@/types'

import { ArrowLeft, ArrowRight, Check, Lightbulb, AlertCircle } from 'lucide-react'

type FormStep = 'basic' | 'smart' | 'metric' | 'dates' | 'review'

interface GoalFormData {
  title: string
  description: string
  priority: GoalPriority
  difficulty: Goal['difficulty']
  tags: string[]
  metric: MetricType
  startDate: string
  dueDate: string
  smartChecklist: {
    specific: boolean
    measurable: boolean
    achievable: boolean
    relevant: boolean
    timeBound: boolean
  }
}

const initialFormData: GoalFormData = {
  title: '',
  description: '',
  priority: 'p2',
  difficulty: 3,
  tags: [],
  metric: {
    type: 'percentage',
    target: 100,
    current: 0,
    unit: '%',
  },
  startDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  smartChecklist: {
    specific: false,
    measurable: false,
    achievable: false,
    relevant: false,
    timeBound: false,
  },
}

const SMART_CRITERIA = [
  {
    key: 'specific' as const,
    label: 'S - Specific（具体的）',
    description: '目标是否明确具体？',
    questions: ['目标是否清晰描述？', '是否知道要做什么？', '是否有明确的范围？'],
  },
  {
    key: 'measurable' as const,
    label: 'M - Measurable（可衡量的）',
    description: '如何衡量目标是否完成？',
    questions: ['是否有量化指标？', '如何知道目标已完成？', '完成标准是什么？'],
  },
  {
    key: 'achievable' as const,
    label: 'A - Achievable（可实现的）',
    description: '目标是否现实可行？',
    questions: ['是否有足够的资源？', '是否有相关技能或能力？', '时间是否充足？'],
  },
  {
    key: 'relevant' as const,
    label: 'R - Relevant（相关的）',
    description: '目标是否与整体规划相关？',
    questions: ['是否符合长期规划？', '是否当前最重要？', '是否值得投入？'],
  },
  {
    key: 'timeBound' as const,
    label: 'T - Time-bound（有时限的）',
    description: '是否有明确的截止日期？',
    questions: ['是否有明确的 deadline？', '时间节点是否合理？', '是否有阶段性里程碑？'],
  },
]

export function GoalCreateForm({ onCancel }: { onCancel: () => void }) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [formData, setFormData] = useState<GoalFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({})

  const createGoal = useGoalStore.use.createGoal()

  const steps: { key: FormStep; title: string; description: string }[] = [
    { key: 'basic', title: '基本信息', description: '目标名称和描述' },
    { key: 'smart', title: 'SMART 校验', description: '智能目标评估' },
    { key: 'metric', title: '衡量指标', description: '设置完成标准' },
    { key: 'dates', title: '时间设置', description: '开始和截止日期' },
    { key: 'review', title: '确认创建', description: '检查并创建' },
  ]

  const currentStepIndex = steps.findIndex(s => s.key === currentStep)

  const validateStep = useCallback((step: FormStep): boolean => {
    const newErrors: Partial<Record<keyof GoalFormData, string>> = {}

    switch (step) {
      case 'basic':
        if (!formData.title.trim()) {
          newErrors.title = '请输入目标名称'
        }
        if (!formData.description.trim()) {
          newErrors.description = '请输入目标描述'
        }
        break
      case 'dates':
        if (!formData.dueDate) {
          newErrors.dueDate = '请选择截止日期'
        } else if (formData.dueDate <= formData.startDate) {
          newErrors.dueDate = '截止日期必须晚于开始日期'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      const nextIndex = currentStepIndex + 1
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex].key)
      }
    }
  }, [currentStep, currentStepIndex, steps, validateStep])

  const handlePrev = useCallback(() => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key)
    }
  }, [currentStepIndex, steps])

  const calculateSmartScore = useCallback((): SmartScore => {
    const checklist = formData.smartChecklist
    const scores = {
      specific: checklist.specific ? 10 : 0,
      measurable: checklist.measurable ? 10 : 0,
      achievable: checklist.achievable ? 10 : 0,
      relevant: checklist.relevant ? 10 : 0,
      timeBound: checklist.timeBound ? 10 : 0,
    }
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0)

    return { ...scores, total }
  }, [formData.smartChecklist])

  const handleCreate = useCallback(() => {
    const smartScore = calculateSmartScore()

    createGoal({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      difficulty: formData.difficulty,
      tags: formData.tags,
      metric: formData.metric,
      smartScore,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      status: 'active',
      subGoals: [],
      parentGoalId: undefined,
    })

    onCancel()
  }, [formData, createGoal, onCancel, calculateSmartScore])

  const updateFormData = useCallback((updates: Partial<GoalFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const updateSmartChecklist = useCallback((key: keyof GoalFormData['smartChecklist'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      smartChecklist: { ...prev.smartChecklist, [key]: value },
    }))
  }, [])

  // ========== 渲染不同步骤 ==========
  const renderBasicStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="goal-title" className="text-base font-medium">
          目标名称 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="goal-title"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="例如：通过 PMP 认证考试"
          className="mt-2"
          error={errors.title}
        />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
      </div>

      <div>
        <Label htmlFor="goal-description" className="text-base font-medium">
          具体描述 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="goal-description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="详细描述目标内容，包括背景、目的、期望结果等..."
          className="mt-2 min-h-[120px]"
          error={errors.description}
        />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-base font-medium">优先级</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => updateFormData({ priority: value as GoalPriority })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p0">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">P0</Badge>
                  <span>紧急重要</span>
                </div>
              </SelectItem>
              <SelectItem value="p1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-500">P1</Badge>
                  <span>重要不紧急</span>
                </div>
              </SelectItem>
              <SelectItem value="p2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500">P2</Badge>
                  <span>一般优先级</span>
                </div>
              </SelectItem>
              <SelectItem value="p3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">P3</Badge>
                  <span>低优先级</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">难度评估</Label>
          <div className="flex items-center gap-3 mt-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => updateFormData({ difficulty: level as Goal['difficulty'] })}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  formData.difficulty === level
                    ? 'bg-primary text-white'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {level}
              </button>
            ))}
            <span className="text-sm text-muted-foreground ml-2">
              {formData.difficulty <= 2 ? '简单' : formData.difficulty <= 4 ? '中等' : '困难'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSmartStep = () => {
    const smartScore = calculateSmartScore()

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              SMART 原则校验
            </CardTitle>
            <CardDescription>
              根据 SMART 原则检查目标的合理性
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">SMART 评分</span>
                <span className={`text-2xl font-bold ${
                  smartScore.total >= 80 ? 'text-green-500' :
                  smartScore.total >= 60 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {smartScore.total}/100
                </span>
              </div>
              <Progress value={smartScore.total} className="h-2" />
            </div>

            <div className="space-y-4">
              {SMART_CRITERIA.map((criteria) => (
                <div key={criteria.key} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.smartChecklist[criteria.key]}
                        onCheckedChange={(checked) =>
                          updateSmartChecklist(criteria.key, checked as boolean)
                        }
                      />
                      <div>
                        <p className="font-medium">{criteria.label}</p>
                        <p className="text-sm text-muted-foreground">{criteria.description}</p>
                      </div>
                    </div>
                    {formData.smartChecklist[criteria.key] && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div className="ml-7 mt-3 space-y-2">
                    {criteria.questions.map((question, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        • {question}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {smartScore.total < 60 && (
              <div className="flex items-start gap-2 mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">SMART 评分较低</p>
                  <p>建议继续完善目标定义，确保符合 SMART 原则后再创建。</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderMetricStep = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">指标类型</Label>
        <Select
          value={formData.metric.type}
          onValueChange={(value) =>
            updateFormData({
              metric: {
                ...formData.metric,
                type: value as MetricType['type'],
                unit: value === 'percentage' ? '%' : value === 'number' ? '次' : undefined,
              },
            })
          }
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">百分比（%）</SelectItem>
            <SelectItem value="number">数值（次/个/本等）</SelectItem>
            <SelectItem value="boolean">是否完成（是/否）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.metric.type !== 'boolean' && (
        <div>
          <Label htmlFor="metric-target" className="text-base font-medium">
            目标值
          </Label>
          <Input
            id="metric-target"
            type="number"
            value={formData.metric.target}
            onChange={(e) =>
              updateFormData({
                metric: { ...formData.metric, target: Number(e.target.value) },
              })
            }
            className="mt-2"
            placeholder={formData.metric.type === 'percentage' ? '100' : '例如：10'}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {formData.metric.type === 'percentage' ? '完成百分比，通常设为 100%' : '期望达到的具体数值'}
          </p>
        </div>
      )}

      {formData.metric.type !== 'boolean' && (
        <div>
          <Label htmlFor="metric-unit" className="text-base font-medium">
            单位（可选）
          </Label>
          <Input
            id="metric-unit"
            value={formData.metric.unit || ''}
            onChange={(e) =>
              updateFormData({ metric: { ...formData.metric, unit: e.target.value } })
            }
            className="mt-2"
            placeholder="例如：本、次、个、小时"
          />
        </div>
      )}
    </div>
  )

  const renderDatesStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="start-date" className="text-base font-medium">
          开始日期
        </Label>
        <Input
          id="start-date"
          type="date"
          value={formData.startDate}
          onChange={(e) => updateFormData({ startDate: e.target.value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="due-date" className="text-base font-medium">
          截止日期 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="due-date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => updateFormData({ dueDate: e.target.value })}
          className="mt-2"
          error={errors.dueDate}
        />
        {errors.dueDate && <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>}
      </div>

      {formData.dueDate && formData.startDate && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📅 目标周期：{Math.ceil(
              (new Date(formData.dueDate).getTime() - new Date(formData.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )} 天
          </p>
        </div>
      )}
    </div>
  )

  const renderReviewStep = () => {
    const smartScore = calculateSmartScore()

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>确认目标信息</CardTitle>
            <CardDescription>请检查以下信息是否正确</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">目标名称</p>
              <p className="text-base">{formData.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">目标描述</p>
              <p className="text-sm">{formData.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">优先级</p>
                <Badge variant={
                  formData.priority === 'p0' ? 'destructive' :
                  formData.priority === 'p1' ? 'default' :
                  formData.priority === 'p2' ? 'secondary' : 'outline'
                }>
                  {formData.priority.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">难度</p>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        level <= formData.difficulty
                          ? 'bg-primary text-white'
                          : 'bg-muted'
                      }`}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">衡量指标</p>
              <p className="text-sm">
                {formData.metric.type === 'boolean'
                  ? '是否完成'
                  : `${formData.metric.target}${formData.metric.unit || ''}`}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">时间周期</p>
              <p className="text-sm">
                {formData.startDate} 至 {formData.dueDate}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">SMART 评分</p>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={smartScore.total} className="flex-1 h-2" />
                <span className="text-sm font-medium">{smartScore.total}/100</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic':
        return renderBasicStep()
      case 'smart':
        return renderSmartStep()
      case 'metric':
        return renderMetricStep()
      case 'dates':
        return renderDatesStep()
      case 'review':
        return renderReviewStep()
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 步骤指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index < currentStepIndex
                    ? 'bg-green-500 text-white'
                    : index === currentStepIndex
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{steps[currentStepIndex].title}</h2>
          <p className="text-sm text-muted-foreground">{steps[currentStepIndex].description}</p>
        </div>
      </div>

      {/* 表单内容 */}
      {renderCurrentStep()}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <div className="flex gap-3">
          {currentStepIndex > 0 && (
            <Button variant="outline" onClick={handlePrev} icon={ArrowLeft}>
              上一步
            </Button>
          )}
          {currentStepIndex < steps.length - 1 ? (
            <Button onClick={handleNext} icon={ArrowRight} iconPlacement="right">
              下一步
            </Button>
          ) : (
            <Button onClick={handleCreate} icon={Check} iconPlacement="right">
              创建目标
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
