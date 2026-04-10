import { useCallback } from 'react'
import { format } from 'date-fns'
import { sendNotification } from '@/lib/utils'

import { useElectronInterval } from './common/useElectronInterval'

import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'

/**
 * 土豆钟计时 Hook
 *
 * 管理娱乐时间（土豆钟）的计时逻辑
 * 当休息提醒弹窗显示时自动暂停计时
 * 与番茄钟互斥运行，避免同时计时
 *
 * @returns void
 *
 * @example
 * ```tsx
 * function PatataPage() {
 *   usePatataTimer()
 *   // ... 组件逻辑
 * }
 * ```
 */
export const usePatataTimer = () => {
  const isPatataRunning = useRuntimeStore.use.isPatataRunning()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()

  const tickPatata = useCallback(() => {
    const settings = useSettingsStore.getState()
    const state = useRuntimeStore.getState()

    if (!state.isPatataRunning) return

    const newElapsedTime = state.patataElapsedTime + 1
    const dailyPatataLimit = settings.dailyPatataLimit * 60

    // 当超出限制时，每秒累加 dailyStats 中的 patataTime
    if (newElapsedTime > dailyPatataLimit) {
      const today = format(new Date(), 'yyyy-MM-dd')
      const todayStats = state.dailyStats.find(s => s.date === today)
      const newDailyStats = todayStats
        ? state.dailyStats.map(s => s.date === today ? { ...s, patataTime: s.patataTime + 1 } : s)
        : [...state.dailyStats, { date: today, pomodoros: 0, focusTime: 0, waterCount: 0, tasksCompleted: 0, patataTime: 1 }]
      useRuntimeStore.setState({ patataElapsedTime: newElapsedTime, dailyStats: newDailyStats })
    } else {
      // 刚好到达限制时发送通知
      if (newElapsedTime === dailyPatataLimit) {
        sendNotification('娱乐时间已用完', '已达到每日娱乐时间限制。建议休息一下，然后回去专注工作！')
      }
      useRuntimeStore.setState({ patataElapsedTime: newElapsedTime })
    }
  }, [])

  // 每秒执行一次计时
  // 当休息提醒弹窗显示时暂停计时
  useElectronInterval(tickPatata, 1000, isPatataRunning && !showRestReminderPrompt)
}
