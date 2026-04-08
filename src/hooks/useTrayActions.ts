import { useEffect, useRef } from 'react'
import { useRuntimeStore } from '@/store/runtimeStore'

/**
 * 监听托盘动作并执行对应操作
 */
export const useTrayActions = () => {
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const isPotatoRunning = useRuntimeStore.use.isPotatoRunning()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()
  const pausePomodoro = useRuntimeStore.use.pausePomodoro()
  const startPomodoro = useRuntimeStore.use.startPomodoro()
  const resetPomodoro = useRuntimeStore.use.resetPomodoro()
  const pausePotato = useRuntimeStore.use.pausePotato()
  const startPotato = useRuntimeStore.use.startPotato()
  const resetPotato = useRuntimeStore.use.resetPotato()
  const restReminderPaused = useRuntimeStore.use.restReminderPaused()
  const toggleRestReminderPause = useRuntimeStore.use.toggleRestReminderPause()

  // 用 ref 存储最新的状态和方法，避免闭包捕获过期值
  const stateRef = useRef({
    isPomodoroRunning,
    isPotatoRunning,
    pomodoroStatus,
    restReminderPaused,
    pausePomodoro,
    startPomodoro,
    resetPomodoro,
    pausePotato,
    startPotato,
    resetPotato,
    toggleRestReminderPause,
  })

  useEffect(() => {
    stateRef.current = {
      isPomodoroRunning,
      isPotatoRunning,
      pomodoroStatus,
      restReminderPaused,
      pausePomodoro,
      startPomodoro,
      resetPomodoro,
      pausePotato,
      startPotato,
      resetPotato,
      toggleRestReminderPause,
    }
  }, [isPomodoroRunning, isPotatoRunning, pomodoroStatus, restReminderPaused,
    pausePomodoro, startPomodoro, resetPomodoro,
    pausePotato, startPotato, resetPotato,
    toggleRestReminderPause])

  useEffect(() => {
    if (!window.electronAPI?.onTrayAction) return

    const handler = (action: string) => {
      const s = stateRef.current
      switch (action) {
        case 'start-pomodoro':
          s.startPomodoro()
          break
        case 'pomodoro-toggle':
          if (s.isPomodoroRunning) {
            s.pausePomodoro()
          } else {
            s.startPomodoro()
          }
          break
        case 'pomodoro-abort':
          s.resetPomodoro()
          break
        case 'break-toggle':
          if (s.isPomodoroRunning) {
            s.pausePomodoro()
          } else {
            s.startPomodoro()
          }
          break
        case 'break-abort':
          s.resetPomodoro()
          break
        case 'potato-toggle':
          if (s.isPotatoRunning) {
            s.pausePotato()
          } else {
            s.startPotato()
          }
          break
        case 'potato-abort':
          s.resetPotato()
          break
        case 'rest-toggle':
          s.toggleRestReminderPause()
          break
      }
    }

    const cleanup = window.electronAPI.onTrayAction(handler)

    return () => {
      cleanup()
    }
  }, [])
}
