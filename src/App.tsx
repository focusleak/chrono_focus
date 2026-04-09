import { useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { requestNotificationPermission } from '@/lib/utils'

import StatusBar from '@/features/statusbar/StatusBar'
import Sidebar from '@/features/sidebar/Sidebar'
import { ToastContainer } from '@/components/ui/toast'

import { useInitAutoLaunch } from '@/hooks/common/useInitAutoLaunch'
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer'
import { usePatataTimer } from '@/hooks/usePatataTimer'
import { useRestReminder } from '@/hooks/useRestReminder'
import { useThemeSync } from '@/hooks/useThemeSync'
import { useTrayActions } from '@/hooks/useTrayActions'
import { useTraySync } from '@/hooks/useTraySync'
import { useRestReminderOverlay } from '@/hooks/useRestReminderOverlay'
import { useReminder } from '@/hooks/common/useReminder'

import { useSettingsStore } from '@/store/settingsStore'
import { useRuntimeStore } from '@/store/runtimeStore'

import { PomodoroStatus } from '@/types'

import { AppRoutes } from '@/router'

function App() {
  const navigate = useNavigate()

  useTrayActions()
  useTraySync()
  useInitAutoLaunch()
  useThemeSync()
  useRestReminder()
  usePomodoroTimer()
  usePatataTimer()
  useRestReminderOverlay()

  const restReminderEnabled = useSettingsStore.use.restReminderEnabled()
  const restReminderInterval = useSettingsStore.use.restReminderInterval()
  const waterReminderEnabled = useSettingsStore.use.waterReminderEnabled()
  const waterReminderInterval = useSettingsStore.use.waterReminderInterval()
  const standReminderEnabled = useSettingsStore.use.standReminderEnabled()
  const standReminderInterval = useSettingsStore.use.standReminderInterval()
  const stretchReminderEnabled = useSettingsStore.use.stretchReminderEnabled()
  const stretchReminderInterval = useSettingsStore.use.stretchReminderInterval()
  const gazeReminderEnabled = useSettingsStore.use.gazeReminderEnabled()
  const gazeReminderInterval = useSettingsStore.use.gazeReminderInterval()
  const walkReminderEnabled = useSettingsStore.use.walkReminderEnabled()
  const walkReminderInterval = useSettingsStore.use.walkReminderInterval()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const isWorking = pomodoroStatus === PomodoroStatus.Pomodoro && isPomodoroRunning

  useReminder(
    restReminderEnabled,
    restReminderInterval,
    '休息提醒',
    '你已经工作一段时间了，记得休息一下哦！',
    isWorking,
  )

  useReminder(
    waterReminderEnabled,
    waterReminderInterval,
    '喝水提醒',
    '该喝水啦！保持身体健康！',
  )

  useReminder(
    standReminderEnabled,
    standReminderInterval,
    '站立提醒',
    '你已经坐了一段时间了，站起来活动一下吧！',
    isWorking,
  )

  useReminder(
    stretchReminderEnabled,
    stretchReminderInterval,
    '拉伸提醒',
    '是时候做些伸展运动了，活动一下身体！',
    isWorking,
  )

  useReminder(
    gazeReminderEnabled,
    gazeReminderInterval,
    '远眺提醒',
    '看向远方，放松一下你的眼睛！',
    isWorking,
  )

  useReminder(
    walkReminderEnabled,
    walkReminderInterval,
    '走动提醒',
    '你已经坐了一段时间了，起身走走吧！',
    isWorking,
  )

  useEffect(() => {
    requestNotificationPermission()
    const handleNavigateToTasks = () => navigate('/activities')
    window.addEventListener('navigate-to-tasks', handleNavigateToTasks)
    return () => window.removeEventListener('navigate-to-tasks', handleNavigateToTasks)
  }, [navigate])

  const location = useLocation()
  const activeTab = location.pathname || '/'
  const backgroundColor = useMemo(() => {

    if (activeTab === '/patata') return 'bg-[#FADFA1]'
    if (activeTab === '/blueberry') return 'bg-[#5D1451]'
    if (activeTab !== '/') return 'bg-[#f5f5f7] dark:bg-[#0d0d0d]'
    switch (pomodoroStatus) {
      case PomodoroStatus.Pomodoro: return 'bg-[#ba4949]'
      case PomodoroStatus.ShortBreak: return 'bg-[#38858a]'
      case PomodoroStatus.LongBreak: return 'bg-[#2f6a95]'
      default: return 'bg-[#ba4949]'
    }
  }, [activeTab, pomodoroStatus])

  return (
    <div className={`min-h-screen transition-colors ${backgroundColor}`}>
      <div className="flex flex-col h-screen">
        <div className="h-8 w-full shrink-0 absolute left-0 top-0 z-1" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

        <div className="flex flex-1 min-h-0">
          <Sidebar />

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8">
              <AppRoutes />
            </div>
          </div>
        </div>

        <StatusBar />
      </div>
      <ToastContainer />
    </div>
  )
}

export default App
