import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/store/createSelectors'

import { useGoalStore } from '@/store/goalStore'
import { useTaskStore } from '@/store/taskStore'
import { useReviewStore } from '@/store/reviewStore'
import { useResourceStore } from '@/store/resourceStore'
import { usePDCAStore } from '@/store/pdcaStore'

/**
 * 时间周期类型
 */
export type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all'

/**
 * 指标数据
 */
export interface MetricData {
  current: number
  previous: number
  change: number // 变化百分比
  trend: 'up' | 'down' | 'stable'
}

/**
 * 仪表盘数据
 */
export interface DashboardData {
  // 目标指标
  goals: {
    total: MetricData
    completed: MetricData
    progress: MetricData
  }
  // 任务指标
  tasks: {
    total: MetricData
    completed: MetricData
    completionRate: MetricData
  }
  // 复盘指标
  reviews: {
    total: MetricData
    avgScore: MetricData
  }
  // 资源指标
  resources: {
    timeUtilization: MetricData
    budgetUtilization: MetricData
  }
  // PDCA 指标
  pdca: {
    activeCycles: MetricData
    completedCycles: MetricData
  }
}

/**
 * 趋势数据点
 */
export interface TrendPoint {
  date: string
  value: number
  label: string
}

/**
 * 报表类型
 */
export type ReportType = 'weekly' | 'monthly' | 'quarterly' | 'custom'

/**
 * 报表数据
 */
export interface ReportData {
  id: string
  type: ReportType
  title: string
  period: { start: string; end: string }
  generatedAt: string
  summary: string
  metrics: Record<string, number>
  insights: string[]
  recommendations: string[]
}

/**
 * 数据分析状态
 */
export interface AnalyticsState {
  // ========== 状态 ==========
  selectedPeriod: TimePeriod
  reports: ReportData[]

  // ========== 视图 ==========
  setPeriod: (period: TimePeriod) => void

  // ========== 数据获取 ==========
  getDashboardData: () => DashboardData
  getGoalTrend: (period: TimePeriod) => TrendPoint[]
  getTaskTrend: (period: TimePeriod) => TrendPoint[]
  getReviewTrend: (period: TimePeriod) => TrendPoint[]
  getResourceTrend: (period: TimePeriod) => TrendPoint[]

  // ========== 报表 ==========
  generateReport: (type: ReportType, startDate: string, endDate: string) => ReportData
  deleteReport: (id: string) => void
  getReports: () => ReportData[]

  // ========== 洞察 ==========
  getInsights: () => string[]
  getRecommendations: () => string[]
  getProductivityScore: () => number
}

// ========== 辅助函数 ==========

function calculateMetric(current: number, previous: number): MetricData {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0
  return {
    current,
    previous,
    change: Math.round(change * 100) / 100,
    trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
  }
}

