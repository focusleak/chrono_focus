import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import { useGoalStore } from '@/store/goalStore'

import type { Goal, GoalPriority, SmartScore } from '@/types'

import { Save, X } from 'lucide-react'

interface GoalEditFormProps {
  goal: Goal
  onSave: () => void
  onCancel: () => void
}

export function GoalEditForm({ goal, onSave, onCancel }: GoalEditFormProps) {
  const updateGoal = useGoalStore.use.updateGoal()
  const goals = useGoalStore.use.goals()

  const [formData, setFormData] = useState({
    title: goal.title,
    description: goal.description,
    priority: goal.priority,
    difficulty: goal.difficulty,
    status: goal.status,
    tags: goal.tags || [],
    parentGoalId: goal.parentGoalId || '',
    metricTarget: goal.metric.target,
    metricCurrent: goal.metric.current,
    metricUnit: goal.metric.unit || '',
    startDate: goal.startDate,
    dueDate: goal.dueDate,
  })

  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '目标名称不能为空'
    }
    if (!formData.description.trim()) {
      newErrors.description = '目标描述不能为空'
    }
    if (!formData.dueDate) {
      newErrors.dueDate = '请选择截止日期'
    } else if (formData.dueDate <= formData.startDate) {
      newErrors.dueDate = '截止日期必须晚于开始日期'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const smartScore: SmartScore = {
      specific: 10,
      measurable: 10,
      achievable: 10,
      relevant: 10,
      timeBound: 10,
      total: 100,
    }

    updateGoal(goal.id, {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      difficulty: formData.difficulty,
      status: formData.status,
      tags: formData.tags,
      parentGoalId: formData.parentGoalId || undefined,
      metric: {
        ...goal.metric,
        target: formData.metricTarget,
        current: formData.metricCurrent,
        unit: formData.metricUnit || undefined,
      },
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      smartScore,
    })

    onSave()
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const availableParents = goals.filter(g => g.id !== goal.id && !g.parentGoalId)

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">
            目标名称 <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-2"
            error={errors.title}
          />
          {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
        </div>

        <div>
          <Label className="text-base font-medium">
            具体描述 <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-2 min-h-[100px]"
            error={errors.description}
          />
          {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
        </div>
      </div>

      {/* 状态和优先级 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-base font-medium">状态</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Goal['status'] }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">进行中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="paused">已暂停</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">优先级</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as GoalPriority }))}
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
      </div>

      {/* 难度评估 */}
      <div>
        <Label className="text-base font-medium">难度评估</Label>
        <div className="flex items-center gap-3 mt-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setFormData(prev => ({ ...prev, difficulty: level as Goal['difficulty'] }))}
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

      {/* 衡量指标 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-base font-medium">目标值</Label>
          <Input
            type="number"
            value={formData.metricTarget}
            onChange={(e) => setFormData(prev => ({ ...prev, metricTarget: Number(e.target.value) }))}
            className="mt-2"
          />
        </div>
        <div>
          <Label className="text-base font-medium">当前值</Label>
          <Input
            type="number"
            value={formData.metricCurrent}
            onChange={(e) => setFormData(prev => ({ ...prev, metricCurrent: Number(e.target.value) }))}
            className="mt-2"
          />
        </div>
        <div>
          <Label className="text-base font-medium">单位</Label>
          <Input
            value={formData.metricUnit}
            onChange={(e) => setFormData(prev => ({ ...prev, metricUnit: e.target.value }))}
            className="mt-2"
            placeholder="例如：%"
          />
        </div>
      </div>

      {/* 时间设置 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-base font-medium">开始日期</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="mt-2"
          />
        </div>
        <div>
          <Label className="text-base font-medium">
            截止日期 <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="mt-2"
            error={errors.dueDate}
          />
          {errors.dueDate && <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>}
        </div>
      </div>

      {/* 关联上级目标 */}
      <div>
        <Label className="text-base font-medium">关联上级目标（可选）</Label>
        <Select
          value={formData.parentGoalId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, parentGoalId: value }))}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="选择上级目标" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">无</SelectItem>
            {availableParents.map(g => (
              <SelectItem key={g.id} value={g.id}>
                {g.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 标签管理 */}
      <div>
        <Label className="text-base font-medium">标签</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="cursor-pointer">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="添加新标签"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button size="sm" onClick={addTag}>
            添加
          </Button>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button variant="outline" onClick={onCancel} icon={X}>
          取消
        </Button>
        <Button onClick={handleSave} icon={Save}>
          保存修改
        </Button>
      </div>
    </div>
  )
}
