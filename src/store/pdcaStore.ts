import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/store/createSelectors'

/**
 * PDCA 阶段
 */
export type PDCAStage = 'plan' | 'do' | 'check' | 'act'

/**
 * 风险等级
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * 风险状态
 */
export type RiskStatus = 'identified' | 'monitoring' | 'mitigated' | 'occurred' | 'closed'

/**
 * 风险项
 */
export interface Risk {
  id: string
  title: string
  description?: string
  category: 'technical' | 'resource' | 'external' | 'other'
  probability: number // 1-5
  impact: number // 1-5
  score: number // probability * impact
  status: RiskStatus
  mitigationPlan?: string
  contingencyPlan?: string
  createdAt: string
  updatedAt: string
}

/**
 * PDCA 循环
 */
export interface PDCACycle {
  id: string
  title: string
  description?: string
  stage: PDCAStage
  goalId?: string // 关联的目标

  // Plan - 计划
  plan?: {
    objectives: string[]
    tasks: string[]
    risks: string[] // 风险 ID 列表
    baseline: string
    version: number
    createdAt: string
  }

  // Do - 执行
  do?: {
    logs: ExecutionLog[]
    timeTracking: number // 实际投入小时
    startedAt: string
    completedAt?: string
  }

  // Check - 检查
  check?: {
    plannedProgress: number // 计划进度
    actualProgress: number // 实际进度
    deviation: number // 偏差
    issues: string[]
    analysis: string
    checkedAt: string
  }

  // Act - 处理
  act?: {
    improvements: string[]
    lessonsLearned: string[]
    nextCyclePlan: string[]
    actedAt: string
  }

  status: 'active' | 'completed' | 'cancelled'
  progress: number // 0-100
  createdAt: string
  updatedAt: string
  completedAt?: string
}

/**
 * 执行日志
 */
export interface ExecutionLog {
  id: string
  date: string
  content: string
  hours: number
  tags?: string[]
  createdAt: string
}

/**
 * PDCA 视图模式
 */
export type PDCAViewMode = 'list' | 'detail' | 'kanban'

/**
 * PDCA 状态
 */
export interface PDCAState {
  // ========== 状态 ==========
  cycles: PDCACycle[]
  risks: Risk[]
  viewMode: PDCAViewMode
  selectedCycleId: string | null

