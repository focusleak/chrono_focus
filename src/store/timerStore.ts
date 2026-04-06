import { create } from 'zustand'
import { sendNotification, playSound, getTodayString } from '../utils/helpers'

export type ActivityType = 'task' | 'entertainment'

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  type: ActivityType // 活动类型：任务或娱乐项目
  subtasks: SubTask[]
  completedPomodoros: number
  createdAt: string
  completedAt?: string
  isCompleted: boolean
  isRecurring: boolean // 是否循环任务
  isSimple: boolean // 是否无需分解的任务（不强制要求子任务）
}

export interface DailyStats {
  date: string // YYYY-MM-DD
  pomodoros: number
  focusTime: number // 分钟
  waterCount: number
  tasksCompleted: number
  potatoTime: number // 土豆钟娱乐时间（分钟）
}

// 土豆钟活动类型
export interface PotatoActivity {
  id: string
  title: string
  duration: number // 分钟
  createdAt: string
}

export type TimerType = 'pomodoro' | 'shortBreak' | 'longBreak'

export interface TimerState {
  // 定时器状态
  isRunning: boolean
  timeLeft: number // 剩余时间（秒）
  currentTime: number // 当前时间（秒）
  timerType: TimerType

  // 提示状态
  showTaskSelectWarning: boolean // 是否显示任务选择提示
  showHydrationPrompt: boolean // 是否显示喝水提示
  showPomodoroPotatoConflict: 'pomodoro' | 'potato' | null // 番茄钟/土豆钟冲突提示
  showBreakPrompt: 'shortBreak' | 'longBreak' | null // 休息提示

  // 开机自启动
  autoStartEnabled: boolean // 是否启用开机自启动

  // 番茄钟设置
  pomodoroTime: number // 番茄钟时长（默认25分钟）
  shortBreakTime: number // 短休息时长（默认5分钟）
  longBreakTime: number // 长休息时长（默认15分钟）

  // 休息提醒设置
  restReminderEnabled: boolean
  restReminderInterval: number // 休息提醒间隔（分钟）

  // 喝水提醒设置
  waterReminderEnabled: boolean
  waterReminderInterval: number // 喝水提醒间隔（分钟）
  dailyWaterGoal: number // 每日喝水目标（杯）
  waterCount: number // 今日已喝水杯数

  // 统计
  completedPomodoros: number // 完成的番茄钟数量
  totalFocusTime: number // 总专注时间（分钟）

  // 站立提醒设置
  standReminderEnabled: boolean
  standReminderInterval: number // 站立提醒间隔（分钟）
  standReminderCount: number // 今日站立提醒次数

  // 拉伸提醒设置
  stretchReminderEnabled: boolean
  stretchReminderInterval: number // 拉伸提醒间隔（分钟）

  // 远眺提醒设置
  gazeReminderEnabled: boolean
  gazeReminderInterval: number // 远眺提醒间隔（分钟）

  // 走动提醒设置
  walkReminderEnabled: boolean
  walkReminderInterval: number // 走动提醒间隔（分钟）

  // 提醒计数
  gazeReminderCount: number // 今日远眺提醒次数
  walkReminderCount: number // 今日走动提醒次数

  // 任务管理
  tasks: Task[]
  currentTaskId: string | null // 当前选中的任务ID（番茄钟用）
  currentEntertainmentId: string | null // 当前选中的娱乐项目ID（土豆钟用）

  // 历史记录
  dailyStats: DailyStats[] // 每日统计记录

  // 方法
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  stopTimer: () => void // 提前结束番茄钟
  finishEarly: () => void // 提前结束并询问任务是否完成
  setTimerType: (type: TimerType) => void
  tick: () => void
  updateSettings: (settings: Partial<TimerState>) => void
  incrementWater: () => void
  resetDailyStats: () => void
  setShowTaskSelectWarning: (show: boolean) => void
  setShowHydrationPrompt: (show: boolean) => void
  setShowBreakPrompt: (show: 'shortBreak' | 'longBreak' | null) => void
  resolvePomodoroPotatoConflict: (target: 'pomodoro' | 'potato') => void
  acknowledgeHydration: () => void
  setAutoStartEnabled: (enabled: boolean) => Promise<void>

  // 任务管理方法
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'isCompleted'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setCurrentTask: (id: string | null) => void
  setCurrentEntertainment: (id: string | null) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  completeTask: (id: string) => void

  // 站立提醒
  triggerStandReminder: () => void

  // 拉伸提醒
  triggerStretchReminder: () => void

