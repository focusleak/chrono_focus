import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/store/createSelectors'

import type { Goal, GoalTemplate, SubGoal, PlanTask, Action } from '@/types'

/**
 * 目标管理状态接口
 * 管理所有目标和模板的 CRUD 操作
 */
export interface GoalState {
  // ========== 状态 ==========
  /** 目标列表 */
  goals: Goal[]
  /** 目标模板库 */
  templates: GoalTemplate[]
  /** 当前选中的目标 ID */
  currentGoalId: string | null
  /** 视图模式 */
  viewMode: 'tree' | 'okr'

  // ========== 目标管理方法 ==========
  /** 创建目标 */
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => void
  /** 更新目标 */
  updateGoal: (id: string, updates: Partial<Goal>) => void
  /** 删除目标 */
  deleteGoal: (id: string) => void
  /** 设置当前目标 */
  setCurrentGoal: (id: string | null) => void
  /** 切换目标状态 */
  toggleGoalStatus: (id: string, status: Goal['status']) => void
  
  // ========== 子目标管理 ==========
  /** 添加子目标 */
  addSubGoal: (goalId: string, subGoal: Omit<SubGoal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'tasks'>) => void
  /** 删除子目标 */
  deleteSubGoal: (goalId: string, subGoalId: string) => void
  /** 更新子目标 */
  updateSubGoal: (goalId: string, subGoalId: string, updates: Partial<SubGoal>) => void
  
