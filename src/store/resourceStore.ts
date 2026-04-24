import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/store/createSelectors'

/**
 * 资源类型
 */
export type ResourceType = 'time' | 'budget' | 'skill'

/**
 * 时间资源
 */
export interface TimeResource {
  id: string
  type: 'time'
  name: string
  dailyAvailable: number // 每日可用小时
  weeklyAvailable: number // 每周可用小时
  monthlyBudget: number // 每月预算小时
  used: number // 已使用小时
  createdAt: string
  updatedAt: string
}

/**
 * 资金资源
 */
export interface BudgetResource {
  id: string
  type: 'budget'
  name: string
  total: number // 总预算
  used: number // 已使用
  remaining: number // 剩余
  currency: string // 货币单位
  createdAt: string
  updatedAt: string
}

/**
 * 技能资源
 */
export interface SkillResource {
  id: string
  type: 'skill'
  name: string
  level: number // 技能等级 1-5
  category: string // 技能分类
  selfAssessment: number // 自评分数 1-10
  lastUsed: string // 最后使用时间
  createdAt: string
  updatedAt: string
}

export type Resource = TimeResource | BudgetResource | SkillResource

/**
 * 资源分配
 */
export interface ResourceAllocation {
  id: string
  resourceId: string
  resourceType: ResourceType
  targetId: string // 关联的目标或任务 ID
  targetType: 'goal' | 'task'
  allocatedAmount: number // 分配的数量（小时/金额）
  startDate: string
  endDate: string
  notes?: string
  createdAt: string
}

/**
 * 资源视图模式
 */
export type ResourceViewMode = 'overview' | 'time' | 'budget' | 'skill'

/**
 * 资源管理状态
 */
export interface ResourceState {
  // ========== 状态 ==========
  resources: Resource[]
  allocations: ResourceAllocation[]
  viewMode: ResourceViewMode

  // ========== 资源 CRUD ==========
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateResource: (id: string, updates: Partial<Resource>) => void
  deleteResource: (id: string) => void

  // ========== 资源分配 ==========
  addAllocation: (allocation: Omit<ResourceAllocation, 'id' | 'createdAt'>) => void
  deleteAllocation: (id: string) => void
  getAllocationsByResource: (resourceId: string) => ResourceAllocation[]

  // ========== 视图 ==========
  setViewMode: (mode: ResourceViewMode) => void

  // ========== 工具方法 ==========
  getTimeResources: () => TimeResource[]
  getBudgetResources: () => BudgetResource[]
  getSkillResources: () => SkillResource[]
  getResourceStats: () => {
    totalResources: number
    totalAllocations: number
    timeUtilization: number
    budgetUtilization: number
  }
}

export const useResourceStore = createSelectors(create<ResourceState>()(
  immer(persist(
    (set, get) => ({
      // ========== 初始状态 ==========
      resources: [],
      allocations: [],
      viewMode: 'overview',

      // ========== 资源 CRUD ==========
      addResource: (resource) => {
        set((state) => {
          const baseResource = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          state.resources.push({ ...resource, ...baseResource } as Resource)
        })
      },

      updateResource: (id, updates) => {
        set((state) => {
          const resource = state.resources.find(r => r.id === id)
          if (resource) {
            Object.assign(resource, updates, { updatedAt: new Date().toISOString() })
          }
        })
      },

      deleteResource: (id) => {
        set((state) => {
          state.resources = state.resources.filter(r => r.id !== id)
          state.allocations = state.allocations.filter(a => a.resourceId !== id)
        })
      },

      // ========== 资源分配 ==========
      addAllocation: (allocation) => {
        set((state) => {
          state.allocations.push({
            ...allocation,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          })
        })
      },

      deleteAllocation: (id) => {
        set((state) => {
          state.allocations = state.allocations.filter(a => a.id !== id)
        })
      },

      getAllocationsByResource: (resourceId) => {
        const { allocations } = get()
        return allocations.filter(a => a.resourceId === resourceId)
      },

      // ========== 视图 ==========
      setViewMode: (mode) => {
        set({ viewMode: mode })
      },

      // ========== 工具方法 ==========
      getTimeResources: () => {
        const { resources } = get()
        return resources.filter((r): r is TimeResource => r.type === 'time')
      },

      getBudgetResources: () => {
        const { resources } = get()
        return resources.filter((r): r is BudgetResource => r.type === 'budget')
      },

      getSkillResources: () => {
        const { resources } = get()
        return resources.filter((r): r is SkillResource => r.type === 'skill')
      },

      getResourceStats: () => {
        const { resources, allocations } = get()
        const timeResources = resources.filter((r): r is TimeResource => r.type === 'time')
        const budgetResources = resources.filter((r): r is BudgetResource => r.type === 'budget')

        const totalTimeAvailable = timeResources.reduce((sum, r) => sum + r.monthlyBudget, 0)
        const totalTimeUsed = timeResources.reduce((sum, r) => sum + r.used, 0)
        const totalBudget = budgetResources.reduce((sum, r) => sum + r.total, 0)
        const totalBudgetUsed = budgetResources.reduce((sum, r) => sum + r.used, 0)

        return {
          totalResources: resources.length,
          totalAllocations: allocations.length,
          timeUtilization: totalTimeAvailable > 0 ? (totalTimeUsed / totalTimeAvailable) * 100 : 0,
          budgetUtilization: totalBudget > 0 ? (totalBudgetUsed / totalBudget) * 100 : 0,
        }
      },
    }),
    {
      name: 'chrono-focus-resources',
      partialize: (state) => ({
        resources: state.resources,
        allocations: state.allocations,
        viewMode: state.viewMode,
      }),
    },
  )),
))
