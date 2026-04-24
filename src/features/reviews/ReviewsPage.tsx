import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/segmented'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useReviewStore, type Review, type ReviewPeriod, type ReviewType, type ReviewViewMode } from '@/store/reviewStore'
import { PERIOD_CONFIG, TYPE_CONFIG } from './reviewTemplates'

import {
  Plus,
  Search,
  X,
  List,
  Calendar,
  TrendingUp,
  Award,
  Target,
  FileText,
} from 'lucide-react'

function ReviewCard({ review, onClick }: { review: Review; onClick: () => void }) {
  const periodConfig = PERIOD_CONFIG[review.period]
  const typeConfig = TYPE_CONFIG[review.type]

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {periodConfig.icon} {periodConfig.label}
              </Badge>
              <Badge className={`text-xs ${typeConfig.color}`}>
                {typeConfig.label}
              </Badge>
            </div>
            <CardTitle className="text-lg">{review.title}</CardTitle>
            <CardDescription>
              {review.periodStart} 至 {review.periodEnd}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{review.overallScore}/10</div>
            <p className="text-xs text-muted-foreground">综合评分</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">任务完成率</p>
            <p className="text-lg font-semibold">{review.achievementRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">目标进度</p>
            <p className="text-lg font-semibold">{review.goalsProgress}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">亮点/问题</p>
            <p className="text-lg font-semibold">{review.highlights.length}/{review.issues.length}</p>
          </div>
        </div>

        {/* 亮点预览 */}
        {review.highlights.length > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg mb-3">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">亮点</p>
            <p className="text-xs text-green-600 dark:text-green-500 line-clamp-2">
              {review.highlights[0]}
            </p>
          </div>
        )}

        {/* 标签 */}
        <div className="flex items-center gap-2 flex-wrap">
          {review.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ReviewsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)

  const viewMode = useReviewStore.use.viewMode()
  const setViewMode = useReviewStore.use.setViewMode()
  const filters = useReviewStore.use.filters()
  const setFilters = useReviewStore.use.setFilters()
  const resetFilters = useReviewStore.use.resetFilters()
  const reviews = useReviewStore.use.reviews()
  const allTags = Array.from(new Set(reviews.flatMap((r: Review) => r.tags || [])))

  // 手动筛选
  const filteredReviews = reviews.filter((review: Review) => {
    if (filters.search && !review.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.period !== 'all' && review.period !== filters.period) return false
    if (filters.type !== 'all' && review.type !== filters.type) return false
    if (filters.tag !== 'all' && (!review.tags || !review.tags.includes(filters.tag))) return false
    return true
  })

  const tags = allTags
  const stats = {
    total: reviews.length,
    avgScore: reviews.length > 0 ? reviews.reduce((sum: number, r: Review) => sum + r.overallScore, 0) / reviews.length : 0,
    avgAchievementRate: reviews.length > 0 ? reviews.reduce((sum: number, r: Review) => sum + r.achievementRate, 0) / reviews.length : 0,
    byPeriod: {
      weekly: reviews.filter((r: Review) => r.period === 'weekly').length,
      monthly: reviews.filter((r: Review) => r.period === 'monthly').length,
      quarterly: reviews.filter((r: Review) => r.period === 'quarterly').length,
      yearly: reviews.filter((r: Review) => r.period === 'yearly').length,
      custom: reviews.filter((r: Review) => r.period === 'custom').length,
    }
  }

  if (isCreating || selectedReviewId) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => {
            setIsCreating(false)
            setSelectedReviewId(null)
          }}
          className="mb-4"
        >
          返回复盘列表
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{selectedReviewId ? '复盘详情' : '创建复盘'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">功能开发中...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">复盘系统</h1>
          <p className="text-muted-foreground mt-1">
            周期性复盘，持续改进和成长
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} icon={Plus}>
          创建复盘
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">复盘总数</span>
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium">平均评分</span>
            </div>
            <div className="text-3xl font-bold">{stats.avgScore.toFixed(1)}/10</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">平均完成率</span>
            </div>
            <div className="text-3xl font-bold">{stats.avgAchievementRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">本周复盘</span>
            </div>
            <div className="text-3xl font-bold">{stats.byPeriod.weekly}</div>
          </CardContent>
        </Card>
      </div>

      {/* 视图切换和筛选器 */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as ReviewViewMode)}
            options={[
              { label: '时间轴', value: 'timeline', icon: Calendar },
              { label: '列表', value: 'list', icon: List },
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
                  placeholder="搜索复盘记录..."
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">复盘周期</label>
                  <Select
                    value={filters.period}
                    onValueChange={(value) => setFilters({ period: value as ReviewPeriod | 'all' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部周期</SelectItem>
                      <SelectItem value="weekly">周复盘</SelectItem>
                      <SelectItem value="monthly">月复盘</SelectItem>
                      <SelectItem value="quarterly">季复盘</SelectItem>
                      <SelectItem value="yearly">年复盘</SelectItem>
                      <SelectItem value="custom">自定义</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">复盘类型</label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters({ type: value as ReviewType | 'all' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="work">工作复盘</SelectItem>
                      <SelectItem value="project">项目复盘</SelectItem>
                      <SelectItem value="learning">学习复盘</SelectItem>
                      <SelectItem value="goal">目标复盘</SelectItem>
                      <SelectItem value="health">健康复盘</SelectItem>
                      <SelectItem value="custom">自定义</SelectItem>
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
                      {tags.map((tag: string) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 清除筛选 */}
              {(filters.search || filters.period !== 'all' || filters.type !== 'all' || filters.tag !== 'all') && (
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

      {/* 复盘列表 */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">暂无复盘记录</h3>
            <p className="text-muted-foreground mb-6 text-center">
              开始创建你的第一次复盘记录，养成定期复盘的好习惯
            </p>
            <Button onClick={() => setIsCreating(true)} icon={Plus}>
              创建复盘
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review: Review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onClick={() => setSelectedReviewId(review.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
