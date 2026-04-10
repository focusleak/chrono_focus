import { useEffect, useRef } from 'react'
import { useRuntimeStore } from '@/store/runtimeStore'
import { createTrayActionStrategy } from '@/utils/platform-strategies'

/**
 * 系统托盘动作监听 Hook
 *
 * 监听来自系统托盘的交互动作（点击、暂停、重置等）
 * 并执行对应的番茄钟/土豆钟/休息提醒操作
 * 使用 ref 避免闭包捕获过期状态值
 * 使用策略模式自动适配 Electron/浏览器环境
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
  const isPatataRunning = useRuntimeStore.use.isPatataRunning()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()
  const pausePomodoro = useRuntimeStore.use.pausePomodoro()
  const startPomodoro = useRuntimeStore.use.startPomodoro()
  const resetPomodoro = useRuntimeStore.use.resetPomodoro()
  const pausePatata = useRuntimeStore.use.pausePatata()
  const startPatata = useRuntimeStore.use.startPatata()
  const resetPatata = useRuntimeStore.use.resetPatata()
  const restReminderPaused = useRuntimeStore.use.restReminderPaused()
  const toggleRestReminderPause = useRuntimeStore.use.toggleRestReminderPause()

  // 用 ref 存储最新的状态和方法，避免闭包捕获过期值
  const stateRef = useRef({
    isPomodoroRunning,
    isPatataRunning,
    pomodoroStatus,
    restReminderPaused,
    pausePomodoro,
    startPomodoro,
    resetPomodoro,
    pausePatata,
    startPatata,
    resetPatata,
    toggleRestReminderPause,
  })

  useEffect(() => {
    stateRef.current = {
      isPomodoroRunning,
      isPatataRunning,
      pomodoroStatus,
      restReminderPaused,
      pausePomodoro,
      startPomodoro,
      resetPomodoro,
      pausePatata,
      startPatata,
      resetPatata,
      toggleRestReminderPause,
    }
  }, [isPomodoroRunning, isPatataRunning, pomodoroStatus, restReminderPaused,
    pausePomodoro, startPomodoro, resetPomodoro,
    pausePatata, startPatata, resetPatata,
    toggleRestReminderPause])

  useEffect(() => {
    const strategy = createTrayActionStrategy()

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
        case 'patata-toggle':
          if (s.isPatataRunning) {
            s.pausePatata()
          } else {
            s.startPatata()
          }
          break
        case 'patata-abort':
          s.resetPatata()
          break
        case 'rest-toggle':
          s.toggleRestReminderPause()
          break
      }
    }

    const cleanup = strategy.onAction(handler)

    return () => {
      cleanup()
    }
  }, [])
}
