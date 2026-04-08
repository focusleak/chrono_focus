import { useEffect, useMemo } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'

import { requestNotificationPermission } from '@/lib/utils'

import { BrowserOverlay } from '@/components/BrowserOverlay'
import RestReminderOverlay from '@/components/RestReminderOverlay'
import StatusBar from '@/components/StatusBar'
import { NavItem } from '@/components/common/NavItem'
import { ToastContainer } from '@/components/ui/toast'

import { useInitAutoLaunch } from '@/hooks/common/useInitAutoLaunch'
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer'
import { usePotatoTimer } from '@/hooks/usePotatoTimer'
import { useRestReminder } from '@/hooks/useRestReminder'
import { useThemeSync } from '@/hooks/useThemeSync'
import { useTrayActions } from '@/hooks/useTrayActions'
import { useTraySync } from '@/hooks/useTraySync'


import { useReminder } from '@/hooks/common/useReminder'

import ActivitiesPage from '@/features/activities/ActivitiesPage'
import PomodoroPage from '@/features/pomodoro/PomodoroPage'
import PotatoPage from '@/features/potato/PotatoPage'
import SettingsPage from '@/features/settings/SettingsPage'
import StatsPage from '@/features/stats/StatsPage'
import TestPage from '@/features/test/TestPage'

import { useSettingsStore } from '@/store/settingsStore'
import { useRuntimeStore } from '@/store/runtimeStore'

import { PomodoroStatus } from '@/types'

const routeMap: Record<string, string> = {
  pomodoro: '/',
  potato: '/potato',
  activities: '/activities',
  test: '/test',
  stats: '/stats',
  settings: '/settings',
}

const getActiveTab = (pathname: string): string => {
  if (pathname.startsWith('/settings')) return 'settings'
  if (pathname.startsWith('/potato')) return 'potato'
  if (pathname.startsWith('/stats')) return 'stats'
  if (pathname.startsWith('/activities')) return 'activities'
  if (pathname.startsWith('/test')) return 'test'
  return 'pomodoro'
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  useTrayActions()
  useTraySync()
  useInitAutoLaunch()
  useThemeSync()
  useRestReminder()
  usePomodoroTimer()
  usePotatoTimer()

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



  const activeTab = getActiveTab(location.pathname)
  const isDev = import.meta.env.DEV

  const handleNav = (tab: string) => {
    const path = routeMap[tab]
    if (path) navigate(path)
  }

  useEffect(() => {
    requestNotificationPermission()
    const handleNavigateToTasks = () => navigate('/activities')
    window.addEventListener('navigate-to-tasks', handleNavigateToTasks)
    return () => window.removeEventListener('navigate-to-tasks', handleNavigateToTasks)
  }, [navigate])

  const backgroundColor = useMemo(() => {
    if (activeTab === 'potato') return 'bg-[#FADFA1]'
    if (activeTab !== 'pomodoro') return 'bg-[#f5f5f7] dark:bg-[#0d0d0d]'
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
          <div className="w-56 bg-white/20 backdrop-blur-xl  shadow-lg flex flex-col pt-10">
            <nav className="flex-1 px-3 space-y-0.5">
              <NavItem label="番茄钟" isActive={activeTab === 'pomodoro'} onClick={() => handleNav('pomodoro')} />
              <NavItem label="土豆钟" isActive={activeTab === 'potato'} onClick={() => handleNav('potato')} />
            </nav>

            <nav className="px-3 space-y-0.5">
              <NavItem label="活动" isActive={activeTab === 'activities'} onClick={() => handleNav('activities')} />
              <NavItem label="统计" isActive={activeTab === 'stats'} onClick={() => handleNav('stats')} />
              <NavItem label="设置" isActive={activeTab === 'settings'} onClick={() => handleNav('settings')} />
              {isDev && <NavItem label="测试" isActive={activeTab === 'test'} onClick={() => handleNav('test')} />}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8">
              <Routes>
                <Route path="/" element={<PomodoroPage />} />
                <Route path="/potato" element={<PotatoPage />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                {isDev && <Route path="/test" element={<TestPage />} />}
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/settings/*" element={<SettingsPage />} />
              </Routes>
            </div>
          </div>
        </div>

        <StatusBar />
      </div>
      <RestReminderOverlay />
      <BrowserOverlay />
      <ToastContainer />
    </div>
  )
}



export default App
