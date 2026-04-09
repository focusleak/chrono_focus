import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { format } from 'date-fns'

import { useSettingsStore } from '@/store/settingsStore'
import { createSelectors } from '@/store/createSelectors'

import type { Task, DailyStats, PatataActivity } from '@/types'
import { PomodoroStatus } from '@/types'

/**
 * 运行时状态接口
 * 管理应用的所有运行时状态，包括计时器、任务、统计数据等
 * 使用 Zustand + Immer + Persist 进行状态管理
 */
export interface RuntimeState {
  // ========== 番茄钟运行状态 ==========
  /** 番茄钟是否运行中 */
  isPomodoroRunning: boolean
  /** 番茄钟剩余时间（秒） */
  pomodoroTimeLeft: number
  /** 番茄钟总时间（秒） */
  currentPomodoroTime: number
  /** 番茄钟当前状态 */
  pomodoroStatus: PomodoroStatus
  /** 番茄钟休息已用时间（秒，正计时） */
  pomodoroBreakTimeLeft: number
  /** 番茄钟/土豆钟冲突提示 */
  showPomodoroPatataConflict: 'pomodoro' | 'patata' | null

  // ========== 土豆钟运行状态 ==========
  /** 土豆钟是否运行中 */
  isPatataRunning: boolean
  /** 土豆钟已用时间（秒，正计时） */
  patataElapsedTime: number

  // ========== 休息提醒运行状态 ==========
  /** 休息提醒倒计时剩余时间（秒） */
  restReminderTimeLeft: number
  /** 休息提醒总时长（秒） */
  restReminderTotalTime: number
  /** 是否显示休息提醒全屏遮罩 */
  showRestReminderPrompt: boolean
  /** 休息提醒是否被跳过 */
  restReminderSkipped: boolean
  /** 休息提醒被跳过的次数 */
  restReminderSkipCount: number
  /** 休息提醒是否被手动暂停 */
  restReminderPaused: boolean
  /** 连续短休息次数 */
  restBreakCount: number

  // ========== 提醒计数 ==========
  /** 今日已喝水杯数 */
  waterCount: number
  /** 今日站立提醒次数 */
  standReminderCount: number
  /** 今日远眺提醒次数 */
  gazeReminderCount: number
  /** 今日走动提醒次数 */
  walkReminderCount: number

  // ========== 统计数据 ==========
  /** 完成的番茄钟数量 */
  completedPomodoros: number
  /** 总专注时间（分钟） */
  totalFocusTime: number

  // ========== 任务管理 ==========
  /** 任务列表 */
  tasks: Task[]
  /** 当前选中的番茄钟任务ID */
  currentPomodoroTaskId: string | null
  /** 当前选中的土豆钟任务ID */
  currentPatataTaskId: string | null
  /** 每日统计记录 */
  dailyStats: DailyStats[]
  /** 土豆钟活动记录 */
  patataActivities: PatataActivity[]

  // ========== 番茄钟方法 ==========
  /** 开始番茄钟 */
  startPomodoro: () => void
  /** 暂停番茄钟 */
  pausePomodoro: () => void
  /** 重置番茄钟 */
  resetPomodoro: () => void
  /** 停止番茄钟 */
  stopPomodoro: () => void
  /** 提前结束番茄钟 */
  finishEarlyPomodoro: () => void
  /** 设置番茄钟状态 */
  setPomodoroStatus: (status: PomodoroStatus) => void
  /** 解决番茄钟/土豆钟冲突 */
  resolvePomodoroPatataConflict: (target: 'pomodoro' | 'patata') => void

  // ========== 土豆钟方法 ==========
  /** 开始土豆钟 */
  startPatata: () => void
  /** 暂停土豆钟 */
  pausePatata: () => void
  /** 重置土豆钟 */
  resetPatata: () => void
  /** 添加土豆钟活动 */
  addPatataActivity: (activity: Omit<PatataActivity, 'id' | 'createdAt'>) => void
  /** 删除土豆钟活动 */
  deletePatataActivity: (id: string) => void

  // ========== 休息提醒方法 ==========
  /** 开始休息提醒倒计时 */
  startRestReminder: () => void
  /** 暂停休息提醒 */
  pauseRestReminder: () => void
  /** 重置休息提醒 */
  resetRestReminder: () => void
  /** 休息提醒每秒滴答 */
  tickRestReminder: () => void
  /** 设置是否显示休息提醒提示 */
  setShowRestReminderPrompt: (show: boolean) => void
  /** 下一次休息 */
  nextRestBreak: () => void
  /** 跳过休息提醒 */
  skipRestReminder: () => void
  /** 弹窗关闭后恢复计时 */
  resumeTimersAfterOverlay: () => void
  /** 切换休息提醒暂停状态 */
  toggleRestReminderPause: () => void

