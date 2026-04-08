import { useEffect, useRef } from 'react'
import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { sendNotification, playSound } from '@/lib/utils'
import { useReminder } from './useReminder'
import { useInterval } from './useInterval'

export const usePomodoroTimer = () => {
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const pomodoroTimeLeft = useRuntimeStore.use.pomodoroTimeLeft()
  const pomodoroType = useRuntimeStore.use.pomodoroType()
  const tickPomodoro = useRuntimeStore.use.tickPomodoro()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()

  const restReminderEnabled = useSettingsStore.use.restReminderEnabled()
  const restReminderInterval = useSettingsStore.use.restReminderInterval()
  const waterReminderEnabled = useSettingsStore.use.waterReminderEnabled()
  const waterReminderInterval = useSettingsStore.use.waterReminderInterval()
  const standReminderEnabled = useSettingsStore.use.standReminderEnabled()
  const standReminderInterval = useSettingsStore.use.standReminderInterval()
  const stretchReminderEnabled = useSettingsStore.use.stretchReminderEnabled()
  const stretchReminderInterval = useSettingsStore.use.stretchReminderInterval()
  const gazeReminderEnabled = useSettingsStore.use.gazeReminderEnabled()
  const gazeReminderInterval = useSettingsStore.use.gazeReminderInterval()
  const walkReminderEnabled = useSettingsStore.use.walkReminderEnabled()
  const walkReminderInterval = useSettingsStore.use.walkReminderInterval()

  const isWorking = pomodoroType === 'pomodoro' && isPomodoroRunning

  // 主定时器：当休息提醒弹窗显示时暂停
  useInterval(tickPomodoro, 1000, isPomodoroRunning && !showRestReminderPrompt)

  // 定时器结束时发送通知
  const prevTimeLeftRef = useRef(pomodoroTimeLeft)
  useEffect(() => {
    if (prevTimeLeftRef.current > 0 && pomodoroTimeLeft === 0) {
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

    prevTimeLeftRef.current = pomodoroTimeLeft
  }, [pomodoroTimeLeft, pomodoroType])

  // 使用通用提醒 Hook
  useReminder(
    restReminderEnabled,
    restReminderInterval,
    '休息提醒',
    '你已经工作一段时间了，记得休息一下哦！',
    isWorking,
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
    isWorking,
  )

  useReminder(
    stretchReminderEnabled,
    stretchReminderInterval,
    '拉伸提醒',
    '是时候做些伸展运动了，活动一下身体！',
    isWorking,
  )

  useReminder(
    gazeReminderEnabled,
    gazeReminderInterval,
    '远眺提醒',
    '看向远方，放松一下你的眼睛！',
    isWorking,
  )

  useReminder(
    walkReminderEnabled,
    walkReminderInterval,
    '走动提醒',
    '你已经坐了一段时间了，起身走走吧！',
    isWorking,
  )
}
