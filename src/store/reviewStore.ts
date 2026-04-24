import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/store/createSelectors'

/**
 * 复盘周期类型
 */
export type ReviewPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

/**
 * 复盘类型
 */
export type ReviewType = 'goal' | 'project' | 'learning' | 'work' | 'health' | 'custom'

/**
 * 复盘模板
 */
export interface ReviewTemplate {
  id: string
  name: string
  type: ReviewType
  description: string
  sections: ReviewSection[]
  createdAt: string
}

/**
 * 复盘区块
 */
export interface ReviewSection {
  id: string
  title: string
  description?: string
  placeholder: string
  order: number
}

/**
 * 复盘记录
 */
export interface Review {
  id: string
  title: string
  period: ReviewPeriod
  type: ReviewType
  periodStart: string
  periodEnd: string
  templateId?: string

  // 数据快照
  plannedTasks: number
  completedTasks: number
  achievementRate: number
  goalsProgress: number

  // 复盘内容
  highlights: string[]
  issues: string[]
  improvements: string[]
  nextPlan: string[]

  // 评分
  overallScore: number // 1-10
  executionScore: number // 1-10
  learningScore: number // 1-10

  notes?: string
  tags?: string[]

  createdAt: string
  updatedAt: string
}

/**
 * 复盘视图模式
 */
export type ReviewViewMode = 'timeline' | 'list' | 'calendar'

/**
 * 复盘筛选条件
 */
export interface ReviewFilters {
  search: string
  period: ReviewPeriod | 'all'
  type: ReviewType | 'all'
  tag: string | 'all'
  dateRange: { start?: string; end?: string } | 'all'
}

/**
 * 复盘管理状态
 */
export interface ReviewState {
  // ========== 状态 ==========
  /** 复盘记录 */
  reviews: Review[]
  /** 复盘模板 */
  templates: ReviewTemplate[]
  /** 当前视图模式 */
  viewMode: ReviewViewMode
  /** 当前筛选条件 */
  filters: ReviewFilters
  /** 当前选中的复盘 ID */
  selectedReviewId: string | null

  // ========== 复盘 CRUD ==========
  /** 创建复盘记录 */
  createReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => void
  /** 更新复盘记录 */
  updateReview: (id: string, updates: Partial<Review>) => void
  /** 删除复盘记录 */
  deleteReview: (id: string) => void
  /** 设置选中的复盘 */
  setSelectedReview: (id: string | null) => void

  // ========== 模板管理 ==========
  /** 添加模板 */
  addTemplate: (template: Omit<ReviewTemplate, 'id' | 'createdAt'>) => void
  /** 删除模板 */
  deleteTemplate: (id: string) => void
  /** 从模板创建复盘 */
  createReviewFromTemplate: (templateId: string, period: ReviewPeriod, startDate: string, endDate: string) => void

  // ========== 视图和筛选 ==========
  /** 设置视图模式 */
  setViewMode: (mode: ReviewViewMode) => void
  /** 设置筛选条件 */
  setFilters: (filters: Partial<ReviewFilters>) => void
  /** 重置筛选 */
  resetFilters: () => void

  // ========== 数据收集 ==========
  /** 自动收集周期数据 */
  collectPeriodData: (startDate: string, endDate: string) => {
    plannedTasks: number
    completedTasks: number
    achievementRate: number
    goalsProgress: number
  }

  // ========== 工具方法 ==========
  /** 获取筛选后的复盘 */
  getFilteredReviews: () => Review[]
  /** 获取所有标签 */
  getAllTags: () => string[]
  /** 获取复盘统计 */
  getReviewStats: () => {
    total: number
    avgScore: number
    avgAchievementRate: number
    byPeriod: Record<ReviewPeriod, number>
    byType: Record<ReviewType, number>
  }
}