  // ========== PDCA CRUD ==========
  createCycle: (cycle: Omit<PDCACycle, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => void
  updateCycle: (id: string, updates: Partial<PDCACycle>) => void
  deleteCycle: (id: string) => void
  advanceStage: (id: string) => void
  setSelectedCycle: (id: string | null) => void

  // ========== 风险管理 ==========
  addRisk: (risk: Omit<Risk, 'id' | 'score' | 'createdAt' | 'updatedAt'>) => void
  updateRisk: (id: string, updates: Partial<Risk>) => void
  deleteRisk: (id: string) => void

  // ========== 执行日志 ==========
  addExecutionLog: (cycleId: string, log: Omit<ExecutionLog, 'id' | 'createdAt'>) => void
  deleteExecutionLog: (cycleId: string, logId: string) => void

  // ========== 视图 ==========
  setViewMode: (mode: PDCAViewMode) => void

  // ========== 工具方法 ==========
  getCyclesByStage: () => Record<PDCAStage, PDCACycle[]>
  getHighRisks: () => Risk[]
  getPDCAStats: () => {
    totalCycles: number
    activeCycles: number
    completedCycles: number
    totalRisks: number
    highRisks: number
  }
}

export const usePDCAStore = createSelectors(create<PDCAState>()(
  immer(persist(
    (set, get) => ({
      // ========== 初始状态 ==========
      cycles: [],
      risks: [],
      viewMode: 'list',
      selectedCycleId: null,

      // ========== PDCA CRUD ==========
      createCycle: (cycle) => {
        set((state) => {
          state.cycles.push({
            ...cycle,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 0,
            stage: 'plan',
          })
        })
      },

      updateCycle: (id, updates) => {
        set((state) => {
          const cycle = state.cycles.find(c => c.id === id)
          if (cycle) {
            Object.assign(cycle, updates, { updatedAt: new Date().toISOString() })
          }
        })
      },

      deleteCycle: (id) => {
        set((state) => {
          state.cycles = state.cycles.filter(c => c.id !== id)
          if (state.selectedCycleId === id) {
            state.selectedCycleId = null
          }
        })
      },

      advanceStage: (id) => {
        set((state) => {
          const cycle = state.cycles.find(c => c.id === id)
          if (cycle) {
            const stageOrder: PDCAStage[] = ['plan', 'do', 'check', 'act']
            const currentIndex = stageOrder.indexOf(cycle.stage)
            if (currentIndex < stageOrder.length - 1) {
              cycle.stage = stageOrder[currentIndex + 1]
              cycle.progress = ((currentIndex + 2) / stageOrder.length) * 100
              cycle.updatedAt = new Date().toISOString()

              if (cycle.stage === 'act') {
                cycle.status = 'completed'
                cycle.completedAt = new Date().toISOString()
                cycle.progress = 100
              }
            }
          }
        })
      },

      setSelectedCycle: (id) => {
        set({ selectedCycleId: id })
      },

      // ========== 风险管理 ==========
      addRisk: (risk) => {
        set((state) => {
          state.risks.push({
            ...risk,
            id: crypto.randomUUID(),
            score: risk.probability * risk.impact,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        })
      },

      updateRisk: (id, updates) => {
        set((state) => {
          const risk = state.risks.find(r => r.id === id)
          if (risk) {
            Object.assign(risk, updates, { updatedAt: new Date().toISOString() })
            if (updates.probability || updates.impact) {
              risk.score = (updates.probability || risk.probability) * (updates.impact || risk.impact)
            }
          }
        })
      },

      deleteRisk: (id) => {
        set((state) => {
          state.risks = state.risks.filter(r => r.id !== id)
        })
      },

      // ========== 执行日志 ==========
      addExecutionLog: (cycleId, log) => {
        set((state) => {
          const cycle = state.cycles.find(c => c.id === cycleId)
          if (cycle && cycle.do) {
            cycle.do.logs.push({
              ...log,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            })
            cycle.do.timeTracking = (cycle.do.timeTracking || 0) + log.hours
            cycle.updatedAt = new Date().toISOString()
          }
        })
      },

      deleteExecutionLog: (cycleId, logId) => {
        set((state) => {
          const cycle = state.cycles.find(c => c.id === cycleId)
          if (cycle && cycle.do) {
            const log = cycle.do.logs.find(l => l.id === logId)
            if (log) {
              cycle.do.logs = cycle.do.logs.filter(l => l.id !== logId)
              cycle.do.timeTracking = (cycle.do.timeTracking || 0) - log.hours
              cycle.updatedAt = new Date().toISOString()
            }
          }
        })
      },

      // ========== 视图 ==========
      setViewMode: (mode) => {
        set({ viewMode: mode })
      },

      // ========== 工具方法 ==========
      getCyclesByStage: () => {
        const { cycles } = get()
        return {
          plan: cycles.filter(c => c.stage === 'plan'),
          do: cycles.filter(c => c.stage === 'do'),
          check: cycles.filter(c => c.stage === 'check'),
          act: cycles.filter(c => c.stage === 'act'),
        }
      },

      getHighRisks: () => {
        const { risks } = get()
        return risks.filter(r => r.score >= 12)
      },

      getPDCAStats: () => {
        const { cycles, risks } = get()
        return {
          totalCycles: cycles.length,
          activeCycles: cycles.filter(c => c.status === 'active').length,
          completedCycles: cycles.filter(c => c.status === 'completed').length,
          totalRisks: risks.length,
          highRisks: risks.filter(r => r.score >= 12).length,
        }
      },
    }),
    {
      name: 'chrono-focus-pdca',
      partialize: (state) => ({
        cycles: state.cycles,
        risks: state.risks,
        viewMode: state.viewMode,
        selectedCycleId: state.selectedCycleId,
      }),
    },
  )),
))
