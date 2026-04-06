import { useEffect, useRef } from 'react'
import { useTimerStore } from '../store/timerStore'
import { sendNotification, playSound } from '../utils/helpers'

// 自动启动休息提醒：应用一打开就计时，按设置的休息间隔提醒
// 如果用户主动开始番茄钟，则暂停此自动提醒，由番茄钟逻辑接管
export const useAutoStart = () => {
  const { isRunning, timerType, restReminderEnabled, restReminderInterval } = useTimerStore()
  
  const reminderRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // 只有在没有运行番茄钟（且不是休息模式）时才启动自动提醒
    const shouldAutoStart = !isRunning && timerType === 'pomodoro' && restReminderEnabled

    if (shouldAutoStart) {
      // 清除旧的定时器
      if (reminderRef.current) {
        clearInterval(reminderRef.current)
      }

      // 启动新的休息提醒
      reminderRef.current = setInterval(() => {
        sendNotification('休息提醒', '你已经工作一段时间了，记得休息一下哦！')
        playSound('remind')
      }, restReminderInterval * 60 * 1000)
    } else {
      // 番茄钟运行中或处于休息模式，清除自动提醒（由useTimer接管）
      if (reminderRef.current) {
        clearInterval(reminderRef.current)
        reminderRef.current = null
      }
    }

    return () => {
      if (reminderRef.current) {
        clearInterval(reminderRef.current)
      }
    }
  }, [isRunning, timerType, restReminderEnabled, restReminderInterval])
}
