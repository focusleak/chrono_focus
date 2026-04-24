import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useGoalStore } from '@/store/goalStore'
import { defaultGoalTemplates } from './goalTemplates'

import type { GoalTemplateCategory } from '@/types'

import { Briefcase, GraduationCap, Heart, Coins, User, Search, Check } from 'lucide-react'

const categoryConfig = {
  work: {
    label: '工作',
    icon: Briefcase,
    color: 'bg-blue-500',
  },
  learning: {
    label: '学习',
    icon: GraduationCap,
    color: 'bg-green-500',
  },
  health: {
    label: '健康',
    icon: Heart,
    color: 'bg-red-500',
  },
  finance: {
    label: '财务',
    icon: Coins,
    color: 'bg-yellow-500',
  },
  personal: {
    label: '个人',
    icon: User,
    color: 'bg-purple-500',
  },
}

export function GoalTemplateSelector({ onSelect }: { onSelect: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<GoalTemplateCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const createGoalFromTemplate = useGoalStore.use.createGoalFromTemplate()

  // 初始化模板（只在第一次渲染时）
  const templates = useGoalStore.use.templates()
  const addTemplate = useGoalStore.use.addTemplate()

  // 如果模板库为空，添加默认模板
  if (templates.length === 0) {
    defaultGoalTemplates.forEach((template) => {
      addTemplate({
        name: template.name,
        category: template.category,
        description: template.description,
        goal: {
          ...template.goal,
          startDate: '',
          dueDate: '',
        } as any,
      })
    })
  }

  const allTemplates = useGoalStore.use.templates()

  // 过滤模板
  const filteredTemplates = allTemplates.filter((template) => {
    const matchCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const handleUseTemplate = (templateId: string) => {
    createGoalFromTemplate(templateId)
    onSelect()
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索模板..."
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            全部
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key as GoalTemplateCategory)}
                icon={Icon}
              >
                {config.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* 模板列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const config = categoryConfig[template.category]
          const Icon = config.icon

          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 line-clamp-2">
                  {template.description}
                </CardDescription>
                <Button
                  onClick={() => handleUseTemplate(template.id)}
                  className="w-full"
                  icon={Check}
                >
                  使用此模板
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">没有找到匹配的模板</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
