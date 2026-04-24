import { useEffect, useRef, useCallback } from 'react'
import { format } from 'date-fns'
import { sendNotification } from '@/lib/utils'

import { usePrecisionTimer } from './common/usePrecisionTimer'

import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'

import { PomodoroStatus } from '@/types'

/**
 * 番茄钟计时 Hook
 *
 * 管理番茄钟和休息时间的倒计时逻辑
 * 使用精确时间源，不受浏览器后台限流影响
 * 基于 elapsed/remaining 时间戳计算，避免 ±1 累积误差
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
  const currentPomodoroTime = useRuntimeStore.use.currentPomodoroTime()

  // 记录是否刚完成一次倒计时（用于触发完成事件）
  const prevRemainingRef = useRef<number | null>(null)

  // 使用 ref 保存最新的状态值，避免闭包问题
  const stateRef = useRef({
    pomodoroTimeLeft,
    pomodoroStatus,
    currentPomodoroTime: currentPomodoroTime as number,
  })

  useEffect(() => {
    stateRef.current = {
      pomodoroTimeLeft,
      pomodoroStatus,
      currentPomodoroTime,
    }
  }, [pomodoroTimeLeft, pomodoroStatus, currentPomodoroTime])

  // 处理计时器 tick
  const handleTick = useCallback((state: { elapsed: number; remaining?: number }) => {
    if (state.remaining === undefined) return

    // 基于精确 remaining 计算剩余秒数
    const remainingSeconds = Math.ceil(state.remaining / 1000)
    const prevRemaining = prevRemainingRef.current

    // 更新剩余时间
    useRuntimeStore.setState({ pomodoroTimeLeft: remainingSeconds })
    prevRemainingRef.current = remainingSeconds

    // 检测倒计时结束（从 >0 到 0）
    if (prevRemaining !== null && prevRemaining > 0 && remainingSeconds === 0) {
      handlePomodoroComplete()
    }
  }, [])

  // 处理番茄钟完成
  const handlePomodoroComplete = useCallback(() => {
    const { pomodoroStatus } = stateRef.current
    const settings = useSettingsStore.getState()

    if (pomodoroStatus === PomodoroStatus.Pomodoro) {
      // 番茄钟完成
      const newCompletedPomodoros = useRuntimeStore.getState().completedPomodoros + 1
      const theBreakType = newCompletedPomodoros % 4 === 0 ? PomodoroStatus.LongBreak : PomodoroStatus.ShortBreak
      const breakTime = theBreakType === PomodoroStatus.LongBreak ? settings.pomodoroLongBreakTime : settings.pomodoroShortBreakTime
      const breakDuration = breakTime * 60

      useRuntimeStore.setState({
        completedPomodoros: newCompletedPomodoros,
        totalFocusTime: useRuntimeStore.getState().totalFocusTime + settings.pomodoroTime,
        pomodoroStatus: theBreakType,
        pomodoroTimeLeft: breakDuration,
        currentPomodoroTime: breakDuration,
        isPomodoroRunning: false,
      })

      sendNotification('番茄钟完成！', '休息一下吧')
      updateTasksAndStats()
    } else if (pomodoroStatus === PomodoroStatus.ShortBreak || pomodoroStatus === PomodoroStatus.LongBreak) {
      // 休息结束，切换回番茄钟
      const pomDuration = settings.pomodoroTime * 60
      useRuntimeStore.setState({
        pomodoroStatus: PomodoroStatus.Pomodoro,
        pomodoroTimeLeft: pomDuration,
        currentPomodoroTime: pomDuration,
        isPomodoroRunning: false,
      })

      const message = pomodoroStatus === PomodoroStatus.ShortBreak
        ? { title: '短休息结束', body: '开始新的番茄钟吧' }
        : { title: '长休息结束', body: '准备好继续工作了吗？' }
      sendNotification(message.title, message.body)
    }
  }, [])

  // 更新任务和统计数据
  const updateTasksAndStats = useCallback(() => {
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
        patataTime: 0,
      }]
    useRuntimeStore.setState({ dailyStats: newDailyStats })
  }, [])

  // 注册精确计时器
  const durationMs = currentPomodoroTime * 1000

  usePrecisionTimer({
    id: 'pomodoro',
    mode: 'countdown',
    duration: durationMs,
    enabled: isPomodoroRunning && !showRestReminderPrompt,
    interval: 1000,
    onTick: handleTick,
  })
}
