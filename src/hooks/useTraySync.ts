import { useEffect } from 'react'
import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { PomodoroStatus } from '@/types'

/**
 * 同步当前运行状态到托盘文字和菜单
 */
export const useTraySync = () => {
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const isPotatoRunning = useRuntimeStore.use.isPotatoRunning()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()
  const pomodoroTimeLeft = useRuntimeStore.use.pomodoroTimeLeft()
  const potatoTimeLeft = useRuntimeStore.use.potatoTimeLeft()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()
  const restReminderPaused = useRuntimeStore.use.restReminderPaused()
  const restReminderTimeLeft = useRuntimeStore.use.restReminderTimeLeft()
  const restReminderTotalTime = useRuntimeStore.use.restReminderTotalTime()
  const restReminderEnabled = useSettingsStore.use.restReminderEnabled()

  useEffect(() => {
    const updateTray = () => {
      if (!window.electronAPI?.updateTrayText) return

      let text = '⏸️ 空闲'
      let menuState = 'idle'

      if (isPomodoroRunning) {
        if (pomodoroStatus === PomodoroStatus.Pomodoro) {
          const mins = Math.ceil(pomodoroTimeLeft / 60)
          text = `番茄钟-已专注 ${mins}分钟`
          menuState = 'pomodoro'
        } else if (pomodoroStatus === PomodoroStatus.ShortBreak) {
          text = '番茄钟-短休息中'
          menuState = 'shortBreak'
        } else if (pomodoroStatus === PomodoroStatus.LongBreak) {
          text = '番茄钟-长休息中'
          menuState = 'longBreak'
        }
      } else if (isPotatoRunning) {
        if (potatoTimeLeft > 0) {
          const mins = Math.ceil(potatoTimeLeft / 60)
          text = `土豆钟-娱乐 ${mins}分钟`
        } else {
          text = '土豆钟-娱乐中'
        }
        menuState = 'potato'
      } else if (showRestReminderPrompt) {
        text = '强制休息中'
        menuState = 'restReminderPrompt'
      } else if (restReminderEnabled) {
        if (restReminderPaused) {
          const elapsed = restReminderTotalTime - restReminderTimeLeft
          const percent = Math.round((elapsed / restReminderTotalTime) * 100)
          text = `${percent}% 休息提醒暂停`
          menuState = 'restReminderPaused'
        } else {
          const elapsed = restReminderTotalTime - restReminderTimeLeft
          const percent = Math.round((elapsed / restReminderTotalTime) * 100)
          text = `休息提醒 ${percent}%`
          menuState = 'restReminder'
        }
      }

      window.electronAPI.updateTrayText(text)
      window.electronAPI.updateTrayMenu(menuState)
    }

    updateTray()
  }, [isPomodoroRunning, isPotatoRunning, pomodoroStatus, pomodoroTimeLeft, potatoTimeLeft, restReminderEnabled, restReminderTimeLeft, restReminderTotalTime, showRestReminderPrompt, restReminderPaused])
}
