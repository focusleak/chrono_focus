import { useEffect, useRef, useCallback } from 'react'
import { format } from 'date-fns'
import { sendNotification } from '@/lib/utils'

import { useInterval } from './common/useInterval'

import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'

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
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()

  const tickPomodoro = useCallback(() => {
    const settings = useSettingsStore.getState()

    if (pomodoroTimeLeft <= 1) {
      // 倒计时结束，切换状态
      if (pomodoroStatus === PomodoroStatus.Pomodoro) {
        const newCompletedPomodoros = useRuntimeStore.getState().completedPomodoros + 1
        const theBreakType = newCompletedPomodoros % 4 === 0 ? PomodoroStatus.LongBreak : PomodoroStatus.ShortBreak
        const breakTime = theBreakType === PomodoroStatus.LongBreak ? settings.pomodoroLongBreakTime : settings.pomodoroShortBreakTime

        useRuntimeStore.setState({
          completedPomodoros: newCompletedPomodoros,
          totalFocusTime: useRuntimeStore.getState().totalFocusTime + settings.pomodoroTime,
          pomodoroStatus: theBreakType,
          pomodoroTimeLeft: breakTime * 60,
          currentPomodoroTime: breakTime * 60,
          isPomodoroRunning: false,
        })
      } else if (pomodoroStatus === PomodoroStatus.ShortBreak || pomodoroStatus === PomodoroStatus.LongBreak) {
        const pomTime = settings.pomodoroTime * 60
        useRuntimeStore.setState({
          pomodoroStatus: PomodoroStatus.Pomodoro,
          pomodoroTimeLeft: pomTime,
          currentPomodoroTime: pomTime,
          isPomodoroRunning: false,
        })
      }
    } else {
      // 正常倒计时
      useRuntimeStore.setState({ pomodoroTimeLeft: pomodoroTimeLeft - 1 })
    }
  }, [pomodoroTimeLeft, pomodoroStatus])

  // 主定时器：每秒执行一次倒计时
  // 当休息提醒弹窗显示时暂停计时
  useInterval(tickPomodoro, 1000, isPomodoroRunning && !showRestReminderPrompt)

  // 监听倒计时结束事件，发送完成通知 + 更新任务/统计
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

      // 番茄钟完成时更新任务和统计数据
      if (pomodoroStatus === PomodoroStatus.Pomodoro) {
        const state = useRuntimeStore.getState()
        const { currentPomodoroTaskId, tasks, waterCount, dailyStats } = state
        const settings = useSettingsStore.getState()

        if (currentPomodoroTaskId) {
          const updatedTasks = tasks.map(task =>
            task.id === currentPomodoroTaskId
              ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
              : task
          )
          useRuntimeStore.setState({ tasks: updatedTasks })
        }

        const today = format(new Date(), 'yyyy-MM-dd')
        const todayStats = dailyStats.find(s => s.date === today)
        const newDailyStats = todayStats
          ? dailyStats.map(s => s.date === today
            ? { ...s, pomodoros: s.pomodoros + 1, focusTime: s.focusTime + settings.pomodoroTime }
            : s
          )
          : [...dailyStats, {
            date: today,
            pomodoros: 1,
            focusTime: settings.pomodoroTime,
            waterCount,
            tasksCompleted: 0,
            potatoTime: 0,
          }]
        useRuntimeStore.setState({ dailyStats: newDailyStats })
      }

      // playSound('complete')
    }

    prevTimeLeftRef.current = pomodoroTimeLeft
  }, [pomodoroTimeLeft, pomodoroStatus])
}
