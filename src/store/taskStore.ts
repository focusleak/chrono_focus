import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/store/createSelectors'

/**
 * 任务状态
 */
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'

/**
 * 任务优先级
 */
export type TaskPriority = 'p0' | 'p1' | 'p2' | 'p3'

/**
 * 任务视图模式
 */
export type TaskViewMode = 'list' | 'kanban'

/**
 * 任务接口
 */
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  parentGoalId?: string // 关联的目标
  parentTaskId?: string // 父任务（子任务）
  dependencies?: string[] // 依赖的任务 ID
  notes?: string // 备注
  progress: number // 0-100
  order: number // 排序顺序
  createdAt: string
  updatedAt: string
  completedAt?: string
}

/**
 * 筛选状态
 */
export interface TaskFilters {
  search: string
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
  tag: string | 'all'
  hasDueDate: boolean | 'all'
}

/**
 * 任务管理状态接口
 */
export interface TaskState {
  // ========== 状态 ==========
  /** 任务列表 */
  tasks: Task[]
  /** 当前视图模式 */
  viewMode: TaskViewMode
  /** 当前筛选条件 */
  filters: TaskFilters
  /** 当前选中的任务 ID */
  selectedTaskId: string | null

  // ========== 任务 CRUD ==========
  /** 创建任务 */
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void
  /** 批量创建任务 */
  bulkCreateTasks: (tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>[]) => void
  /** 更新任务 */
  updateTask: (id: string, updates: Partial<Task>) => void
  /** 删除任务 */
  deleteTask: (id: string) => void
  /** 批量删除任务 */
  bulkDeleteTasks: (ids: string[]) => void
  /** 设置选中任务 */
  setSelectedTask: (id: string | null) => void

  // ========== 任务状态管理 ==========
  /** 切换任务状态 */
  toggleTaskStatus: (id: string, status: TaskStatus) => void
  /** 批量更新任务状态 */
  bulkUpdateStatus: (ids: string[], status: TaskStatus) => void

  // ========== 拖拽排序 ==========
  /** 重新排序任务 */
  reorderTasks: (orderedIds: string[]) => void
  /** 移动任务到看板列 */
  moveTaskToColumn: (taskId: string, status: TaskStatus) => void

  // ========== 视图和筛选 ==========
  /** 设置视图模式 */
  setViewMode: (mode: TaskViewMode) => void
  /** 设置筛选条件 */
  setFilters: (filters: Partial<TaskFilters>) => void
  /** 重置筛选 */
  resetFilters: () => void

  // ========== 工具方法 ==========
  /** 获取筛选后的任务 */
  getFilteredTasks: () => Task[]
  /** 获取按状态分组的任务 */
  getTasksByStatus: () => Record<TaskStatus, Task[]>
  /** 获取所有标签 */
  getAllTags: () => string[]
}

export const useTaskStore = createSelectors(create<TaskState>()(
  immer(persist(
    (set, get) => ({
      // ========== 初始状态 ==========
      tasks: [],
      viewMode: 'list',
      filters: {
        search: '',
        status: 'all',
        priority: 'all',
        tag: 'all',
        hasDueDate: 'all',
      },
      selectedTaskId: null,

      // ========== 任务 CRUD ==========
      createTask: (task) => {
        set((state) => {
          const maxOrder = state.tasks.length > 0
            ? Math.max(...state.tasks.map(t => t.order))
            : 0
          state.tasks.push({
            ...task,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: maxOrder + 1,
          })
        })
      },

      bulkCreateTasks: (tasks) => {
        set((state) => {
          const maxOrder = state.tasks.length > 0
            ? Math.max(...state.tasks.map(t => t.order))
            : 0
          tasks.forEach((task, index) => {
            state.tasks.push({
              ...task,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              order: maxOrder + index + 1,
            })
          })
        })
      },

      updateTask: (id, updates) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === id)
          if (task) {
            Object.assign(task, updates, { updatedAt: new Date().toISOString() })
          }
        })
      },

      deleteTask: (id) => {
        set((state) => {
          state.tasks = state.tasks.filter(t => t.id !== id)
          if (state.selectedTaskId === id) {
            state.selectedTaskId = null
          }
        })
      },

      bulkDeleteTasks: (ids) => {
        set((state) => {
          state.tasks = state.tasks.filter(t => !ids.includes(t.id))
          if (ids.includes(state.selectedTaskId || '')) {
            state.selectedTaskId = null
          }
        })
      },

      setSelectedTask: (id) => {
        set({ selectedTaskId: id })
      },

      // ========== 任务状态管理 ==========
      toggleTaskStatus: (id, status) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === id)
          if (task) {
            task.status = status
            task.updatedAt = new Date().toISOString()
            if (status === 'completed') {
              task.progress = 100
              task.completedAt = new Date().toISOString()
            } else if (status === 'in_progress') {
              task.progress = Math.max(task.progress, 1)
            }
          }
        })
      },

      bulkUpdateStatus: (ids, status) => {
        set((state) => {
          const now = new Date().toISOString()
          ids.forEach(id => {
            const task = state.tasks.find(t => t.id === id)
            if (task) {
              task.status = status
              task.updatedAt = now
              if (status === 'completed') {
                task.progress = 100
                task.completedAt = now
              }
            }
          })
        })
      },

      // ========== 拖拽排序 ==========
      reorderTasks: (orderedIds) => {
        set((state) => {
          orderedIds.forEach((id, index) => {
            const task = state.tasks.find(t => t.id === id)
            if (task) {
              task.order = index
            }
          })
        })
      },

      moveTaskToColumn: (taskId, status) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId)
          if (task) {
            task.status = status
            task.updatedAt = new Date().toISOString()
            if (status === 'completed') {
              task.progress = 100
              task.completedAt = new Date().toISOString()
            }
          }
        })
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
            status: 'all',
            priority: 'all',
            tag: 'all',
            hasDueDate: 'all',
          },
        })
      },

      // ========== 工具方法 ==========
      getFilteredTasks: () => {
        const { tasks, filters } = get()

        return tasks.filter(task => {
          // 搜索过滤
          if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            if (
              !task.title.toLowerCase().includes(searchLower) &&
              !task.description?.toLowerCase().includes(searchLower)
            ) {
              return false
            }
          }

          // 状态过滤
          if (filters.status !== 'all' && task.status !== filters.status) {
            return false
          }

          // 优先级过滤
          if (filters.priority !== 'all' && task.priority !== filters.priority) {
            return false
          }

          // 标签过滤
          if (filters.tag !== 'all' && (!task.tags || !task.tags.includes(filters.tag))) {
            return false
          }

          // 截止日期过滤
          if (filters.hasDueDate === true && !task.dueDate) {
            return false
          }

          return true
        }).sort((a, b) => a.order - b.order)
      },

      getTasksByStatus: () => {
        const { tasks } = get()
        return {
          todo: tasks.filter(t => t.status === 'todo'),
          in_progress: tasks.filter(t => t.status === 'in_progress'),
          completed: tasks.filter(t => t.status === 'completed'),
          cancelled: tasks.filter(t => t.status === 'cancelled'),
        }
      },

      getAllTags: () => {
        const { tasks } = get()
        const tagSet = new Set<string>()
        tasks.forEach(task => task.tags?.forEach(tag => tagSet.add(tag)))
        return Array.from(tagSet)
      },
    }),
    {
      name: 'chrono-focus-tasks',
      partialize: (state) => ({
        tasks: state.tasks,
        viewMode: state.viewMode,
        filters: state.filters,
        selectedTaskId: state.selectedTaskId,
      }),
    },
  )),
))
