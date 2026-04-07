import { create } from 'zustand'
import { format } from 'date-fns'
import { sendNotification } from '../lib/utils'
import { storage } from '../lib/storage'
import type { Task, DailyStats, PotatoActivity, PomodoroType } from '../types'

export type { ActivityType, SubTask, Task, DailyStats, PotatoActivity, PomodoroType } from '../types'

export interface GlobalState {
  // 定时器状态
  isRunning: boolean
  timeLeft: number // 剩余时间（秒）
  currentTime: number // 当前时间（秒）
  pomodoroType: PomodoroType

  // 提示状态
  showTaskSelectWarning: boolean // 是否显示任务选择提示
  showHydrationPrompt: boolean // 是否显示喝水提示
  showPomodoroPotatoConflict: 'pomodoro' | 'potato' | null // 番茄钟/土豆钟冲突提示

  // 开机自启动
  autoStartEnabled: boolean // 是否启用开机自启动

  // 番茄钟设置
  pomodoroTime: number // 番茄钟时长（默认25分钟）
  shortBreakTime: number // 短休息时长（默认5分钟）
  longBreakTime: number // 长休息时长（默认15分钟）

  // 休息状态
  breakTimeLeft: number // 休息已用时间（秒，正计时）
  breakType: 'shortBreak' | 'longBreak' | null // 当前休息类型

  // 休息提醒设置
  restReminderEnabled: boolean
  restReminderInterval: number // 休息提醒间隔（分钟）
  restReminderNotification: boolean // 休息提醒时发送通知
  restBreakDuration: number // 休息时长（分钟）
  restReminderSkipInterval: number // 跳过后的再次提醒间隔（分钟）

  // 休息提醒倒计时
  restReminderTimeLeft: number // 休息提醒倒计时剩余时间（秒）
  restReminderTotalTime: number // 休息提醒总时长（秒）
  showRestReminderPrompt: boolean // 是否显示休息提醒全屏遮罩
  restReminderSkipped: boolean // 休息提醒是否被跳过
  restReminderSkipCount: number // 休息提醒被跳过的次数
  restReminderPaused: boolean // 休息提醒是否被手动暂停

  // 乘法题目状态
  quizNum1: number // 题目数字1
  quizNum2: number // 题目数字2
  userAnswer: number | null // 用户答案
  showQuiz: boolean // 是否显示乘法题目
  quizResult: 'correct' | 'wrong' | null // 答题结果
  restBreakCount: number // 连续短休息次数

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

  // 任务完成弹窗
  showTaskCompleteModal: boolean // 是否显示任务完成弹窗

  // 任务管理
  tasks: Task[]
  currentTaskId: string | null // 当前选中的任务ID（番茄钟用）
  currentEntertainmentId: string | null // 当前选中的娱乐项目ID（土豆钟用）

  // 历史记录
  dailyStats: DailyStats[] // 每日统计记录

  // 方法
  startPomodoro: () => void
  pausePomodoro: () => void
  resetPomodoro: () => void
  stopPomodoro: () => void // 提前结束番茄钟
  finishEarlyPomodoro: () => void // 提前结束并询问任务是否完成
  setPomodoroType: (type: PomodoroType) => void
  tick: () => void
  updateSettings: (settings: Partial<GlobalState>) => void
  incrementWater: () => void
  resetDailyStats: () => void
  setShowTaskSelectWarning: (show: boolean) => void
  setShowHydrationPrompt: (show: boolean) => void
  setShowTaskCompleteModal: (show: boolean) => void
  resolvePomodoroPotatoConflict: (target: 'pomodoro' | 'potato') => void
  acknowledgeHydration: () => void
  setAutoStartEnabled: (enabled: boolean) => void

  // 休息提醒倒计时
  startRestReminder: () => void
  pauseRestReminder: () => void
  resetRestReminder: () => void
  tickRestReminder: () => void
  setShowRestReminderPrompt: (show: boolean) => void
  generateQuiz: () => void
  checkQuizAnswer: (answer: string) => boolean
  closeQuizAndRestReminder: () => void
  nextRestBreak: () => void
  skipRestReminder: () => void // 跳过休息提醒，1分钟后再次提醒
  resumeTimersAfterOverlay: () => void // 弹窗关闭后恢复计时
  triggerPomodoroComplete: () => void // 触发番茄钟完成逻辑（测试用）
  triggerPotatoComplete: () => void // 触发土豆钟完成逻辑（测试用）
  triggerRestReminder: () => void // 触发休息提醒弹窗（测试用）
  toggleRestReminderPause: () => void // 切换休息提醒暂停状态