  // ========== 任务管理方法 ==========
  /** 添加任务 */
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'isCompleted' | 'order'>) => void
  /** 更新任务 */
  updateTask: (id: string, updates: Partial<Task>) => void
  /** 删除任务 */
  deleteTask: (id: string) => void
  /** 重新排序任务 */
  reorderTasks: (orderedIds: string[]) => void
  /** 设置当前番茄钟任务 */
  setCurrentPomodoroTask: (id: string | null) => void
  /** 设置当前土豆钟任务 */
  setCurrentPatataTask: (id: string | null) => void
  /** 切换子任务完成状态 */
  toggleSubtask: (taskId: string, subtaskId: string) => void
  /** 完成任务 */
  completeTask: (id: string) => void

  // ========== 统计方法 ==========
  /** 增加喝水计数 */
  incrementWater: () => void
  /** 减少喝水计数 */
  decrementWater: () => void
  /** 重置每日统计 */
  resetDailyStats: () => void
  /** 添加每日统计 */
  addDailyStats: (stats: DailyStats) => void
  /** 获取指定天数的统计 */
  getDailyStats: (days: number) => DailyStats[]
  /** 获取今日统计 */
  getTodayStats: () => DailyStats | null
}

export const useRuntimeStore = createSelectors(create<RuntimeState>()(
  immer(persist(
    (set, get) => {
      const settings = useSettingsStore.getState()

      const initialPomodoroTime = settings.pomodoroTime || 25
      const initialRestInterval = settings.restReminderInterval || 30

      return {
        // ========== 番茄钟运行状态 ==========
        isPomodoroRunning: false,
        pomodoroTimeLeft: initialPomodoroTime * 60,
        currentPomodoroTime: initialPomodoroTime * 60,
        pomodoroStatus: PomodoroStatus.Pomodoro,
        pomodoroBreakTimeLeft: 0,
        showPomodoroPatataConflict: null,

        // ========== 土豆钟运行状态 ==========
        isPatataRunning: false,
        patataElapsedTime: 0,

        // ========== 休息提醒运行状态 ==========
        restReminderTimeLeft: initialRestInterval * 60,
        restReminderTotalTime: initialRestInterval * 60,
        showRestReminderPrompt: false,
        restReminderSkipped: false,
        restReminderSkipCount: 0,
        restReminderPaused: false,
        restBreakCount: 0,

        // ========== 提醒计数 ==========
        waterCount: 0,
        standReminderCount: 0,
        gazeReminderCount: 0,
        walkReminderCount: 0,

        // ========== 统计数据 ==========
        completedPomodoros: 0,
        totalFocusTime: 0,

        // ========== 任务管理 ==========
        tasks: [],
        currentPomodoroTaskId: null,
        currentPatataTaskId: null,
        dailyStats: [],
        patataActivities: [],

        // ========== 番茄钟方法 ==========
        startPomodoro: () => {
          const { isPatataRunning } = get()
          if (isPatataRunning) {
            set({ showPomodoroPatataConflict: 'pomodoro' })
          } else {
            set({ isPomodoroRunning: true })
          }
        },

        pausePomodoro: () => set({ isPomodoroRunning: false }),

        resetPomodoro: () => {
          const { pomodoroStatus } = get()
          const settings = useSettingsStore.getState()
          let time = settings.pomodoroTime * 60
          if (pomodoroStatus === PomodoroStatus.ShortBreak) time = settings.pomodoroShortBreakTime * 60
          if (pomodoroStatus === PomodoroStatus.LongBreak) time = settings.pomodoroLongBreakTime * 60

          const restTotal = settings.restReminderInterval * 60
          set({
            isPomodoroRunning: false,
            pomodoroTimeLeft: time,
            currentPomodoroTime: time,
            restReminderTimeLeft: restTotal,
            restReminderTotalTime: restTotal,
          })
        },

        stopPomodoro: () => {
          set({ isPomodoroRunning: false })
        },

        finishEarlyPomodoro: () => {
          const { pomodoroStatus, currentPomodoroTaskId, tasks } = get()

          if (pomodoroStatus === PomodoroStatus.Pomodoro && currentPomodoroTaskId) {
            const updatedTasks = tasks.map(task =>
              task.id === currentPomodoroTaskId
                ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
                : task
            )
            set({ tasks: updatedTasks, isPomodoroRunning: false })
          } else {
            set({ isPomodoroRunning: false })
          }
        },

        setPomodoroStatus: (status: PomodoroStatus) => {
          const settings = useSettingsStore.getState()
          let time = settings.pomodoroTime * 60
          if (status === PomodoroStatus.ShortBreak) time = settings.pomodoroShortBreakTime * 60
          if (status === PomodoroStatus.LongBreak) time = settings.pomodoroLongBreakTime * 60

          set({
            pomodoroStatus: status,
            pomodoroTimeLeft: time,
            currentPomodoroTime: time,
            isPomodoroRunning: false
          })
        },

        resolvePomodoroPatataConflict: (target: 'pomodoro' | 'patata') => {
          const settings = useSettingsStore.getState()
          const restTotal = settings.restReminderInterval * 60
          set({ showPomodoroPatataConflict: null })
          if (target === 'pomodoro') {
            set({ isPatataRunning: false, isPomodoroRunning: true, restReminderTimeLeft: restTotal, restReminderTotalTime: restTotal })
          } else {
            set({ isPomodoroRunning: false, restReminderTimeLeft: restTotal, restReminderTotalTime: restTotal })
            get().startPatata()
          }
        },

        // ========== 土豆钟方法 ==========
        startPatata: () => {
          const { isPomodoroRunning } = get()
          if (isPomodoroRunning) {
            set({ showPomodoroPatataConflict: 'patata' })
          } else {
            const settings = useSettingsStore.getState()
            const { patataElapsedTime } = get()
            const restTotal = settings.restReminderInterval * 60
            set({ isPatataRunning: true, patataElapsedTime, restReminderTimeLeft: restTotal, restReminderTotalTime: restTotal })
          }
        },

        pausePatata: () => set({ isPatataRunning: false }),

        resetPatata: () => {
          set({ isPatataRunning: false, patataElapsedTime: 0 })
        },

        addPatataActivity: (activity) => {
          const newActivity = {
            ...activity,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          }
          set((state) => ({
            patataActivities: [...state.patataActivities, newActivity],
          }))
        },

        deletePatataActivity: (id) => {
          set((state) => ({
            patataActivities: state.patataActivities.filter(a => a.id !== id),
          }))
        },

        // ========== 休息提醒方法 ==========
        startRestReminder: () => {
          set((state) => {
            if (state.restReminderTimeLeft <= 0) {
              const settings = useSettingsStore.getState()
              const total = settings.restReminderInterval * 60
              return { restReminderTimeLeft: total, restReminderTotalTime: total }
            }
            return state
          })
        },

        pauseRestReminder: () => {
          set({ restReminderPaused: true })
        },

        resetRestReminder: () => {
          const settings = useSettingsStore.getState()
          const total = settings.restReminderInterval * 60
          set({ restReminderTimeLeft: total, restReminderTotalTime: total })
        },

        tickRestReminder: () => {
          set((state) => {
            if (state.restReminderTimeLeft > 0) {
              return { restReminderTimeLeft: state.restReminderTimeLeft - 1 }
            }
            return { showRestReminderPrompt: true, restReminderTimeLeft: 0 }
          })
        },

        setShowRestReminderPrompt: (show) => {
          set({ showRestReminderPrompt: show })
        },

        nextRestBreak: () => {
          const { restBreakCount } = get()
          const newCount = restBreakCount >= 3 ? 0 : restBreakCount + 1
          set({ restBreakCount: newCount })
        },

        skipRestReminder: () => {
          const settings = useSettingsStore.getState()
          set({
            restReminderSkipped: true,
            restReminderSkipCount: (get().restReminderSkipCount || 0) + 1,
            restReminderTimeLeft: settings.restReminderSkipInterval * 60,
            restReminderTotalTime: settings.restReminderSkipInterval * 60,
          })
        },

        resumeTimersAfterOverlay: () => {
          const settings = useSettingsStore.getState()
          const total = settings.restReminderInterval * 60
          set({
            showRestReminderPrompt: false,
            restReminderSkipped: false,
            restReminderPaused: false,
            restReminderTimeLeft: total,
            restReminderTotalTime: total,
          })
        },

        toggleRestReminderPause: () => {
          set((state) => ({
            restReminderPaused: !state.restReminderPaused,
          }))
        },

        // ========== 任务管理方法 ==========
        addTask: (task) => {
          const newTask = {
            ...task,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            completedPomodoros: 0,
            isCompleted: false,
            isRecurring: task.isRecurring ?? false,
            isSimple: task.isSimple ?? false,
            order: Date.now(),
          }
          set((state) => ({
            tasks: [...state.tasks, newTask],
            currentPomodoroTaskId: newTask.id,
          }))
        },

        updateTask: (id, updates) => {
          set((state) => ({
            tasks: state.tasks.map(task =>
              task.id === id ? { ...task, ...updates } : task
            ),
          }))
        },

        reorderTasks: (orderedIds) => {
          set((state) => ({
            tasks: state.tasks.map(task => ({
              ...task,
              order: orderedIds.indexOf(task.id),
            })),
          }))
        },

        deleteTask: (id) => {
          set((state) => ({
            tasks: state.tasks.filter(task => task.id !== id),
            currentPomodoroTaskId: state.currentPomodoroTaskId === id ? null : state.currentPomodoroTaskId,
          }))
        },

        setCurrentPomodoroTask: (id) => {
          set({ currentPomodoroTaskId: id })
        },

        setCurrentPatataTask: (id) => {
          set({ currentPatataTaskId: id })
        },

        toggleSubtask: (taskId, subtaskId) => {
          set((state) => ({
            tasks: state.tasks.map(task =>
              task.id === taskId
                ? {
                  ...task,
                  subtasks: task.subtasks.map(st =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                  ),
                }
                : task
            ),
          }))
        },

        completeTask: (id) => {
          set((state) => {
            const task = state.tasks.find(t => t.id === id)
            if (!task) return state

            return {
              tasks: task.isRecurring
                ? state.tasks.map(t => t.id === id ? { ...t, subtasks: t.subtasks.map(st => ({ ...st, completed: false })) } : t)
                : state.tasks.map(t => t.id === id ? { ...t, isCompleted: true } : t),
            }
          })
        },

        // ========== 统计方法 ==========
        /** 增加喝水计数 */
        incrementWater: () => {
          const { waterCount, dailyStats } = get()
          const newWaterCount = waterCount + 1
          const today = format(new Date(), "yyyy-MM-dd")

          const todayStats = dailyStats.find(s => s.date === today)
          const newDailyStats = todayStats
            ? dailyStats.map(s => s.date === today ? { ...s, waterCount: newWaterCount } : s)
            : [...dailyStats, {
              date: today,
              pomodoros: 0,
              focusTime: 0,
              waterCount: newWaterCount,
              tasksCompleted: 0,
              patataTime: 0
            }]

          set({ waterCount: newWaterCount, dailyStats: newDailyStats })
        },

        /** 减少喝水计数 */
        decrementWater: () => {
          const { waterCount, dailyStats } = get()
          if (waterCount <= 0) return

          const newWaterCount = waterCount - 1
          const today = format(new Date(), "yyyy-MM-dd")

          const todayStats = dailyStats.find(s => s.date === today)
          const newDailyStats = todayStats
            ? dailyStats.map(s => s.date === today ? { ...s, waterCount: newWaterCount } : s)
            : dailyStats

          set({ waterCount: newWaterCount, dailyStats: newDailyStats })
        },

        resetDailyStats: () => {
          set({
            waterCount: 0,
            completedPomodoros: 0,
            totalFocusTime: 0,
            standReminderCount: 0,
            gazeReminderCount: 0,
            walkReminderCount: 0,
          })
        },

        addDailyStats: (stats) => {
          set((state) => ({
            dailyStats: [...state.dailyStats, stats],
          }))
        },

        getDailyStats: (days) => {
          const { dailyStats } = get()
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - days)
          return dailyStats.filter(s => new Date(s.date) >= cutoffDate)
        },

        getTodayStats: () => {
          const { dailyStats } = get()
          const today = format(new Date(), "yyyy-MM-dd")
          return dailyStats.find(s => s.date === today) || null
        },
      }
    },
    {
      name: 'chrono-focus-runtime',
      /** 只持久化需要保存的字段 */
      partialize: (state) => ({
        tasks: state.tasks,
        currentPomodoroTaskId: state.currentPomodoroTaskId,
        currentPatataTaskId: state.currentPatataTaskId,
        dailyStats: state.dailyStats,
        patataActivities: state.patataActivities,
        patataElapsedTime: state.patataElapsedTime,
        isPatataRunning: state.isPatataRunning,
        completedPomodoros: state.completedPomodoros,
        totalFocusTime: state.totalFocusTime,
        waterCount: state.waterCount,
        standReminderCount: state.standReminderCount,
        gazeReminderCount: state.gazeReminderCount,
        walkReminderCount: state.walkReminderCount,
      })
    },
  )),
))