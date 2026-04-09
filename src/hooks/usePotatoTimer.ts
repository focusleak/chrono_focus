import { useCallback } from 'react'
import { format } from 'date-fns'
import { sendNotification } from '@/lib/utils'

import { useInterval } from './common/useInterval'

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
 * function PotatoPage() {
 *   usePotatoTimer()
 *   // ... 组件逻辑
 * }
 * ```
 */
export const usePotatoTimer = () => {
  const isPotatoRunning = useRuntimeStore.use.isPotatoRunning()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()

  const tickPotato = useCallback(() => {
    const settings = useSettingsStore.getState()
    const state = useRuntimeStore.getState()

    if (!state.isPotatoRunning) return

    const newElapsedTime = state.potatoElapsedTime + 1
    const dailyPotatoLimit = settings.dailyPotatoLimit * 60

    // 当超出限制时，每秒累加 dailyStats 中的 potatoTime
    if (newElapsedTime > dailyPotatoLimit) {
      const today = format(new Date(), 'yyyy-MM-dd')
      const todayStats = state.dailyStats.find(s => s.date === today)
      const newDailyStats = todayStats
        ? state.dailyStats.map(s => s.date === today ? { ...s, potatoTime: s.potatoTime + 1 } : s)
        : [...state.dailyStats, { date: today, pomodoros: 0, focusTime: 0, waterCount: 0, tasksCompleted: 0, potatoTime: 1 }]
      useRuntimeStore.setState({ potatoElapsedTime: newElapsedTime, dailyStats: newDailyStats })
    } else {
      // 刚好到达限制时发送通知
      if (newElapsedTime === dailyPotatoLimit) {
        sendNotification('娱乐时间已用完', '已达到每日娱乐时间限制。建议休息一下，然后回去专注工作！')
      }
      useRuntimeStore.setState({ potatoElapsedTime: newElapsedTime })
    }
  }, [])

  // 每秒执行一次计时
  // 当休息提醒弹窗显示时暂停计时
  useInterval(tickPotato, 1000, isPotatoRunning && !showRestReminderPrompt)
}
