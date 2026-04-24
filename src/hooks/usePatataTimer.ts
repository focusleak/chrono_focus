import { useEffect, useRef, useCallback } from 'react'
import { format } from 'date-fns'
import { sendNotification } from '@/lib/utils'

import { usePrecisionTimer } from './common/usePrecisionTimer'

import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'

/**
 * 土豆钟计时 Hook
 *
 * 管理娱乐时间（土豆钟）的计时逻辑
 * 使用精确时间源，不受浏览器后台限流影响
 * 基于 elapsed 时间戳计算，避免 ±1 累积误差
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

  // 记录上次触发的 elapsed，用于检测新的 tick
  const lastElapsedRef = useRef<number>(0)
  const limitReachedRef = useRef(false)

  // 处理计时器 tick
  const handleTick = useCallback((state: { elapsed: number }) => {
    const state_ = useRuntimeStore.getState()
    if (!state_.isPatataRunning) return

    const settings = useSettingsStore.getState()
    const elapsedSeconds = Math.floor(state.elapsed / 1000)

    // 防止重复处理同一秒
    if (elapsedSeconds <= lastElapsedRef.current) return
    lastElapsedRef.current = elapsedSeconds

    const dailyPatataLimit = settings.dailyPatataLimit * 60

    // 当超出限制时，累加 dailyStats 中的 patataTime
    if (elapsedSeconds > dailyPatataLimit) {
      const today = format(new Date(), 'yyyy-MM-dd')
      const todayStats = state_.dailyStats.find(s => s.date === today)
      const newDailyStats = todayStats
        ? state_.dailyStats.map(s => s.date === today ? { ...s, patataTime: s.patataTime + 1 } : s)
        : [...state_.dailyStats, { date: today, pomodoros: 0, focusTime: 0, waterCount: 0, tasksCompleted: 0, patataTime: 1 }]
      useRuntimeStore.setState({ patataElapsedTime: elapsedSeconds, dailyStats: newDailyStats })
    } else {
      // 刚好到达限制时发送通知（仅一次）
      if (elapsedSeconds === dailyPatataLimit && !limitReachedRef.current) {
        limitReachedRef.current = true
        sendNotification('娱乐时间已用完', '已达到每日娱乐时间限制。建议休息一下，然后回去专注工作！')
      }
      useRuntimeStore.setState({ patataElapsedTime: elapsedSeconds })
    }
  }, [])

  // 运行状态变化时重置标记
  useEffect(() => {
    if (!isPatataRunning) {
      lastElapsedRef.current = 0
      limitReachedRef.current = false
    }
  }, [isPatataRunning])

  // 注册精确计时器（正计时模式）
  usePrecisionTimer({
    id: 'patata',
    mode: 'stopwatch',
    enabled: isPatataRunning && !showRestReminderPrompt,
    interval: 1000,
    onTick: handleTick,
  })
}
