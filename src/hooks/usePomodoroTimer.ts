import { useEffect, useRef } from 'react'
import { useStore } from '../store/store'
import { sendNotification, playSound } from '../lib/utils'
import { useReminder } from './useReminder'
import { useInterval } from './useInterval'

export const usePomodoroTimer = () => {
  const {
    isRunning,
    timeLeft,
    pomodoroType,
    tick,
    restReminderEnabled,
    restReminderInterval,
    waterReminderEnabled,
    waterReminderInterval,
    standReminderEnabled,
    standReminderInterval,
    stretchReminderEnabled,
    stretchReminderInterval,
    gazeReminderEnabled,
    gazeReminderInterval,
    walkReminderEnabled,
    walkReminderInterval,
    showRestReminderPrompt,
  } = useStore()

  // 主定时器：当休息提醒弹窗显示时暂停
  useInterval(tick, 1000, isRunning && !showRestReminderPrompt)

  // 定时器结束时发送通知
  const prevTimeLeftRef = useRef(timeLeft)
  useEffect(() => {
    if (prevTimeLeftRef.current > 0 && timeLeft === 0) {
      // 定时器刚结束
      const messages: Record<string, { title: string; body: string }> = {
        pomodoro: { title: '番茄钟完成！', body: '休息一下吧' },
        shortBreak: { title: '短休息结束', body: '开始新的番茄钟吧' },
        longBreak: { title: '长休息结束', body: '准备好继续工作了吗？' },
      }

      const message = messages[pomodoroType] || { title: '提醒', body: '时间到了！' }
      sendNotification(message.title, message.body)
      playSound('complete')
    }

    prevTimeLeftRef.current = timeLeft
  }, [timeLeft, pomodoroType])

  // 使用通用提醒 Hook
  useReminder(
    restReminderEnabled,
    restReminderInterval,
    '休息提醒',
    '你已经工作一段时间了，记得休息一下哦！',
    pomodoroType === 'pomodoro',
  )

  useReminder(
    waterReminderEnabled,
    waterReminderInterval,
    '喝水提醒',
    '该喝水啦！保持身体健康！',
  )

  useReminder(
    standReminderEnabled,
    standReminderInterval,
    '站立提醒',
    '你已经坐了一段时间了，站起来活动一下吧！',
    pomodoroType === 'pomodoro' && isRunning,
  )

  useReminder(
    stretchReminderEnabled,
    stretchReminderInterval,
    '拉伸提醒',
    '是时候做些伸展运动了，活动一下身体！',
    pomodoroType === 'pomodoro' && isRunning,
  )

  useReminder(
    gazeReminderEnabled,
    gazeReminderInterval,
    '远眺提醒',
    '看向远方，放松一下你的眼睛！',
    pomodoroType === 'pomodoro' && isRunning,
  )

  useReminder(
    walkReminderEnabled,
    walkReminderInterval,
    '走动提醒',
    '你已经坐了一段时间了，起身走走吧！',
    pomodoroType === 'pomodoro' && isRunning,
  )
}
