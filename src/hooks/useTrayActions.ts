import { useEffect, useRef } from 'react'
import { useStore } from '../store/store'

/**
 * 监听托盘动作并执行对应操作
 */
export const useTrayActions = () => {
  const {
    isPomodoroRunning,
    isPotatoRunning,
    pomodoroType,
    pausePomodoro,
    startPomodoro,
    resetPomodoro,
    pausePotato,
    startPotato,
    resetPotato,
    restReminderPaused,
    toggleRestReminderPause,
  } = useStore()

  // 用 ref 存储最新的状态和方法，避免闭包捕获过期值
  const stateRef = useRef({
    isPomodoroRunning,
    isPotatoRunning,
    pomodoroType,
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
      pomodoroType,
      restReminderPaused,
      pausePomodoro,
      startPomodoro,
      resetPomodoro,
      pausePotato,
      startPotato,
      resetPotato,
      toggleRestReminderPause,
    }
  }, [isPomodoroRunning, isPotatoRunning, pomodoroType, restReminderPaused,
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