  // 任务管理方法
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'isCompleted' | 'order'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  reorderTasks: (orderedIds: string[]) => void
  setCurrentTask: (id: string | null) => void
  setCurrentEntertainment: (id: string | null) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  completeTask: (id: string) => void

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

const SETTINGS_KEY = 'pomodoro-settings'

const getInitialState = () => {
  const saved = storage.get<Partial<GlobalState>>(SETTINGS_KEY)
  if (saved) {
    // 兼容旧数据：为没有 type 字段的任务添加默认值
    const migratedTasks = (saved.tasks || []).map((t: any) => ({
      type: 'task',
      ...t
    }))

    return {
      ...saved,
      isRunning: false,
      timeLeft: (saved.pomodoroTime ?? 25) * 60,
      currentTime: (saved.pomodoroTime ?? 25) * 60,
      dailyStats: saved.dailyStats || [],
      stretchReminderEnabled: saved.stretchReminderEnabled ?? true,
      stretchReminderInterval: saved.stretchReminderInterval ?? 30,
      gazeReminderEnabled: saved.gazeReminderEnabled ?? true,
      gazeReminderInterval: saved.gazeReminderInterval ?? 20,
      walkReminderEnabled: saved.walkReminderEnabled ?? true,
      walkReminderInterval: saved.walkReminderInterval ?? 60,
      showRestReminderPrompt: false,
      restReminderSkipped: false,
      restReminderSkipCount: 0,
      restReminderPaused: false,
      restBreakDuration: saved.restBreakDuration ?? 5,
      restReminderSkipInterval: saved.restReminderSkipInterval ?? 1,
      restReminderTimeLeft: (saved.restReminderInterval ?? 30) * 60,
      restReminderTotalTime: (saved.restReminderInterval ?? 30) * 60,
      quizNum1: 0,
      quizNum2: 0,
      userAnswer: null,
      showQuiz: false,
      quizResult: null,
      restBreakCount: 0,
      breakTimeLeft: 0,
      breakType: null,
      tasks: migratedTasks,
      waterCount: saved.waterCount ?? 0,
      completedPomodoros: saved.completedPomodoros ?? 0,
      totalFocusTime: saved.totalFocusTime ?? 0,
      autoStartEnabled: saved.autoStartEnabled ?? false,
      potatoActivities: saved.potatoActivities || [],
      potatoTimeLeft: saved.potatoTimeLeft ?? (saved.dailyPotatoLimit || 60) * 60,
      isPotatoRunning: false,
      dailyPotatoLimit: saved.dailyPotatoLimit || 60,
      showTaskSelectWarning: saved.showTaskSelectWarning ?? false,
      showHydrationPrompt: saved.showHydrationPrompt ?? false,
      showTaskCompleteModal: false,
      showPomodoroPotatoConflict: saved.showPomodoroPotatoConflict ?? null,
    }
  }

  return {
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    restReminderEnabled: true,
    restReminderInterval: 30,
    restReminderNotification: true,
    restBreakDuration: 5,
    restReminderSkipInterval: 1,
    restReminderTimeLeft: 1800,
    restReminderTotalTime: 1800,
    showRestReminderPrompt: false,
    restReminderSkipped: false,
    restReminderSkipCount: 0,
    restReminderPaused: false,
    quizNum1: 0,
    quizNum2: 0,
    userAnswer: null,
    showQuiz: false,
    quizResult: null,
    restBreakCount: 0,
    breakTimeLeft: 0,
    breakType: null,
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
    showTaskCompleteModal: false,
    showPomodoroPotatoConflict: null,
    autoStartEnabled: false,
    potatoActivities: [],
    potatoTimeLeft: 3600, // 默认60分钟
    isPotatoRunning: false,
    dailyPotatoLimit: 60,
  }
}

const saveToStorage = (state: GlobalState) => {
  storage.set(SETTINGS_KEY, {
    pomodoroTime: state.pomodoroTime,
    shortBreakTime: state.shortBreakTime,
    longBreakTime: state.longBreakTime,
    restReminderEnabled: state.restReminderEnabled,
    restReminderInterval: state.restReminderInterval,
    restReminderNotification: state.restReminderNotification,
    restBreakDuration: state.restBreakDuration,
    restReminderSkipInterval: state.restReminderSkipInterval,
    restReminderSkipped: state.restReminderSkipped,
    restReminderSkipCount: state.restReminderSkipCount,
    restReminderPaused: state.restReminderPaused,
    restReminderTimeLeft: state.restReminderTimeLeft,
    restReminderTotalTime: state.restReminderTotalTime,
    quizNum1: state.quizNum1,
    quizNum2: state.quizNum2,
    restBreakCount: state.restBreakCount,
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
    walkReminderEnabled: state.walkReminderEnabled,
    walkReminderInterval: state.walkReminderInterval,
    tasks: state.tasks,
    currentTaskId: state.currentTaskId,
    currentEntertainmentId: state.currentEntertainmentId,
    dailyStats: state.dailyStats,
    autoStartEnabled: state.autoStartEnabled,
    potatoActivities: state.potatoActivities,
    potatoTimeLeft: state.potatoTimeLeft,
    isPotatoRunning: state.isPotatoRunning,
    dailyPotatoLimit: state.dailyPotatoLimit,
    breakTimeLeft: state.breakTimeLeft,
    breakType: state.breakType,
  })
}

export const useStore = create<GlobalState>((set, get) => {
  const initial = getInitialState() as GlobalState

  return {
    ...initial,
    timeLeft: (initial.pomodoroTime ?? 25) * 60,
    currentTime: (initial.pomodoroTime ?? 25) * 60,
    pomodoroType: 'pomodoro',
    breakTimeLeft: initial.breakTimeLeft ?? 0,
    breakType: initial.breakType ?? null,

    startPomodoro: () => {
      const { isPotatoRunning } = get()
      if (isPotatoRunning) {
        // 土豆钟正在运行，设置冲突标志，由 UI 层处理提示
        set({ showPomodoroPotatoConflict: 'pomodoro' })
      } else {
        set({ isRunning: true })
      }
    },

    pausePomodoro: () => set({ isRunning: false }),

    resetPomodoro: () => {
      const { pomodoroType, pomodoroTime, shortBreakTime, longBreakTime, restReminderInterval } = get()
      let time = pomodoroTime * 60
      if (pomodoroType === 'shortBreak') time = shortBreakTime * 60
      if (pomodoroType === 'longBreak') time = longBreakTime * 60

      const restTotal = restReminderInterval * 60
      set({
        isRunning: false,
        timeLeft: time,
        currentTime: time,
        restReminderTimeLeft: restTotal,
        restReminderTotalTime: restTotal,
      })
    },

    stopPomodoro: () => {
      set({ isRunning: false })
    },

    finishEarlyPomodoro: () => {
      const { pomodoroType, currentTaskId, tasks } = get()

      if (pomodoroType === 'pomodoro' && currentTaskId) {
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

    setPomodoroType: (type: PomodoroType) => {
      const { pomodoroTime, shortBreakTime, longBreakTime } = get()
      let time = pomodoroTime * 60
      if (type === 'shortBreak') time = shortBreakTime * 60
      if (type === 'longBreak') time = longBreakTime * 60

      set({
        pomodoroType: type,
        timeLeft: time,
        currentTime: time,
        isRunning: false
      })
    },

    tick: () => {
      const { timeLeft, pomodoroType, completedPomodoros, totalFocusTime, currentTaskId, tasks, waterCount, dailyStats, pomodoroTime, shortBreakTime, longBreakTime, breakTimeLeft, breakType, isRunning } = get()

      if (timeLeft <= 0) {
        if (pomodoroType === 'pomodoro') {
          const updatedTasks = tasks.map(task =>
            task.id === currentTaskId
              ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
              : task
          )

          const today = format(new Date(), "yyyy-MM-dd")

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

          const newCompletedPomodoros = completedPomodoros + 1
          const theBreakType = newCompletedPomodoros % 4 === 0 ? 'longBreak' : 'shortBreak'
          const breakTime = theBreakType === 'shortBreak' ? shortBreakTime * 60 : longBreakTime * 60

          set({
            completedPomodoros: newCompletedPomodoros,
            totalFocusTime: totalFocusTime + pomodoroTime,
            tasks: updatedTasks,
            dailyStats: newDailyStats,
            pomodoroType: 'pomodoro',
            timeLeft: 0,
            currentTime: 0,
            isRunning: false,
            breakTimeLeft: 0,
            breakType: theBreakType,
          })
          saveToStorage(get())
        } else if (pomodoroType === 'shortBreak' || pomodoroType === 'longBreak') {
          // 短休息/长休息结束：切回番茄钟，不自动开始
          const pomTime = pomodoroTime * 60
          set({
            pomodoroType: 'pomodoro',
            timeLeft: pomTime,
            currentTime: pomTime,
            isRunning: false,
            breakTimeLeft: 0,
            breakType: null,
          })
        }

        return
      }

      // 休息倒计时
      if (isRunning && (pomodoroType === 'shortBreak' || pomodoroType === 'longBreak')) {
        set({ breakTimeLeft: Math.max(0, breakTimeLeft - 1) })
      }

      set({ timeLeft: timeLeft - 1 })
    },

    updateSettings: (settings: Partial<GlobalState>) => {
      set((state) => {
        const newState = { ...state, ...settings }
        // 当休息提醒间隔改变时，同步重置倒计时
        if (settings.restReminderInterval !== undefined) {
          const total = settings.restReminderInterval * 60
          newState.restReminderTimeLeft = total
          newState.restReminderTotalTime = total
        }
        saveToStorage(newState)
        return newState
      })
    },

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

    setShowTaskCompleteModal: (show) => set({ showTaskCompleteModal: show }),

    resolvePomodoroPotatoConflict: (target: 'pomodoro' | 'potato') => {
      const { restReminderInterval } = get()
      const restTotal = restReminderInterval * 60
      set({ showPomodoroPotatoConflict: null })
      if (target === 'pomodoro') {
        set({ isPotatoRunning: false, isRunning: true, restReminderTimeLeft: restTotal, restReminderTotalTime: restTotal })
      } else {
        set({ isRunning: false, restReminderTimeLeft: restTotal, restReminderTotalTime: restTotal })
        get().startPotato()
      }
    },

    acknowledgeHydration: () => {
      set({ showHydrationPrompt: false })
    },

    setAutoStartEnabled: (enabled) => {
      set({ autoStartEnabled: enabled })
      saveToStorage(get())
    },

    // 休息提醒倒计时
    startRestReminder: () => {
      set((state) => {
        if (state.restReminderTimeLeft <= 0) {
          const total = state.restReminderInterval * 60
          return { restReminderTimeLeft: total, restReminderTotalTime: total }
        }
        return state
      })
    },

    pauseRestReminder: () => {
      // 不改变 timeLeft，只是暂停（通过外部 hook 控制）
    },

    resetRestReminder: () => {
      set((state) => {
        const total = state.restReminderInterval * 60
        return { restReminderTimeLeft: total, restReminderTotalTime: total }
      })
    },

    tickRestReminder: () => {
      set((state) => {
        if (state.restReminderTimeLeft > 0) {
          return { restReminderTimeLeft: state.restReminderTimeLeft - 1 }
        }
        // 倒计时到 0，显示全屏提示
        return { showRestReminderPrompt: true, restReminderTimeLeft: 0 }
      })
    },

    setShowRestReminderPrompt: (show) => {
      set({ showRestReminderPrompt: show })
    },

    generateQuiz: () => {
      const num1 = Math.floor(Math.random() * 90) + 10 // 10-99
      const num2 = Math.floor(Math.random() * 90) + 10 // 10-99
      set({
        showQuiz: true,
        quizNum1: num1,
        quizNum2: num2,
        userAnswer: null,
        quizResult: null,
      })
    },

    checkQuizAnswer: (answer: string) => {
      const { quizNum1, quizNum2 } = get()
      const correct = quizNum1 * quizNum2
      const userNum = parseInt(answer, 10)
      const isCorrect = userNum === correct
      set({
        userAnswer: userNum,
        quizResult: isCorrect ? 'correct' : 'wrong',
      })
      return isCorrect
    },

    nextRestBreak: () => {
      const { restBreakCount } = get()
      // 每 3 次短休息后安排 1 次长休息
      const newCount = restBreakCount >= 3 ? 0 : restBreakCount + 1
      set({ restBreakCount: newCount })
    },

    closeQuizAndRestReminder: () => {
      set({
        showQuiz: false,
        showRestReminderPrompt: false,
        quizResult: null,
        userAnswer: null,
      })
      get().resetRestReminder()
    },

    skipRestReminder: () => {
      // 点击跳过：使用设置的间隔后再次提醒
      const { restReminderSkipInterval } = get()
      set({
        restReminderSkipped: true,
        restReminderSkipCount: (get().restReminderSkipCount || 0) + 1,
        restReminderTimeLeft: restReminderSkipInterval * 60,
        restReminderTotalTime: restReminderSkipInterval * 60,
      })
    },

    resumeTimersAfterOverlay: () => {
      // 弹窗关闭后恢复休息提醒倒计时
      const { restReminderInterval } = get()
      const total = restReminderInterval * 60
      set({
        showRestReminderPrompt: false,
        restReminderSkipped: false,
        restReminderPaused: false,
        restReminderTimeLeft: total,
        restReminderTotalTime: total,
      })
    },

    triggerPomodoroComplete: () => {
      // 模拟番茄钟/休息结束逻辑
      const { pomodoroType, completedPomodoros, totalFocusTime, currentTaskId, tasks, waterCount, dailyStats, pomodoroTime, shortBreakTime, longBreakTime } = get()

      if (pomodoroType === 'pomodoro') {
        const updatedTasks = tasks.map(task =>
          task.id === currentTaskId
            ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
            : task
        )
        const today = format(new Date(), "yyyy-MM-dd")
        const todayStats = dailyStats.find(s => s.date === today)
        const newDailyStats: DailyStats[] = todayStats
          ? dailyStats.map(s => s.date === today ? { ...s, pomodoros: s.pomodoros + 1, focusTime: s.focusTime + pomodoroTime } : s)
          : [...dailyStats, { date: today, pomodoros: 1, focusTime: pomodoroTime, waterCount, tasksCompleted: 0, potatoTime: 0 }]
        const newCompletedPomodoros = completedPomodoros + 1
        const breakType = newCompletedPomodoros % 4 === 0 ? 'longBreak' : 'shortBreak'
        const breakTime = breakType === 'longBreak' ? longBreakTime : shortBreakTime
        set({
          completedPomodoros: newCompletedPomodoros,
          totalFocusTime: totalFocusTime + pomodoroTime,
          tasks: updatedTasks,
          dailyStats: newDailyStats,
          showTaskCompleteModal: true,
          pomodoroType: breakType,
          timeLeft: breakTime * 60,
          currentTime: breakTime * 60,
          isRunning: false,
        })
        saveToStorage(get())
      } else {
        set({ pomodoroType: 'pomodoro', timeLeft: pomodoroTime * 60, currentTime: pomodoroTime * 60, isRunning: false })
      }
    },

    triggerPotatoComplete: () => {
      // 模拟土豆钟倒计时结束
      const today = format(new Date(), "yyyy-MM-dd")
      const { dailyStats } = get()
      const todayStatsItem = dailyStats.find(s => s.date === today)
      const newDailyStats = todayStatsItem
        ? dailyStats.map(s => s.date === today ? { ...s, potatoTime: s.potatoTime + 1 } : s)
        : [...dailyStats, { date: today, pomodoros: 0, focusTime: 0, waterCount: 0, tasksCompleted: 0, potatoTime: 1 }]
      set({ dailyStats: newDailyStats, potatoTimeLeft: -1, isPotatoRunning: false })
      sendNotification('娱乐时间已用完', '已超过限制时间，现在是正计时。建议回去专注工作！')
    },

    triggerRestReminder: () => {
      // 触发休息提醒弹窗
      set({ showRestReminderPrompt: true })
      sendNotification('休息提醒', '你已经工作一段时间了，记得休息一下哦！')
    },

    toggleRestReminderPause: () => {
      set((state) => ({ restReminderPaused: !state.restReminderPaused }))
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
        order: Date.now(),
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

    reorderTasks: (orderedIds) => {
      set((state) => {
        const newState = {
          tasks: state.tasks.map(task => ({
            ...task,
            order: orderedIds.indexOf(task.id),
          }))
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
      set((state) => {
        const newState = { ...state, currentEntertainmentId: id }
        saveToStorage(newState)
        return newState
      })
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
      const today = format(new Date(), "yyyy-MM-dd")
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
      const today = format(new Date(), "yyyy-MM-dd")
      return dailyStats.find(s => s.date === today) || null
    },

    // 土豆钟方法
    startPotato: () => {
      const { isRunning, potatoTimeLeft, dailyPotatoLimit, restReminderInterval } = get()

      if (isRunning) {
        // 番茄钟正在运行，设置冲突标志，由 UI 层处理提示
        set({ showPomodoroPotatoConflict: 'potato' })
        return
      }

      // 初始化土豆钟时间
      const startTime = potatoTimeLeft > 0 ? potatoTimeLeft : dailyPotatoLimit * 60
      const restTotal = restReminderInterval * 60
      set({ isPotatoRunning: true, potatoTimeLeft: startTime, restReminderTimeLeft: restTotal, restReminderTotalTime: restTotal })
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
        const today = format(new Date(), "yyyy-MM-dd")
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
