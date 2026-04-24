import { useEffect, useRef, useCallback } from 'react'
import { sendNotification } from '@/lib/utils'

import { usePrecisionTimer } from './common/usePrecisionTimer'

import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'

/**
 * 休息提醒倒计时 Hook
 * 
 * 使用精确时间源，不受浏览器后台限流影响
 * 基于 remaining 时间戳计算，避免 ±1 累积误差
 * 
 * 应用启动后自动开始倒计时，到时间后弹出全屏提醒
 * 当番茄钟或土豆钟运行时暂停，结束后恢复
 * 当休息提醒弹窗显示时暂停所有计时，弹窗关闭后恢复
 */
export const useRestReminder = () => {
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const isPatataRunning = useRuntimeStore.use.isPatataRunning()
  const restReminderTotalTime = useRuntimeStore.use.restReminderTotalTime()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()
  const restReminderPaused = useRuntimeStore.use.restReminderPaused()
  const setShowRestReminderPrompt = useRuntimeStore.use.setShowRestReminderPrompt()
  const resetRestReminder = useRuntimeStore.use.resetRestReminder()
  const restReminderEnabled = useSettingsStore.use.restReminderEnabled()
  const restReminderNotification = useSettingsStore.use.restReminderNotification()

  const hasNotifiedRef = useRef(false)
  const prevShowPromptRef = useRef(false)
  const prevRunningRef = useRef(isPomodoroRunning || isPatataRunning)
  const prevRemainingRef = useRef<number | null>(null)

  // 是否应该运行休息提醒倒计时
  const shouldRun = restReminderEnabled && !isPomodoroRunning && !isPatataRunning && !showRestReminderPrompt && !restReminderPaused

  // 处理计时器 tick
  const handleTick = useCallback((state: { remaining?: number }) => {
    if (state.remaining === undefined) return

    const remainingSeconds = Math.ceil(state.remaining / 1000)
    const prevRemaining = prevRemainingRef.current

    // 更新剩余时间
    useRuntimeStore.setState({ restReminderTimeLeft: remainingSeconds })
    prevRemainingRef.current = remainingSeconds

    // 检测倒计时结束
    if (prevRemaining !== null && prevRemaining > 0 && remainingSeconds <= 0) {
      handleRestReminderComplete()
    }
  }, [])

  // 处理休息提醒倒计时完成
  const handleRestReminderComplete = useCallback(() => {
    if (hasNotifiedRef.current) return
    hasNotifiedRef.current = true

    setShowRestReminderPrompt(true)
    if (restReminderNotification) {
      sendNotification('休息提醒', '你已经工作一段时间了，记得休息一下哦！')
      // playSound('remind')
    }
  }, [restReminderNotification, setShowRestReminderPrompt])

  // 监听 showRestReminderPrompt 从 true 变为 false（遮罩关闭），重置通知标记
  useEffect(() => {
    if (prevShowPromptRef.current && !showRestReminderPrompt) {
      // 遮罩刚关闭，重置通知标记
      hasNotifiedRef.current = false
    }
    prevShowPromptRef.current = showRestReminderPrompt
  }, [showRestReminderPrompt])

  // 监听专注状态变化，重置休息提醒
  useEffect(() => {
    const nowRunning = isPomodoroRunning || isPatataRunning
    const wasRunning = prevRunningRef.current

    if (nowRunning && !wasRunning) {
      // 刚开始专注：重置休息提醒
      resetRestReminder()
      hasNotifiedRef.current = false
      prevRemainingRef.current = null
    } else if (!nowRunning && wasRunning) {
      // 刚结束专注：重置休息提醒以开始新的倒计时
      resetRestReminder()
      hasNotifiedRef.current = false
      prevRemainingRef.current = null
    }
    prevRunningRef.current = nowRunning
  }, [isPomodoroRunning, isPatataRunning, resetRestReminder])

  // 注册精确计时器
  const durationMs = restReminderTotalTime * 1000

  usePrecisionTimer({
    id: 'restReminder',
    mode: 'countdown',
    duration: durationMs,
    enabled: shouldRun,
    interval: 1000,
    onTick: handleTick,
  })
}
