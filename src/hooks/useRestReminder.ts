import { useEffect, useRef } from 'react'
import { useStore } from '../store/store'
import { sendNotification, playSound } from '../lib/utils'

/**
 * 休息提醒倒计时 Hook
 * 应用启动后自动开始倒计时，到时间后弹出全屏提醒
 * 当番茄钟或土豆钟运行时暂停，结束后恢复
 * 当休息提醒弹窗显示时暂停所有计时，弹窗关闭后恢复
 */
export const useRestReminder = () => {
  const {
    isPomodoroRunning,
    isPotatoRunning,
    restReminderEnabled,
    restReminderNotification,
    restReminderTimeLeft,
    showRestReminderPrompt,
    restReminderPaused,
    tickRestReminder,
    resetRestReminder,
    setShowRestReminderPrompt,
  } = useStore()

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasNotifiedRef = useRef(false)
  const prevShowPromptRef = useRef(false)
  const prevRunningRef = useRef(isPomodoroRunning || isPotatoRunning)

  // 用 ref 存储最新状态
  const tickRef = useRef(tickRestReminder)
  const resetRef = useRef(resetRestReminder)
  useEffect(() => {
    tickRef.current = tickRestReminder
    resetRef.current = resetRestReminder
  }, [tickRestReminder, resetRestReminder])

  // 是否应该运行休息提醒倒计时
  const shouldRun = restReminderEnabled && !isPomodoroRunning && !isPotatoRunning && !showRestReminderPrompt && !restReminderPaused

  // 主定时器 useEffect
  useEffect(() => {
    if (shouldRun) {
      // 每次开始运行时，确保通知标记为 false
      hasNotifiedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      intervalRef.current = setInterval(() => {
        tickRef.current()
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [shouldRun])

  // 当倒计时到 0 时显示全屏弹窗
  useEffect(() => {
    if (restReminderTimeLeft <= 0 && shouldRun && !showRestReminderPrompt && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true
      setShowRestReminderPrompt(true)
      if (restReminderNotification) {
        sendNotification('休息提醒', '你已经工作一段时间了，记得休息一下哦！')
        playSound('remind')
      }
    }
  }, [restReminderTimeLeft, shouldRun, showRestReminderPrompt, restReminderNotification, setShowRestReminderPrompt])

  // 监听 showRestReminderPrompt 从 true 变为 false（遮罩关闭），重置通知标记
  useEffect(() => {
    if (prevShowPromptRef.current && !showRestReminderPrompt) {
      // 遮罩刚关闭，立即重置通知标记
      hasNotifiedRef.current = false
    }
    prevShowPromptRef.current = showRestReminderPrompt
  }, [showRestReminderPrompt])

  // 监听专注状态变化，重置休息提醒
  useEffect(() => {
    const nowRunning = isPomodoroRunning || isPotatoRunning
    const wasRunning = prevRunningRef.current

    if (nowRunning && !wasRunning) {
      // 刚开始专注：重置休息提醒
      resetRef.current()
      hasNotifiedRef.current = false
    } else if (!nowRunning && wasRunning) {
      // 刚结束专注：重置休息提醒以开始新的倒计时
      resetRef.current()
      hasNotifiedRef.current = false
    }
    prevRunningRef.current = nowRunning
  }, [isPomodoroRunning, isPotatoRunning])
}