  // 历史记录方法
  addDailyStats: (stats: DailyStats) => void
  getDailyStats: (days: number) => DailyStats[]
  getTodayStats: () => DailyStats | null

  // 土豆钟方法
  potatoActivities: PotatoActivity[]
  potatoTimeLeft: number // 土豆钟剩余时间（秒）
  isPotatoRunning: boolean
  dailyPotatoLimit: number // 每日娱乐时间限制（分钟）
  startPotato: () => void
  pausePotato: () => void
  resetPotato: () => void
  addPotatoActivity: (activity: Omit<PotatoActivity, 'id' | 'createdAt'>) => void
  deletePotatoActivity: (id: string) => void
  setDailyPotatoLimit: (minutes: number) => void
  tickPotato: () => void
}

// 本地存储工具（兼容浏览器和 Electron 环境）
const electronStorage = {
  getItem: (key: string): any => {
    try {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : null
      }
      return null
    } catch {
      return null
    }
  },
  setItem: (key: string, value: any): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error('Failed to save to storage:', error)
    }
  }
}

const getInitialState = () => {
  const saved = electronStorage.getItem('pomodoro-settings')
  if (saved) {
    // 兼容旧数据：为没有 type 字段的任务添加默认值
    const migratedTasks = (saved.tasks || []).map((t: any) => ({
      type: 'task',
      ...t
    }))

    return {
      ...saved,
      isRunning: false,
      timeLeft: saved.pomodoroTime * 60,
      currentTime: saved.pomodoroTime * 60,
      dailyStats: saved.dailyStats || [],
      stretchReminderEnabled: saved.stretchReminderEnabled ?? true,
      stretchReminderInterval: saved.stretchReminderInterval ?? 30,
      gazeReminderEnabled: saved.gazeReminderEnabled ?? true,
      gazeReminderInterval: saved.gazeReminderInterval ?? 20,
      tasks: migratedTasks,
      waterCount: saved.waterCount ?? 0,
      completedPomodoros: saved.completedPomodoros ?? 0,
      totalFocusTime: saved.totalFocusTime ?? 0,
      autoStartEnabled: saved.autoStartEnabled ?? false,
      potatoActivities: saved.potatoActivities || [],
      potatoTimeLeft: saved.potatoTimeLeft ?? (saved.dailyPotatoLimit || 60) * 60,
      isPotatoRunning: false,
      dailyPotatoLimit: saved.dailyPotatoLimit || 60,
    }
  }

  return {
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    restReminderEnabled: true,
    restReminderInterval: 30,
    waterReminderEnabled: true,
    waterReminderInterval: 60,
    dailyWaterGoal: 8,
    waterCount: 0,
    completedPomodoros: 0,
    totalFocusTime: 0,
    standReminderEnabled: true,
    standReminderInterval: 45,
    standReminderCount: 0,
    stretchReminderEnabled: true,
    stretchReminderInterval: 30,
    gazeReminderEnabled: true,
    gazeReminderInterval: 20,
    walkReminderEnabled: true,
    walkReminderInterval: 60,
    gazeReminderCount: 0,
    walkReminderCount: 0,
    tasks: [],
    currentTaskId: null,
    currentEntertainmentId: null,
    dailyStats: [],
    showTaskSelectWarning: false,
    showHydrationPrompt: false,
    showPomodoroPotatoConflict: null,
    showBreakPrompt: null,
    autoStartEnabled: false,
    potatoActivities: [],
    potatoTimeLeft: 3600, // 默认60分钟
    isPotatoRunning: false,
    dailyPotatoLimit: 60,
  }
}

const saveToStorage = (state: TimerState) => {
  electronStorage.setItem('pomodoro-settings', {
    pomodoroTime: state.pomodoroTime,
    shortBreakTime: state.shortBreakTime,
    longBreakTime: state.longBreakTime,
    restReminderEnabled: state.restReminderEnabled,
    restReminderInterval: state.restReminderInterval,
    waterReminderEnabled: state.waterReminderEnabled,
    waterReminderInterval: state.waterReminderInterval,
    dailyWaterGoal: state.dailyWaterGoal,
    waterCount: state.waterCount,
    completedPomodoros: state.completedPomodoros,
    totalFocusTime: state.totalFocusTime,
    standReminderEnabled: state.standReminderEnabled,
    standReminderInterval: state.standReminderInterval,
    stretchReminderEnabled: state.stretchReminderEnabled,
    stretchReminderInterval: state.stretchReminderInterval,
    gazeReminderEnabled: state.gazeReminderEnabled,
    gazeReminderInterval: state.gazeReminderInterval,
    tasks: state.tasks,
    currentTaskId: state.currentTaskId,
    dailyStats: state.dailyStats,
    autoStartEnabled: state.autoStartEnabled,
    potatoActivities: state.potatoActivities,
    potatoTimeLeft: state.potatoTimeLeft,
    isPotatoRunning: state.isPotatoRunning,
    dailyPotatoLimit: state.dailyPotatoLimit,
  })
}

