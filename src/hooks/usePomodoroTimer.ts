import { useEffect, useRef } from 'react'
import { sendNotification } from '@/lib/utils'

import { useInterval } from './common/useInterval'

import { useRuntimeStore } from '@/store/runtimeStore'

import { PomodoroStatus } from '@/types'

/**
 * 番茄钟计时 Hook
 * 
 * 管理番茄钟和休息时间的倒计时逻辑
 * 当休息提醒弹窗显示时自动暂停计时
 * 计时结束时发送系统通知
 * 
 * @returns void
 * 
 * @example
 * ```tsx
 * function PomodoroPage() {
 *   usePomodoroTimer()
 *   // ... 组件逻辑
 * }
 * ```
 */
export const usePomodoroTimer = () => {
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const pomodoroTimeLeft = useRuntimeStore.use.pomodoroTimeLeft()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()
  const tickPomodoro = useRuntimeStore.use.tickPomodoro()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()

  // 主定时器：每秒执行一次倒计时
  // 当休息提醒弹窗显示时暂停计时
  useInterval(tickPomodoro, 1000, isPomodoroRunning && !showRestReminderPrompt)

  // 监听倒计时结束事件，发送完成通知
  const prevTimeLeftRef = useRef(pomodoroTimeLeft)
  useEffect(() => {
    // 检测从有剩余时间到 0 的瞬间
    if (prevTimeLeftRef.current > 0 && pomodoroTimeLeft === 0) {
      // 根据当前状态发送不同的通知
      const messages: Record<PomodoroStatus, { title: string; body: string }> = {
        [PomodoroStatus.Pomodoro]: { title: '番茄钟完成！', body: '休息一下吧' },
        [PomodoroStatus.ShortBreak]: { title: '短休息结束', body: '开始新的番茄钟吧' },
        [PomodoroStatus.LongBreak]: { title: '长休息结束', body: '准备好继续工作了吗？' },
      }

      const message = messages[pomodoroStatus] || { title: '提醒', body: '时间到了！' }
      sendNotification(message.title, message.body)
      // playSound('complete')
    }

    prevTimeLeftRef.current = pomodoroTimeLeft
  }, [pomodoroTimeLeft, pomodoroStatus])
}
