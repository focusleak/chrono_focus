import { useEffect } from 'react'
import { useStore } from '../store/store'

/**
 * 同步当前运行状态到托盘文字和菜单
 */
export const useTraySync = () => {
  const {
    isRunning,
    isPotatoRunning,
    pomodoroType,
    timeLeft,
    potatoTimeLeft,
    restReminderEnabled,
    restReminderTimeLeft,
    restReminderTotalTime,
    showRestReminderPrompt,
    restReminderPaused,
  } = useStore()

  useEffect(() => {
    const updateTray = () => {
      if (!window.electronAPI?.updateTrayText) return

      let text = '⏸️ 空闲'
      let menuState = 'idle'

      if (isRunning) {
        if (pomodoroType === 'pomodoro') {
          const mins = Math.ceil(timeLeft / 60)
          text = `🍅 ${mins}分钟`
          menuState = 'pomodoro'
        } else if (pomodoroType === 'shortBreak') {
          text = '☕ 休息中'
          menuState = 'shortBreak'
        } else if (pomodoroType === 'longBreak') {
          text = '🌴 休息中'
          menuState = 'longBreak'
        }
      } else if (isPotatoRunning) {
        if (potatoTimeLeft > 0) {
          const mins = Math.ceil(potatoTimeLeft / 60)
          text = `🎮 ${mins}分钟`
        } else {
          text = '🎮 娱乐中'
        }
        menuState = 'potato'
      } else if (showRestReminderPrompt) {
        text = '⚠️ 强制休息中'
        menuState = 'restReminderPrompt'
      } else if (restReminderEnabled) {
        if (restReminderPaused) {
          const elapsed = restReminderTotalTime - restReminderTimeLeft
          const percent = Math.round((elapsed / restReminderTotalTime) * 100)
          text = `${percent}% 暂停`
          menuState = 'restReminderPaused'
        } else {
          const elapsed = restReminderTotalTime - restReminderTimeLeft
          const percent = Math.round((elapsed / restReminderTotalTime) * 100)
          text = `${percent}%`
          menuState = 'restReminder'
        }
      }

      window.electronAPI.updateTrayText(text)
      window.electronAPI.updateTrayMenu(menuState)
    }

    updateTray()
  }, [isRunning, isPotatoRunning, pomodoroType, timeLeft, potatoTimeLeft, restReminderEnabled, restReminderTimeLeft, restReminderTotalTime, showRestReminderPrompt, restReminderPaused])
}
