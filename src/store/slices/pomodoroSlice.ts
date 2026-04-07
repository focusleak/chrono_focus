/**
 * 番茄钟状态 Slice
 */
import { StateCreator } from 'zustand'
import type { PomodoroType } from '../../types'
import type { GlobalState } from '../store'

export interface PomodoroSlice {
  // 定时器状态
  isRunning: boolean
  timeLeft: number
  currentTime: number
  pomodoroType: PomodoroType

  // 休息状态
  breakTimeLeft: number
  breakType: 'shortBreak' | 'longBreak' | null

  // 提示状态
  showPomodoroPotatoConflict: 'pomodoro' | 'potato' | null

  // 方法
  startPomodoro: () => void
  pausePomodoro: () => void
  resetPomodoro: () => void
  stopPomodoro: () => void
  finishEarlyPomodoro: () => void
  setPomodoroType: (type: PomodoroType) => void
  tick: () => void
  resolvePomodoroPotatoConflict: (target: 'pomodoro' | 'potato') => void
}

export const createPomodoroSlice: StateCreator<GlobalState, [], [], PomodoroSlice> = (set, get) => ({
  isRunning: false,
  timeLeft: 25 * 60,
  currentTime: 25 * 60,
  pomodoroType: 'pomodoro',
  breakTimeLeft: 0,
  breakType: null,
  showPomodoroPotatoConflict: null,

  startPomodoro: () => {
    const { isPotatoRunning } = get()
    if (isPotatoRunning) {
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
    const { timeLeft, pomodoroType, completedPomodoros, totalFocusTime, currentTaskId, tasks, waterCount, dailyStats, pomodoroTime, breakTimeLeft, isRunning } = get()

    if (timeLeft <= 0) {
      if (pomodoroType === 'pomodoro') {
        const updatedTasks = tasks.map(task =>
          task.id === currentTaskId
            ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
            : task
        )

        const today = new Date().toISOString().split('T')[0]
        const todayStats = dailyStats.find(s => s.date === today)
        const newDailyStats = todayStats
          ? dailyStats.map(s => s.date === today
              ? { ...s, pomodoros: s.pomodoros + 1, focusTime: s.focusTime + pomodoroTime }
              : s
            )
          : [...dailyStats, {
              date: today,
              pomodoros: 1,
              focusTime: pomodoroTime,
              waterCount,
              tasksCompleted: 0,
              potatoTime: 0
            }]

        const newCompletedPomodoros = completedPomodoros + 1
        const theBreakType = newCompletedPomodoros % 4 === 0 ? 'longBreak' : 'shortBreak'

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
      } else if (pomodoroType === 'shortBreak' || pomodoroType === 'longBreak') {
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

    if (isRunning && (pomodoroType === 'shortBreak' || pomodoroType === 'longBreak')) {
      set({ breakTimeLeft: Math.max(0, breakTimeLeft - 1) })
    }

    set({ timeLeft: timeLeft - 1 })
  },

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
})