export const useTimerStore = create<TimerState>((set, get) => {
  const initial = getInitialState()

  return {
    ...initial,
    timeLeft: initial.pomodoroTime * 60,
    currentTime: initial.pomodoroTime * 60,
    timerType: 'pomodoro',

    startTimer: () => {
      const { isPotatoRunning } = get()
      if (isPotatoRunning) {
        // 土豆钟正在运行，设置冲突标志，由 UI 层处理提示
        set({ showPomodoroPotatoConflict: 'pomodoro' })
      } else {
        set({ isRunning: true })
      }
    },

    pauseTimer: () => set({ isRunning: false }),

    resetTimer: () => {
      const { timerType, pomodoroTime, shortBreakTime, longBreakTime } = get()
      let time = pomodoroTime * 60
      if (timerType === 'shortBreak') time = shortBreakTime * 60
      if (timerType === 'longBreak') time = longBreakTime * 60

      set({
        isRunning: false,
        timeLeft: time,
        currentTime: time
      })
    },

    stopTimer: () => {
      set({ isRunning: false })
    },

    finishEarly: () => {
      const { timerType, currentTaskId, tasks } = get()

      if (timerType === 'pomodoro' && currentTaskId) {
        const updatedTasks = tasks.map(task =>
          task.id === currentTaskId
            ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
            : task
        )

        set({
          tasks: updatedTasks,
          isRunning: false
        })
        saveToStorage(get())
      } else {
        set({ isRunning: false })
      }
    },

    setTimerType: (type: TimerType) => {
      const { pomodoroTime, shortBreakTime, longBreakTime } = get()
      let time = pomodoroTime * 60
      if (type === 'shortBreak') time = shortBreakTime * 60
      if (type === 'longBreak') time = longBreakTime * 60

      set({
        timerType: type,
        timeLeft: time,
        currentTime: time,
        isRunning: false
      })
    },

    tick: () => {
      const { timeLeft, timerType, completedPomodoros, totalFocusTime, currentTaskId, tasks, waterCount, dailyStats } = get()

      if (timeLeft <= 0) {
        if (timerType === 'pomodoro') {
          const updatedTasks = tasks.map(task =>
            task.id === currentTaskId
              ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
              : task
          )

          const pomodoroTime = get().pomodoroTime
          const today = getTodayString()

          const todayStats = dailyStats.find(s => s.date === today)
          const newDailyStats: DailyStats[] = todayStats
            ? dailyStats.map(s => s.date === today
                ? {
                    ...s,
                    pomodoros: s.pomodoros + 1,
                    focusTime: s.focusTime + pomodoroTime
                  }
                : s
              )
            : [...dailyStats, {
                date: today,
                pomodoros: 1,
                focusTime: pomodoroTime,
                waterCount: waterCount,
                tasksCompleted: 0,
                potatoTime: 0
              }]

          set({
            completedPomodoros: completedPomodoros + 1,
            totalFocusTime: totalFocusTime + pomodoroTime,
            tasks: updatedTasks,
            dailyStats: newDailyStats,
            showHydrationPrompt: true,
            showBreakPrompt: 'shortBreak',
          })
          saveToStorage(get())
        } else if (timerType === 'shortBreak' || timerType === 'longBreak') {
          set({ showHydrationPrompt: true })
          get().setTimerType('pomodoro')
        }

        set({ isRunning: false })
        return
      }

      set({ timeLeft: timeLeft - 1 })
    },

    updateSettings: (settings: Partial<TimerState>) => {
      set((state) => {
        const newState = { ...state, ...settings }
        saveToStorage(newState)
        return newState
      })
    },

    incrementWater: () => {
      const { waterCount, dailyStats } = get()
      const newWaterCount = waterCount + 1
      const today = getTodayString()

      const todayStats = dailyStats.find(s => s.date === today)
      const newDailyStats = todayStats
        ? dailyStats.map(s => s.date === today ? { ...s, waterCount: newWaterCount } : s)
        : [...dailyStats, {
            date: today,
            pomodoros: 0,
            focusTime: 0,
            waterCount: newWaterCount,
            tasksCompleted: 0,
            potatoTime: 0
          }]

      set({ waterCount: newWaterCount, dailyStats: newDailyStats })
      saveToStorage(get())
    },

    resetDailyStats: () => {
      set({
        waterCount: 0,
        completedPomodoros: 0,
        totalFocusTime: 0
      })
    },

    setShowTaskSelectWarning: (show) => set({ showTaskSelectWarning: show }),

    setShowHydrationPrompt: (show) => set({ showHydrationPrompt: show }),

    setShowBreakPrompt: (show) => set({ showBreakPrompt: show }),

    resolvePomodoroPotatoConflict: (target: 'pomodoro' | 'potato') => {
      set({ showPomodoroPotatoConflict: null })
      if (target === 'pomodoro') {
        set({ isPotatoRunning: false, isRunning: true })
      } else {
        set({ isRunning: false })
        get().startPotato()
      }
    },

    acknowledgeHydration: () => {
      const { showHydrationPrompt } = get()
      if (showHydrationPrompt) {
        get().incrementWater()
      }
      set({ showHydrationPrompt: false })
    },

    setAutoStartEnabled: async (enabled) => {
      set({ autoStartEnabled: enabled })
      
      if (window.electronAPI) {
        try {
          await window.electronAPI.setAutoLaunch(enabled)
        } catch (error) {
          console.error('Failed to set auto-launch:', error)
        }
      }
      
      saveToStorage(get())
    },
    
    addTask: (task) => {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        completedPomodoros: 0,
        isCompleted: false,
        isRecurring: task.isRecurring ?? false,
        isSimple: task.isSimple ?? false,
      }
      set((state) => {
        const newState = {
          tasks: [...state.tasks, newTask],
          currentTaskId: newTask.id
        }
        saveToStorage({ ...state, ...newState })
        return newState
      })
    },

    updateTask: (id, updates) => {
      set((state) => {
        const newState = {
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
          )
        }
        saveToStorage({ ...state, ...newState })
        return newState
      })
    },

    deleteTask: (id) => {
      set((state) => {
        const newState = {
          tasks: state.tasks.filter(task => task.id !== id),
          currentTaskId: state.currentTaskId === id ? null : state.currentTaskId
        }
        saveToStorage({ ...state, ...newState })
        return newState
      })
    },

    setCurrentTask: (id) => {
      set({ currentTaskId: id })
    },

    setCurrentEntertainment: (id) => {
      set({ currentEntertainmentId: id })
    },

    toggleSubtask: (taskId, subtaskId) => {
      set((state) => {
        const newState = {
          tasks: state.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(st =>
                  st.id === subtaskId ? { ...st, completed: !st.completed } : st
                )
              }
            }
            return task
          })
        }
        saveToStorage({ ...state, ...newState })
        return newState
      })
    },

    completeTask: (id) => {
      const { dailyStats, tasks } = get()
      const today = getTodayString()
      const task = tasks.find(t => t.id === id)

      // 循环任务：重置状态并重新激活
      if (task?.isRecurring) {
        set((state) => ({
          tasks: state.tasks.map(t =>
            t.id === id
              ? {
                  ...t,
                  isCompleted: false,
                  completedAt: undefined,
                  completedPomodoros: 0,
                  subtasks: t.subtasks.map(st => ({ ...st, completed: false }))
                }
              : t
          ),
        }))
        return
      }

      const todayStats = dailyStats.find(s => s.date === today)
      const newDailyStats = todayStats
        ? dailyStats.map(s => s.date === today ? { ...s, tasksCompleted: s.tasksCompleted + 1 } : s)
        : [...dailyStats, {
            date: today,
            pomodoros: 0,
            focusTime: 0,
            waterCount: 0,
            tasksCompleted: 1,
            potatoTime: 0
          }]

      set((state) => {
        const newState = {
          tasks: state.tasks.map(task =>
            task.id === id
              ? { ...task, isCompleted: true, completedAt: new Date().toISOString() }
              : task
          ),
          currentTaskId: null,
          dailyStats: newDailyStats
        }
        saveToStorage({ ...state, ...newState })
        return newState
      })
    },

    triggerStandReminder: () => {
      // This is just a marker, actual reminder is handled in the hook
    },

    addDailyStats: (stats) => {
      set((state) => {
        const existingIndex = state.dailyStats.findIndex(s => s.date === stats.date)
        let newStats: DailyStats[]

        if (existingIndex >= 0) {
          newStats = [...state.dailyStats]
          newStats[existingIndex] = {
            ...newStats[existingIndex],
            pomodoros: newStats[existingIndex].pomodoros + stats.pomodoros,
            focusTime: newStats[existingIndex].focusTime + stats.focusTime,
            waterCount: stats.waterCount > newStats[existingIndex].waterCount
              ? stats.waterCount
              : newStats[existingIndex].waterCount,
            tasksCompleted: newStats[existingIndex].tasksCompleted + stats.tasksCompleted
          }
        } else {
          newStats = [...state.dailyStats, stats]
        }

        const newState = { dailyStats: newStats }
        saveToStorage({ ...state, ...newState })
        return newState
      })
    },

    getDailyStats: (days) => {
      const { dailyStats } = get()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      return dailyStats
        .filter(stats => new Date(stats.date) >= cutoffDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    },

    getTodayStats: () => {
      const { dailyStats } = get()
      const today = getTodayString()
      return dailyStats.find(s => s.date === today) || null
    },

    // 土豆钟方法
    startPotato: () => {
      const { isRunning, potatoTimeLeft, dailyPotatoLimit } = get()

      if (isRunning) {
        // 番茄钟正在运行，设置冲突标志，由 UI 层处理提示
        set({ showPomodoroPotatoConflict: 'potato' })
        return
      }

      // 初始化土豆钟时间
      const startTime = potatoTimeLeft > 0 ? potatoTimeLeft : dailyPotatoLimit * 60
      set({ isPotatoRunning: true, potatoTimeLeft: startTime })
    },

    pausePotato: () => set({ isPotatoRunning: false }),

    resetPotato: () => {
      const { dailyPotatoLimit } = get()
      set({ isPotatoRunning: false, potatoTimeLeft: dailyPotatoLimit * 60 })
    },

    setDailyPotatoLimit: (minutes) => {
      const { potatoTimeLeft, isPotatoRunning } = get()
      set({ dailyPotatoLimit: minutes })
      
      // 如果土豆钟没有在运行，重置剩余时间为新的限制
      if (!isPotatoRunning && potatoTimeLeft === 0) {
        set({ potatoTimeLeft: minutes * 60 })
      }
      
      saveToStorage(get())
    },

    tickPotato: () => {
      const { potatoTimeLeft, isPotatoRunning, dailyStats } = get()

      if (!isPotatoRunning) return

      if (potatoTimeLeft <= 0) {
        // 倒计时结束后不停止，改为正计时（记录超出时间）
        const overtimeSeconds = Math.abs(potatoTimeLeft)
        const today = getTodayString()
        const todayStatsItem = dailyStats.find(s => s.date === today)
        const overtimeMinutes = Math.floor(overtimeSeconds / 60)

        const newDailyStats = todayStatsItem
          ? dailyStats.map(s => s.date === today ? { ...s, potatoTime: s.potatoTime + overtimeMinutes } : s)
          : [...dailyStats, {
              date: today,
              pomodoros: 0,
              focusTime: 0,
              waterCount: 0,
              tasksCompleted: 0,
              potatoTime: overtimeMinutes
            }]

        set({
          dailyStats: newDailyStats,
          potatoTimeLeft: -1, // 标记为已开始正计时
        })

        sendNotification('娱乐时间已用完', '已超过限制时间，现在是正计时。建议回去专注工作！')
        playSound('complete')
        return
      }

      set({ potatoTimeLeft: potatoTimeLeft - 1 })
    },

    addPotatoActivity: (activity) => {
      const newActivity: PotatoActivity = {
        ...activity,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      
      set((state) => {
        const newState = {
          potatoActivities: [...state.potatoActivities, newActivity],
          potatoTimeLeft: state.potatoTimeLeft + activity.duration * 60,
        }
        saveToStorage({ ...state, ...newState })
        return newState
      })
    },

    deletePotatoActivity: (id) => {
      set((state) => {
        const activityToDelete = state.potatoActivities.find(a => a.id === id)
        const newState = {
          potatoActivities: state.potatoActivities.filter(a => a.id !== id),
          potatoTimeLeft: activityToDelete 
            ? Math.max(0, state.potatoTimeLeft - activityToDelete.duration * 60)
            : state.potatoTimeLeft,
        }
        saveToStorage({ ...state, ...newState })
        return newState
      })
    },
  }
})
