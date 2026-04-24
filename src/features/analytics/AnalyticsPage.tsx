import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/segmented'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useAnalyticsStore, type TimePeriod, type ReportType, type ReportData } from '@/store/analyticsStore'

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  CheckCircle2,
  FileText,
  Award,
  Download,
  Plus,
  Trash2,
  Brain,
  BarChart3,
} from 'lucide-react'

function MetricCard({ title, value, metric, icon: Icon, color }: {
  title: string
  value: string | number
  metric: { change: number; trend: 'up' | 'down' | 'stable' }
  icon: any
  color: string
}) {
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus
  const trendColor = metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
          <span className="text-muted-foreground">vs 上期</span>
        </div>
      </CardContent>
    </Card>
  )
}

function TrendChart({ title, data, color }: {
  title: string
  data: Array<{ date: string; value: number; label: string }>
  color: string
}) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data.map(d => d.value), 1)
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (d.value / maxValue) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
            <span>{data[0]?.date}</span>
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
        <div className="text-center mt-2 text-sm font-medium" style={{ color }}>
          当前值: {data[data.length - 1]?.label}
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsPage() {
  const [showReportForm, setShowReportForm] = useState(false)
  const selectedPeriod = useAnalyticsStore.use.selectedPeriod()
  const setPeriod = useAnalyticsStore.use.setPeriod()
  const reports = useAnalyticsStore.use.reports()
  const generateReport = useAnalyticsStore.use.generateReport()
  const deleteReport = useAnalyticsStore.use.deleteReport()

  // 直接调用 store 的方法
  const store = useAnalyticsStore.getState()
  const dashboard = store.getDashboardData()
  const goalTrend = store.getGoalTrend(selectedPeriod)
  const taskTrend = store.getTaskTrend(selectedPeriod)
  const reviewTrend = store.getReviewTrend(selectedPeriod)
  const insights = store.getInsights()
  const recommendations = store.getRecommendations()
  const productivityScore = store.getProductivityScore()

  return (
    <div className="max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            数据分析
          </h1>
          <p className="text-muted-foreground mt-1">
            全面的数据洞察和趋势分析
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowReportForm(true)} icon={Plus}>
            生成报表
          </Button>
        </div>
      </div>

      {/* 周期选择和生产力得分 */}
      <div className="flex items-center justify-between mb-6">
        <Segmented
          value={selectedPeriod}
          onChange={(value) => setPeriod(value as TimePeriod)}
          options={[
            { label: '本周', value: 'week' },
            { label: '本月', value: 'month' },
            { label: '本季', value: 'quarter' },
            { label: '全年', value: 'year' },
            { label: '全部', value: 'all' },
          ]}
        />

        <Card className="w-48">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">生产力得分</p>
            <p className={`text-4xl font-bold ${
              productivityScore >= 80 ? 'text-green-500' :
              productivityScore >= 60 ? 'text-blue-500' :
              productivityScore >= 40 ? 'text-orange-500' : 'text-red-500'
            }`}>
              {productivityScore}
            </p>
            <p className="text-xs text-muted-foreground">/ 100</p>
          </CardContent>
        </Card>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="目标总数"
          value={dashboard.goals.total.current}
          metric={dashboard.goals.total}
          icon={Target}
          color="bg-blue-500"
        />
        <MetricCard
          title="已完成目标"
          value={dashboard.goals.completed.current}
          metric={dashboard.goals.completed}
          icon={CheckCircle2}
          color="bg-green-500"
        />
        <MetricCard
          title="任务完成率"
          value={`${dashboard.tasks.completionRate.current.toFixed(1)}%`}
          metric={dashboard.tasks.completionRate}
          icon={FileText}
          color="bg-purple-500"
        />
        <MetricCard
          title="平均复盘评分"
          value={dashboard.reviews.avgScore.current.toFixed(1)}
          metric={dashboard.reviews.avgScore}
          icon={Award}
          color="bg-orange-500"
        />
      </div>

      {/* 趋势图表 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <TrendChart
          title="目标完成趋势"
          data={goalTrend}
          color="#3b82f6"
        />
        <TrendChart
          title="任务完成趋势"
          data={taskTrend}
          color="#8b5cf6"
        />
        <TrendChart
          title="复盘评分趋势"
          data={reviewTrend}
          color="#f97316"
        />
      </div>

      {/* 洞察和建议 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              数据洞察
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight: string, index: number) => (
                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-sm text-muted-foreground">暂无足够数据生成洞察</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              改进建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec: string, index: number) => (
                <div key={index} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 报表列表 */}
      {reports.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">历史报表</h2>
          <div className="space-y-3">
            {reports.map(report => (
              <ReportCard key={report.id} report={report} onDelete={deleteReport} />
            ))}
          </div>
        </div>
      )}

      {/* 生成报表面板 */}
      {showReportForm && (
        <ReportForm
          onClose={() => setShowReportForm(false)}
          onSubmit={(type, start, end) => {
            generateReport(type, start, end)
            setShowReportForm(false)
          }}
        />
      )}
    </div>
  )
}

function ReportCard({ report, onDelete }: { report: ReportData; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium mb-1">{report.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{report.summary}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>生成时间: {new Date(report.generatedAt).toLocaleString('zh-CN')}</span>
              <Badge variant="outline">
                {report.type === 'weekly' ? '周报' :
                 report.type === 'monthly' ? '月报' :
                 report.type === 'quarterly' ? '季报' : '自定义'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={Download}>
              导出
            </Button>
            <button
              onClick={() => onDelete(report.id)}
              className="p-2 text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReportForm({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (type: ReportType, start: string, end: string) => void
}) {
  const [type, setType] = useState<ReportType>('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) return
    onSubmit(type, startDate, endDate)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">生成报表</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label>报表类型</Label>
            <Select value={type} onValueChange={(v) => setType(v as ReportType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">周报</SelectItem>
                <SelectItem value="monthly">月报</SelectItem>
                <SelectItem value="quarterly">季报</SelectItem>
                <SelectItem value="custom">自定义</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>开始日期</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <Label>结束日期</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              取消
            </Button>
            <Button type="submit" className="flex-1">
              生成
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
