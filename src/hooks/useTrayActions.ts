import { useEffect, useRef } from 'react'
import { useRuntimeStore } from '@/store/runtimeStore'

/**
 * 系统托盘动作监听 Hook
 * 
 * 监听来自系统托盘的交互动作（点击、暂停、重置等）
 * 并执行对应的番茄钟/土豆钟/休息提醒操作
 * 使用 ref 避免闭包捕获过期状态值
 * 
 * @returns void
 * 
 * @example
 * ```tsx
 * function App() {
 *   useTrayActions()
 *   // ... 其他组件
 * }
 * ```
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
        case 'break-toggle':
          if (s.isPomodoroRunning) {
            s.pausePomodoro()
          } else {
            s.startPomodoro()
          }
          break
        case 'pomodoro-abort':
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
