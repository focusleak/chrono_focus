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
    isRunning,
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

  // 是否应该运行休息提醒倒计时
  // 当弹窗显示时暂停倒计时（等待用户操作）
  // 当手动暂停时也暂停
  const shouldRun = restReminderEnabled && !isRunning && !isPotatoRunning && !showRestReminderPrompt && !restReminderPaused

  useEffect(() => {
    if (shouldRun) {
      hasNotifiedRef.current = false
      // 清除旧定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // 启动新倒计时
      intervalRef.current = setInterval(() => {
        tickRestReminder()
      }, 1000)
    } else {
      // 停止倒计时
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
  }, [shouldRun, tickRestReminder])

  // 当倒计时到 0 时显示全屏弹窗 + 发送通知
  useEffect(() => {
    if (restReminderTimeLeft <= 0 && shouldRun && !showRestReminderPrompt && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true
      setShowRestReminderPrompt(true)
      // 只在设置启用时发送通知和播放提示音
      if (restReminderNotification) {
        sendNotification('休息提醒', '你已经工作一段时间了，记得休息一下哦！')
        playSound('remind')
      }
    }
  }, [restReminderTimeLeft, shouldRun, showRestReminderPrompt, restReminderNotification, setShowRestReminderPrompt])

  // 当番茄钟或土豆钟开始时，重置休息提醒倒计时（不运行）
  useEffect(() => {
    if ((isRunning || isPotatoRunning) && restReminderTimeLeft > 0) {
      resetRestReminder()
      hasNotifiedRef.current = false
    }
  }, [isRunning, isPotatoRunning, restReminderTimeLeft, resetRestReminder])

  // 当番茄钟或土豆钟停止时，确保休息提醒倒计时被重置
  useEffect(() => {
    if (!isRunning && !isPotatoRunning && restReminderTimeLeft <= 0 && restReminderEnabled && !restReminderPaused) {
      resetRestReminder()
      hasNotifiedRef.current = false
    }
  }, [isRunning, isPotatoRunning, restReminderTimeLeft, restReminderEnabled, restReminderPaused, resetRestReminder])
}
