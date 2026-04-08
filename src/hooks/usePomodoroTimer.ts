import { useEffect, useRef } from 'react'
import { sendNotification, playSound } from '@/lib/utils'

import { useInterval } from './common/useInterval'

import { useRuntimeStore } from '@/store/runtimeStore'

import { PomodoroStatus } from '@/types'

export const usePomodoroTimer = () => {
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const pomodoroTimeLeft = useRuntimeStore.use.pomodoroTimeLeft()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()
  const tickPomodoro = useRuntimeStore.use.tickPomodoro()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()



  // 主定时器：当休息提醒弹窗显示时暂停
  useInterval(tickPomodoro, 1000, isPomodoroRunning && !showRestReminderPrompt)

  // 定时器结束时发送通知
  const prevTimeLeftRef = useRef(pomodoroTimeLeft)
  useEffect(() => {
    if (prevTimeLeftRef.current > 0 && pomodoroTimeLeft === 0) {
      // 定时器刚结束
      const messages: Record<PomodoroStatus, { title: string; body: string }> = {
        [PomodoroStatus.Pomodoro]: { title: '番茄钟完成！', body: '休息一下吧' },
        [PomodoroStatus.ShortBreak]: { title: '短休息结束', body: '开始新的番茄钟吧' },
        [PomodoroStatus.LongBreak]: { title: '长休息结束', body: '准备好继续工作了吗？' },
      }

      const message = messages[pomodoroStatus] || { title: '提醒', body: '时间到了！' }
      sendNotification(message.title, message.body)
      playSound('complete')
    }

    prevTimeLeftRef.current = pomodoroTimeLeft
  }, [pomodoroTimeLeft, pomodoroStatus])

  
}