export const useReviewStore = createSelectors(create<ReviewState>()(
  immer(persist(
    (set, get) => ({
      // ========== 初始状态 ==========
      reviews: [],
      templates: [],
      viewMode: 'timeline',
      filters: {
        search: '',
        period: 'all',
        type: 'all',
        tag: 'all',
        dateRange: 'all',
      },
      selectedReviewId: null,

      // ========== 复盘 CRUD ==========
      createReview: (review) => {
        set((state) => {
          state.reviews.unshift({
            ...review,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        })
      },

      updateReview: (id, updates) => {
        set((state) => {
          const review = state.reviews.find(r => r.id === id)
          if (review) {
            Object.assign(review, updates, { updatedAt: new Date().toISOString() })
          }
        })
      },

      deleteReview: (id) => {
        set((state) => {
          state.reviews = state.reviews.filter(r => r.id !== id)
          if (state.selectedReviewId === id) {
            state.selectedReviewId = null
          }
        })
      },

      setSelectedReview: (id) => {
        set({ selectedReviewId: id })
      },

      // ========== 模板管理 ==========
      addTemplate: (template) => {
        set((state) => {
          state.templates.push({
            ...template,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          })
        })
      },

      deleteTemplate: (id) => {
        set((state) => {
          state.templates = state.templates.filter(t => t.id !== id)
        })
      },

      createReviewFromTemplate: (templateId, period, startDate, endDate) => {
        const { templates } = get()
        const template = templates.find(t => t.id === templateId)
        if (template) {
          const { createReview } = get()
          createReview({
            title: `${template.name} - ${period === 'weekly' ? '周' : period === 'monthly' ? '月' : period === 'quarterly' ? '季' : '年'}度复盘`,
            period,
            type: template.type,
            periodStart: startDate,
            periodEnd: endDate,
            templateId,
            plannedTasks: 0,
            completedTasks: 0,
            achievementRate: 0,
            goalsProgress: 0,
            highlights: [],
            issues: [],
            improvements: [],
            nextPlan: [],
            overallScore: 5,
            executionScore: 5,
            learningScore: 5,
          })
        }
      },

      // ========== 视图和筛选 ==========
      setViewMode: (mode) => {
        set({ viewMode: mode })
      },

      setFilters: (filters) => {
        set((state) => {
          state.filters = { ...state.filters, ...filters }
        })
      },

      resetFilters: () => {
        set({
          filters: {
            search: '',
            period: 'all',
            type: 'all',
            tag: 'all',
            dateRange: 'all',
          },
        })
      },

      // ========== 数据收集 ==========
      collectPeriodData: (_startDate, _endDate) => {
        // 这里简化实现，实际应该集成 taskStore 和 goalStore
        return {
          plannedTasks: 0,
          completedTasks: 0,
          achievementRate: 0,
          goalsProgress: 0,
        }
      },

      // ========== 工具方法 ==========
      getFilteredReviews: () => {
        const { reviews, filters } = get()

        return reviews.filter(review => {
          // 搜索过滤
          if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            if (!review.title.toLowerCase().includes(searchLower)) {
              return false
            }
          }

          // 周期过滤
          if (filters.period !== 'all' && review.period !== filters.period) {
            return false
          }

          // 类型过滤
          if (filters.type !== 'all' && review.type !== filters.type) {
            return false
          }

          // 标签过滤
          if (filters.tag !== 'all' && (!review.tags || !review.tags.includes(filters.tag))) {
            return false
          }

          // 日期范围过滤
          if (filters.dateRange !== 'all') {
            const reviewDate = new Date(review.createdAt)
            if (filters.dateRange.start && reviewDate < new Date(filters.dateRange.start)) {
              return false
            }
            if (filters.dateRange.end && reviewDate > new Date(filters.dateRange.end)) {
              return false
            }
          }

          return true
        })
      },

      getAllTags: () => {
        const { reviews } = get()
        const tagSet = new Set<string>()
        reviews.forEach(r => r.tags?.forEach(tag => tagSet.add(tag)))
        return Array.from(tagSet)
      },

      getReviewStats: () => {
        const { reviews } = get()

        const total = reviews.length
        const avgScore = total > 0 ? reviews.reduce((sum, r) => sum + r.overallScore, 0) / total : 0
        const avgAchievementRate = total > 0 ? reviews.reduce((sum, r) => sum + r.achievementRate, 0) / total : 0

        const byPeriod = {
          weekly: reviews.filter(r => r.period === 'weekly').length,
          monthly: reviews.filter(r => r.period === 'monthly').length,
          quarterly: reviews.filter(r => r.period === 'quarterly').length,
          yearly: reviews.filter(r => r.period === 'yearly').length,
          custom: reviews.filter(r => r.period === 'custom').length,
        }

        const byType = {
          goal: reviews.filter(r => r.type === 'goal').length,
          project: reviews.filter(r => r.type === 'project').length,
          learning: reviews.filter(r => r.type === 'learning').length,
          work: reviews.filter(r => r.type === 'work').length,
          health: reviews.filter(r => r.type === 'health').length,
          custom: reviews.filter(r => r.type === 'custom').length,
        }

        return { total, avgScore, avgAchievementRate, byPeriod, byType }
      },
    }),
    {
      name: 'chrono-focus-reviews',
      partialize: (state) => ({
        reviews: state.reviews,
        templates: state.templates,
        viewMode: state.viewMode,
        filters: state.filters,
        selectedReviewId: state.selectedReviewId,
      }),
    },
  )),
))