  // ========== 任务管理 ==========
  /** 添加任务到子目标 */
  addTask: (goalId: string, subGoalId: string, task: Omit<PlanTask, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => void
  /** 删除任务 */
  deleteTask: (goalId: string, subGoalId: string, taskId: string) => void
  /** 更新任务 */
  updateTask: (goalId: string, subGoalId: string, taskId: string, updates: Partial<PlanTask>) => void
  /** 切换任务状态 */
  toggleTaskStatus: (goalId: string, subGoalId: string, taskId: string, status: PlanTask['status']) => void
  
  // ========== 行动项管理 ==========
  /** 添加行动项 */
  addAction: (goalId: string, subGoalId: string, taskId: string, action: Omit<Action, 'id' | 'createdAt' | 'updatedAt'>) => void
  /** 删除行动项 */
  deleteAction: (goalId: string, subGoalId: string, taskId: string, actionId: string) => void
  /** 切换行动项完成状态 */
  toggleAction: (goalId: string, subGoalId: string, taskId: string, actionId: string) => void
  
  // ========== 进度计算 ==========
  /** 重新计算目标进度 */
  recalculateGoalProgress: (goalId: string) => void
  /** 重新计算子目标进度 */
  recalculateSubGoalProgress: (goalId: string, subGoalId: string) => void
  
  // ========== 模板管理 ==========
  /** 从模板创建目标 */
  createGoalFromTemplate: (templateId: string, overrides?: Partial<Goal>) => void
  /** 添加模板 */
  addTemplate: (template: Omit<GoalTemplate, 'id'>) => void
  /** 删除模板 */
  deleteTemplate: (id: string) => void
  
  // ========== 视图控制 ==========
  /** 切换视图模式 */
  setViewMode: (mode: 'tree' | 'okr') => void
  
  // ========== 工具方法 ==========
  /** 获取目标树（包含所有子目标和任务） */
  getGoalTree: (goalId: string) => Goal | null
  /** 获取所有根目标（没有父级的目标） */
  getRootGoals: () => Goal[]
  /** 获取子目标的所有任务 */
  getSubGoalTasks: (goalId: string, subGoalId: string) => PlanTask[]
}

export const useGoalStore = createSelectors(create<GoalState>()(
  immer(persist(
    (set, get) => ({
      // ========== 初始状态 ==========
      goals: [],
      templates: [],
      currentGoalId: null,
      viewMode: 'tree',

      // ========== 目标管理方法 ==========
      createGoal: (goal) => {
        set((state) => {
          state.goals.push({
            ...goal,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 0,
          })
        })
      },

      updateGoal: (id, updates) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === id)
          if (goal) {
            Object.assign(goal, updates, { updatedAt: new Date().toISOString() })
          }
        })
      },

      deleteGoal: (id) => {
        set((state) => {
          state.goals = state.goals.filter(g => g.id !== id)
          if (state.currentGoalId === id) {
            state.currentGoalId = null
          }
        })
      },

      setCurrentGoal: (id) => {
        set({ currentGoalId: id })
      },

      toggleGoalStatus: (id, status) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === id)
          if (goal) {
            goal.status = status
            goal.updatedAt = new Date().toISOString()
            if (status === 'completed') {
              goal.completedAt = new Date().toISOString()
              goal.progress = 100
            } else if (status === 'active') {
              goal.completedAt = undefined
            }
          }
        })
      },

      // ========== 子目标管理 ==========
      addSubGoal: (goalId, subGoal) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal) {
            goal.subGoals.push({
              ...subGoal,
              id: crypto.randomUUID(),
              tasks: [],
              progress: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            goal.updatedAt = new Date().toISOString()
          }
        })
      },

      deleteSubGoal: (goalId, subGoalId) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal) {
            goal.subGoals = goal.subGoals.filter(sg => sg.id !== subGoalId)
            goal.updatedAt = new Date().toISOString()
          }
        })
      },

      updateSubGoal: (goalId, subGoalId, updates) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal) {
            const subGoal = goal.subGoals.find(sg => sg.id === subGoalId)
            if (subGoal) {
              Object.assign(subGoal, updates, { updatedAt: new Date().toISOString() })
              goal.updatedAt = new Date().toISOString()
            }
          }
        })
      },

      // ========== 任务管理 ==========
      addTask: (goalId, subGoalId, task) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal) {
            const subGoal = goal.subGoals.find(sg => sg.id === subGoalId)
            if (subGoal) {
              subGoal.tasks.push({
                ...task,
                id: crypto.randomUUID(),
                actions: [],
                progress: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              subGoal.updatedAt = new Date().toISOString()
              goal.updatedAt = new Date().toISOString()
            }
          }
        })
      },

      deleteTask: (goalId, subGoalId, taskId) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal) {
            const subGoal = goal.subGoals.find(sg => sg.id === subGoalId)
            if (subGoal) {
              subGoal.tasks = subGoal.tasks.filter(t => t.id !== taskId)
              subGoal.updatedAt = new Date().toISOString()
              goal.updatedAt = new Date().toISOString()
            }
          }
        })
      },

      updateTask: (goalId, subGoalId, taskId, updates) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal) {
            const subGoal = goal.subGoals.find(sg => sg.id === subGoalId)
            if (subGoal) {
              const task = subGoal.tasks.find(t => t.id === taskId)
              if (task) {
                Object.assign(task, updates, { updatedAt: new Date().toISOString() })
                subGoal.updatedAt = new Date().toISOString()
                goal.updatedAt = new Date().toISOString()
              }
            }
          }
        })
      },

      toggleTaskStatus: (goalId, subGoalId, taskId, status) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal) {
            const subGoal = goal.subGoals.find(sg => sg.id === subGoalId)
            if (subGoal) {
              const task = subGoal.tasks.find(t => t.id === taskId)
              if (task) {
                task.status = status
                task.updatedAt = new Date().toISOString()
                if (status === 'completed') {
                  task.progress = 100
                }
                subGoal.updatedAt = new Date().toISOString()
                goal.updatedAt = new Date().toISOString()
              }
            }
          }
        })
      },

      // ========== 行动项管理 ==========
      addAction: (goalId, subGoalId, taskId, action) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal) {
            const subGoal = goal.subGoals.find(sg => sg.id === subGoalId)
            if (subGoal) {
              const task = subGoal.tasks.find(t => t.id === taskId)
              if (task) {
                task.actions.push({
                  ...action,
                  id: crypto.randomUUID(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })
                task.updatedAt = new Date().toISOString()
                subGoal.updatedAt = new Date().toISOString()
                goal.updatedAt = new Date().toISOString()
              }
            }
          }
        })
      },

      deleteAction: (goalId, subGoalId, taskId, actionId) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal) {
            const subGoal = goal.subGoals.find(sg => sg.id === subGoalId)
            if (subGoal) {
              const task = subGoal.tasks.find(t => t.id === taskId)
              if (task) {
                task.actions = task.actions.filter(a => a.id !== actionId)
                task.updatedAt = new Date().toISOString()
                subGoal.updatedAt = new Date().toISOString()
                goal.updatedAt = new Date().toISOString()
              }
            }
          }
        })
      },

      toggleAction: (goalId, subGoalId, taskId, actionId) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal) {
            const subGoal = goal.subGoals.find(sg => sg.id === subGoalId)
            if (subGoal) {
              const task = subGoal.tasks.find(t => t.id === taskId)
              if (task) {
                const action = task.actions.find(a => a.id === actionId)
                if (action) {
                  action.completed = !action.completed
                  action.updatedAt = new Date().toISOString()
                  task.updatedAt = new Date().toISOString()
                  subGoal.updatedAt = new Date().toISOString()
                  goal.updatedAt = new Date().toISOString()
                }
              }
            }
          }
        })
      },

      // ========== 进度计算 ==========
      recalculateSubGoalProgress: (goalId, subGoalId) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal) {
            const subGoal = goal.subGoals.find(sg => sg.id === subGoalId)
            if (subGoal && subGoal.tasks.length > 0) {
              const totalTasks = subGoal.tasks.length
              const completedTasks = subGoal.tasks.filter(t => t.status === 'completed').length
              subGoal.progress = Math.round((completedTasks / totalTasks) * 100)
              subGoal.updatedAt = new Date().toISOString()
            }
          }
        })
      },

      recalculateGoalProgress: (goalId) => {
        set((state) => {
          const goal = state.goals.find(g => g.id === goalId)
          if (goal && goal.subGoals.length > 0) {
            // 重新计算所有子目标进度
            goal.subGoals.forEach(subGoal => {
              if (subGoal.tasks.length > 0) {
                const completedTasks = subGoal.tasks.filter(t => t.status === 'completed').length
                subGoal.progress = Math.round((completedTasks / subGoal.tasks.length) * 100)
              }
            })
            // 计算总体进度
            const totalProgress = goal.subGoals.reduce((sum, sg) => sum + sg.progress, 0)
            goal.progress = Math.round(totalProgress / goal.subGoals.length)
            goal.updatedAt = new Date().toISOString()
          }
        })
      },

      // ========== 模板管理 ==========
      createGoalFromTemplate: (templateId, overrides) => {
        const { templates } = get()
        const template = templates.find(t => t.id === templateId)
        if (template) {
          set((state) => {
            const newGoal: Goal = {
              ...template.goal,
              ...overrides,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              progress: 0,
            }
            state.goals.push(newGoal)
          })
        }
      },

      addTemplate: (template) => {
        set((state) => {
          state.templates.push({
            ...template,
            id: crypto.randomUUID(),
          })
        })
      },

      deleteTemplate: (id) => {
        set((state) => {
          state.templates = state.templates.filter(t => t.id !== id)
        })
      },

      // ========== 视图控制 ==========
      setViewMode: (mode) => {
        set({ viewMode: mode })
      },

      // ========== 工具方法 ==========
      getGoalTree: (goalId) => {
        const { goals } = get()
        return goals.find(g => g.id === goalId) || null
      },

      getRootGoals: () => {
        const { goals } = get()
        return goals.filter(g => !g.parentGoalId)
      },

      getSubGoalTasks: (goalId, subGoalId) => {
        const { goals } = get()
        const goal = goals.find(g => g.id === goalId)
        if (!goal) return []
        const subGoal = goal.subGoals.find(sg => sg.id === subGoalId)
        return subGoal?.tasks || []
      },
    }),
    {
      name: 'chrono-focus-goals',
      partialize: (state) => ({
        goals: state.goals,
        templates: state.templates,
        currentGoalId: state.currentGoalId,
        viewMode: state.viewMode,
      }),
    },
  )),
))
