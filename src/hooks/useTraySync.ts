import { useEffect } from 'react'

import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'

import { PomodoroStatus } from '@/types'

/**
 * 系统托盘状态同步 Hook
 * 
 * 将应用当前运行状态同步到系统托盘的显示文字和菜单
 * 包括番茄钟/土豆钟进度、休息提醒状态等
 * 
 * @returns void
 * 
 * @example
 * ```tsx
 * function App() {
 *   useTraySync()
 *   // ... 其他组件
 * }
 * ```
 */
export const useTraySync = () => {
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const isPatataRunning = useRuntimeStore.use.isPatataRunning()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()
  const pomodoroTimeLeft = useRuntimeStore.use.pomodoroTimeLeft()
  const currentPomodoroTime = useRuntimeStore.use.currentPomodoroTime()
  const patataElapsedTime = useRuntimeStore.use.patataElapsedTime()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()
  const restReminderPaused = useRuntimeStore.use.restReminderPaused()
  const restReminderTimeLeft = useRuntimeStore.use.restReminderTimeLeft()
  const restReminderTotalTime = useRuntimeStore.use.restReminderTotalTime()
  const restReminderEnabled = useSettingsStore.use.restReminderEnabled()
  const dailyPatataLimit = useSettingsStore.use.dailyPatataLimit()

  useEffect(() => {
    const updateTray = () => {
      if (!window.electronAPI?.updateTrayText) return

      let text = '⏸️ 空闲'
      let menuState = 'idle'

      if (isPomodoroRunning) {
        if (pomodoroStatus === PomodoroStatus.Pomodoro) {
          const elapsed = Math.max(0, currentPomodoroTime - pomodoroTimeLeft)
          const mins = Math.ceil(elapsed / 60)
          text = `番茄钟-已专注 ${mins}分钟`
          menuState = 'pomodoro'
        } else if (pomodoroStatus === PomodoroStatus.ShortBreak) {
          text = '番茄钟-短休息中'
          menuState = 'shortBreak'
        } else if (pomodoroStatus === PomodoroStatus.LongBreak) {
          text = '番茄钟-长休息中'
          menuState = 'longBreak'
        }
      }
      else if (isPatataRunning) {
        if (patataElapsedTime <= dailyPatataLimit * 60) {
          const mins = Math.floor(patataElapsedTime / 60)
          text = `土豆钟-娱乐 ${mins}分钟`
        } else {
          const mins = Math.floor(patataElapsedTime / 60)
          text = `土豆钟-超时 ${mins}分钟`
        }
        menuState = 'patata'
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
  }, [isPomodoroRunning, isPatataRunning, pomodoroStatus, pomodoroTimeLeft, currentPomodoroTime, patataElapsedTime, restReminderEnabled, restReminderTimeLeft, restReminderTotalTime, showRestReminderPrompt, restReminderPaused, dailyPatataLimit])
}
