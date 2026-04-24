import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import { useTaskStore, type TaskPriority } from '@/store/taskStore'

import { X, Plus, Sparkles, Clock, Calendar } from 'lucide-react'

interface TaskQuickAddProps {
  onClose: () => void
}

/**
 * 简单的自然语言解析器
 * 支持格式：任务标题 @明天下午3点 #标签 !p0
 */
function parseNaturalLanguage(input: string): {
  title: string
  dueDate?: string
  tags: string[]
  priority?: TaskPriority
  estimatedHours?: number
} {
  let title = input
  let dueDate: string | undefined
  const tags: string[] = []
  let priority: TaskPriority | undefined
  let estimatedHours: number | undefined

  // 解析优先级 !p0, !p1, !p2, !p3
  const priorityMatch = input.match(/!(p[0-3])\b/)
  if (priorityMatch) {
    priority = priorityMatch[1] as TaskPriority
    title = title.replace(priorityMatch[0], '').trim()
  }

  // 解析标签 #tag
  const tagMatches = input.match(/#(\S+)/g)
  if (tagMatches) {
    tagMatches.forEach(match => {
      tags.push(match.slice(1))
      title = title.replace(match, '').trim()
    })
  }

  // 解析估计时间 2h, 30m
  const hoursMatch = input.match(/(\d+)h\b/)
  if (hoursMatch) {
    estimatedHours = parseInt(hoursMatch[1])
    title = title.replace(hoursMatch[0], '').trim()
  }

  // 解析简单的日期关键词
  const today = new Date()
  if (input.includes('@明天')) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    dueDate = tomorrow.toISOString().split('T')[0]
    title = title.replace('@明天', '').trim()
  } else if (input.includes('@今天')) {
    dueDate = today.toISOString().split('T')[0]
    title = title.replace('@今天', '').trim()
  } else if (input.includes('@下周')) {
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    dueDate = nextWeek.toISOString().split('T')[0]
    title = title.replace('@下周', '').trim()
  }

  return { title: title || input, dueDate, tags, priority, estimatedHours }
}

export function TaskQuickAdd({ onClose }: TaskQuickAddProps) {
  const createTask = useTaskStore.use.createTask()
  const bulkCreateTasks = useTaskStore.use.bulkCreateTasks()

  const [mode, setMode] = useState<'quick' | 'detail'>('quick')
  const [quickInput, setQuickInput] = useState('')
  const [parsed, setParsed] = useState<ReturnType<typeof parseNaturalLanguage> | null>(null)

  // 详细表单
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('p2')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const handleQuickAdd = () => {
    if (!quickInput.trim()) return

    const parsed = parseNaturalLanguage(quickInput)
    createTask({
      title: parsed.title,
      description: '',
      status: 'todo',
      priority: parsed.priority || 'p2',
      dueDate: parsed.dueDate,
      estimatedHours: parsed.estimatedHours,
      tags: parsed.tags.length > 0 ? parsed.tags : undefined,
      progress: 0,
    })

    onClose()
  }

  const handleBulkAdd = () => {
    if (!quickInput.trim()) return

    // 每行一个任务
    const lines = quickInput.split('\n').filter(line => line.trim())
    const tasks = lines.map(line => {
      const parsed = parseNaturalLanguage(line)
      return {
        title: parsed.title,
        description: '',
        status: 'todo' as const,
        priority: parsed.priority || 'p2' as TaskPriority,
        dueDate: parsed.dueDate,
        estimatedHours: parsed.estimatedHours,
        tags: parsed.tags.length > 0 ? parsed.tags : undefined,
        progress: 0,
      }
    })

    bulkCreateTasks(tasks)
    onClose()
  }

  const handleDetailAdd = () => {
    if (!title.trim()) return

    const tags = tagsInput
      .split(/[,，\s]+/)
      .map(t => t.trim())
      .filter(Boolean)

    createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      status: 'todo',
      priority,
      dueDate: dueDate || undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      tags: tags.length > 0 ? tags : undefined,
      progress: 0,
    })

    onClose()
  }

  const handleQuickInputChange = (value: string) => {
    setQuickInput(value)
    setParsed(parseNaturalLanguage(value))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">快速添加任务</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 模式切换 */}
        <div className="flex gap-2 p-4 border-b">
          <Button
            variant={mode === 'quick' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('quick')}
            icon={Sparkles}
          >
            快速添加
          </Button>
          <Button
            variant={mode === 'detail' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('detail')}
          >
            详细表单
          </Button>
        </div>

        {/* 内容区 */}
        <div className="p-4">
          {mode === 'quick' ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  输入任务（支持自然语言）
                </Label>
                <Textarea
                  value={quickInput}
                  onChange={(e) => handleQuickInputChange(e.target.value)}
                  placeholder={"例如：\n明天下午开会 #工作 !p1\n完成报告撰写 2h\n学习 React 教程 @下周 #学习"}
                  className="min-h-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      if (quickInput.includes('\n')) {
                        handleBulkAdd()
                      } else {
                        handleQuickAdd()
                      }
                    }
                  }}
                />
              </div>

              {/* 解析预览 */}
              {parsed && parsed.title && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">解析预览：</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm">{parsed.title}</span>
                    {parsed.dueDate && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {parsed.dueDate}
                      </Badge>
                    )}
                    {parsed.estimatedHours && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {parsed.estimatedHours}小时
                      </Badge>
                    )}
                    {parsed.priority && (
                      <Badge variant="outline" className="text-xs">
                        {parsed.priority.toUpperCase()}
                      </Badge>
                    )}
                    {parsed.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 帮助文本 */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>💡 支持的语法：</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li><code className="text-xs bg-muted px-1 rounded">@明天</code> / <code className="text-xs bg-muted px-1 rounded">@今天</code> / <code className="text-xs bg-muted px-1 rounded">@下周</code> - 设置截止日期</li>
                  <li><code className="text-xs bg-muted px-1 rounded">#标签</code> - 添加标签（可多个）</li>
                  <li><code className="text-xs bg-muted px-1 rounded">!p0</code> / <code className="text-xs bg-muted px-1 rounded">!p1</code> / <code className="text-xs bg-muted px-1 rounded">!p2</code> / <code className="text-xs bg-muted px-1 rounded">!p3</code> - 设置优先级</li>
                  <li><code className="text-xs bg-muted px-1 rounded">2h</code> / <code className="text-xs bg-muted px-1 rounded">30m</code> - 设置估计时间</li>
                  <li>每行一个任务，支持批量添加</li>
                </ul>
                <p className="mt-2">快捷键：⌘/Ctrl + Enter 提交</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">任务标题 *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入任务标题"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">描述</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="输入任务描述（可选）"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">优先级</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p0">P0 - 紧急重要</SelectItem>
                      <SelectItem value="p1">P1 - 重要</SelectItem>
                      <SelectItem value="p2">P2 - 一般</SelectItem>
                      <SelectItem value="p3">P3 - 低优先级</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">截止日期</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">估计时间（小时）</Label>
                  <Input
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="例如：2"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">标签</Label>
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="用空格或逗号分隔"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={mode === 'quick' ? (quickInput.includes('\n') ? handleBulkAdd : handleQuickAdd) : handleDetailAdd}
            icon={Plus}
          >
            {mode === 'quick' ? (quickInput.includes('\n') ? '批量添加' : '添加') : '创建任务'}
          </Button>
        </div>
      </div>
    </div>
  )
}
