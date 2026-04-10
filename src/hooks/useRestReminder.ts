import { useEffect, useRef } from 'react'
import { sendNotification } from '@/lib/utils'

import { useInterval } from './common/useInterval'

import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'

/**
 * 休息提醒倒计时 Hook
 * 应用启动后自动开始倒计时，到时间后弹出全屏提醒
 * 当番茄钟或土豆钟运行时暂停，结束后恢复
 * 当休息提醒弹窗显示时暂停所有计时，弹窗关闭后恢复
 */
export const useRestReminder = () => {
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const isPatataRunning = useRuntimeStore.use.isPatataRunning()
  const restReminderTimeLeft = useRuntimeStore.use.restReminderTimeLeft()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()
  const restReminderPaused = useRuntimeStore.use.restReminderPaused()
  const tickRestReminder = useRuntimeStore.use.tickRestReminder()
  const resetRestReminder = useRuntimeStore.use.resetRestReminder()
  const setShowRestReminderPrompt = useRuntimeStore.use.setShowRestReminderPrompt()
  const restReminderEnabled = useSettingsStore.use.restReminderEnabled()
  const restReminderNotification = useSettingsStore.use.restReminderNotification()

  const hasNotifiedRef = useRef(false)
  const prevShowPromptRef = useRef(false)
  const prevRunningRef = useRef(isPomodoroRunning || isPatataRunning)

  // 用 ref 存储最新状态
  const tickRef = useRef(tickRestReminder)
  const resetRef = useRef(resetRestReminder)
  useEffect(() => {
    tickRef.current = tickRestReminder
    resetRef.current = resetRestReminder
  }, [tickRestReminder, resetRestReminder])

  // 是否应该运行休息提醒倒计时
  const shouldRun = restReminderEnabled && !isPomodoroRunning && !isPatataRunning && !showRestReminderPrompt && !restReminderPaused

  // 主定时器：使用统一定时器
  useInterval(
    () => {
      tickRef.current()
    },
    1000,
    shouldRun
  )

  // 当倒计时到 0 时显示全屏弹窗
  useEffect(() => {
    if (restReminderTimeLeft <= 0 && shouldRun && !showRestReminderPrompt && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true
      setShowRestReminderPrompt(true)
      if (restReminderNotification) {
        sendNotification('休息提醒', '你已经工作一段时间了，记得休息一下哦！')
        // playSound('remind')
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
    const nowRunning = isPomodoroRunning || isPatataRunning
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
  }, [isPomodoroRunning, isPatataRunning])
}