function generateDateRange(period: TimePeriod): string[] {
  const dates: string[] = []
  const now = new Date()
  const days = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

export const useAnalyticsStore = createSelectors(create<AnalyticsState>()(
  immer(persist(
    (set, get) => ({
      // ========== 初始状态 ==========
      selectedPeriod: 'month',
      reports: [],

      // ========== 视图 ==========
      setPeriod: (period) => {
        set({ selectedPeriod: period })
      },

      // ========== 数据获取 ==========
      getDashboardData: () => {
        const goalStats = useGoalStore.getState()
        const taskStats = useTaskStore.getState()
        const reviewStats = useReviewStore.getState()
        const resourceStats = useResourceStore.getState()
        const pdcaStats = usePDCAStore.getState()

        return {
          goals: {
            total: calculateMetric(goalStats.goals.length, goalStats.goals.length * 0.8),
            completed: calculateMetric(
              goalStats.goals.filter(g => g.status === 'completed').length,
              goalStats.goals.filter(g => g.status === 'completed').length * 0.8
            ),
            progress: calculateMetric(
              goalStats.goals.reduce((sum, g) => sum + g.progress, 0) / (goalStats.goals.length || 1),
              70
            ),
          },
          tasks: {
            total: calculateMetric(taskStats.tasks.length, taskStats.tasks.length * 0.9),
            completed: calculateMetric(
              taskStats.tasks.filter(t => t.status === 'completed').length,
              taskStats.tasks.filter(t => t.status === 'completed').length * 0.9
            ),
            completionRate: calculateMetric(
              taskStats.tasks.length > 0
                ? (taskStats.tasks.filter(t => t.status === 'completed').length / taskStats.tasks.length) * 100
                : 0,
              65
            ),
          },
          reviews: {
            total: calculateMetric(reviewStats.reviews.length, reviewStats.reviews.length * 0.8),
            avgScore: calculateMetric(
              reviewStats.reviews.length > 0
                ? reviewStats.reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviewStats.reviews.length
                : 0,
              6.5
            ),
          },
          resources: {
            timeUtilization: calculateMetric(
              resourceStats.resources.filter(r => r.type === 'time').reduce((sum, r) => sum + (r as any).used, 0),
              100
            ),
            budgetUtilization: calculateMetric(
              resourceStats.resources.filter(r => r.type === 'budget').reduce((sum, r) => sum + (r as any).used, 0),
              5000
            ),
          },
          pdca: {
            activeCycles: calculateMetric(
              pdcaStats.cycles.filter(c => c.status === 'active').length,
              2
            ),
            completedCycles: calculateMetric(
              pdcaStats.cycles.filter(c => c.status === 'completed').length,
              3
            ),
          },
        }
      },

      getGoalTrend: (period) => {
        const goals = useGoalStore.getState().goals
        const dates = generateDateRange(period)

        return dates.map(date => {
          const goalsByDate = goals.filter(g => g.createdAt <= date)
          const completedByDate = goalsByDate.filter(g => g.status === 'completed')
          return {
            date,
            value: goalsByDate.length > 0
              ? (completedByDate.length / goalsByDate.length) * 100
              : 0,
            label: `${completedByDate.length}/${goalsByDate.length}`,
          }
        })
      },

      getTaskTrend: (period) => {
        const tasks = useTaskStore.getState().tasks
        const dates = generateDateRange(period)

        return dates.map(date => {
          const tasksByDate = tasks.filter(t => t.createdAt <= date)
          const completedByDate = tasksByDate.filter(t => t.status === 'completed')
          return {
            date,
            value: tasksByDate.length > 0
              ? (completedByDate.length / tasksByDate.length) * 100
              : 0,
            label: `${completedByDate.length}/${tasksByDate.length}`,
          }
        })
      },

      getReviewTrend: (period) => {
        const reviews = useReviewStore.getState().reviews
        const dates = generateDateRange(period)

        return dates.map(date => {
          const reviewsByDate = reviews.filter(r => r.createdAt <= date)
          const avgScore = reviewsByDate.length > 0
            ? reviewsByDate.reduce((sum, r) => sum + r.overallScore, 0) / reviewsByDate.length
            : 0
          return {
            date,
            value: avgScore * 10,
            label: avgScore.toFixed(1),
          }
        })
      },

      getResourceTrend: (period) => {
        const resources = useResourceStore.getState().resources
        const dates = generateDateRange(period)
        const timeResources = resources.filter(r => r.type === 'time')

        return dates.map(date => ({
          date,
          value: timeResources.reduce((sum, r) => sum + (r as any).used, 0),
          label: `${timeResources.reduce((sum, r) => sum + (r as any).used, 0)}h`,
        }))
      },

      // ========== 报表 ==========
      generateReport: (type, startDate, endDate) => {
        const dashboardData = get().getDashboardData()
        const insights = get().getInsights()
        const recommendations = get().getRecommendations()

        const report: ReportData = {
          id: crypto.randomUUID(),
          type,
          title: `${type === 'weekly' ? '周报' : type === 'monthly' ? '月报' : type === 'quarterly' ? '季报' : '自定义'} - ${startDate} 至 ${endDate}`,
          period: { start: startDate, end: endDate },
          generatedAt: new Date().toISOString(),
          summary: `本期共完成 ${dashboardData.tasks.completed.current} 个任务，目标完成率 ${dashboardData.tasks.completionRate.current.toFixed(1)}%`,
          metrics: {
            goalsCompleted: dashboardData.goals.completed.current,
            tasksCompleted: dashboardData.tasks.completed.current,
            taskCompletionRate: dashboardData.tasks.completionRate.current,
            reviewAvgScore: dashboardData.reviews.avgScore.current,
            timeUtilization: dashboardData.resources.timeUtilization.current,
          },
          insights,
          recommendations,
        }

        set((state) => {
          state.reports.unshift(report)
        })

        return report
      },

      deleteReport: (id) => {
        set((state) => {
          state.reports = state.reports.filter(r => r.id !== id)
        })
      },

      getReports: () => {
        return get().reports
      },

      // ========== 洞察 ==========
      getInsights: () => {
        const goalStats = useGoalStore.getState()
        const taskStats = useTaskStore.getState()
        const reviewStats = useReviewStore.getState()

        const insights: string[] = []

        // 目标洞察
        const completionRate = goalStats.goals.length > 0
          ? (goalStats.goals.filter(g => g.status === 'completed').length / goalStats.goals.length) * 100
          : 0

        if (completionRate > 80) {
          insights.push('🎯 目标完成率优秀，达到 ' + completionRate.toFixed(1) + '%')
        } else if (completionRate < 50) {
          insights.push('⚠️ 目标完成率偏低，仅 ' + completionRate.toFixed(1) + '%，建议调整目标设定')
        }

        // 任务洞察
        const taskCompletionRate = taskStats.tasks.length > 0
          ? (taskStats.tasks.filter(t => t.status === 'completed').length / taskStats.tasks.length) * 100
          : 0

        if (taskCompletionRate > 70) {
          insights.push('✅ 任务执行效率良好，完成率 ' + taskCompletionRate.toFixed(1) + '%')
        }

        // 复盘洞察
        if (reviewStats.reviews.length > 0) {
          const avgScore = reviewStats.reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviewStats.reviews.length
          insights.push('📊 平均复盘评分 ' + avgScore.toFixed(1) + '/10')
        } else {
          insights.push('💡 建议开始定期复盘，帮助持续改进')
        }

        return insights
      },

      getRecommendations: () => {
        const goalStats = useGoalStore.getState()
        const taskStats = useTaskStore.getState()

        const recommendations: string[] = []

        // 基于数据给出建议
        const activeGoals = goalStats.goals.filter(g => g.status === 'active').length
        if (activeGoals > 5) {
          recommendations.push('🎯 活跃目标较多（' + activeGoals + '个），建议聚焦 2-3 个核心目标')
        }

        const pendingTasks = taskStats.tasks.filter(t => t.status === 'todo').length
        if (pendingTasks > 20) {
          recommendations.push('📋 待办任务较多（' + pendingTasks + '个），建议优先处理高优先级任务')
        }

        const overdueTasks = taskStats.tasks.filter(t => {
          if (!t.dueDate || t.status === 'completed') return false
          return new Date(t.dueDate) < new Date()
        }).length

        if (overdueTasks > 0) {
          recommendations.push('⏰ 有 ' + overdueTasks + ' 个任务已过期，建议及时处理或调整截止日期')
        }

        if (recommendations.length === 0) {
          recommendations.push('✨ 当前状态良好，继续保持！')
        }

        return recommendations
      },

      getProductivityScore: () => {
        const goalStats = useGoalStore.getState()
        const taskStats = useTaskStore.getState()
        const reviewStats = useReviewStore.getState()

        // 计算生产力得分（0-100）
        let score = 50 // 基础分

        // 目标完成（最多 +20 分）
        const goalCompletionRate = goalStats.goals.length > 0
          ? (goalStats.goals.filter(g => g.status === 'completed').length / goalStats.goals.length) * 100
          : 0
        score += (goalCompletionRate / 100) * 20

        // 任务完成（最多 +20 分）
        const taskCompletionRate = taskStats.tasks.length > 0
          ? (taskStats.tasks.filter(t => t.status === 'completed').length / taskStats.tasks.length) * 100
          : 0
        score += (taskCompletionRate / 100) * 20

        // 复盘评分（最多 +10 分）
        if (reviewStats.reviews.length > 0) {
          const avgScore = reviewStats.reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviewStats.reviews.length
          score += (avgScore / 10) * 10
        }

        return Math.min(Math.round(score), 100)
      },
    }),
    {
      name: 'chrono-focus-analytics',
      partialize: (state) => ({
        selectedPeriod: state.selectedPeriod,
        reports: state.reports,
      }),
    },
  )),
))
