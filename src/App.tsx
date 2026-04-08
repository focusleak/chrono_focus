import { useEffect, useMemo } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useRuntimeStore } from '@/store/runtimeStore'
import { PomodoroStatus } from '@/types'
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer'
import { useInitAutoLaunch } from '@/hooks/useInitAutoLaunch'
import { usePotatoTimer } from '@/hooks/usePotatoTimer'
import { useThemeSync } from '@/hooks/useThemeSync'
import { useRestReminder } from '@/hooks/useRestReminder'
import { useTraySync } from '@/hooks/useTraySync'
import { useTrayActions } from '@/hooks/useTrayActions'
import { requestNotificationPermission } from '@/lib/utils'
import PomodoroPage from '@/features/pomodoro/PomodoroPage'
import SettingsPage from '@/features/settings/SettingsPage'
import StatsPage from '@/features/stats/StatsPage'
import PotatoPage from '@/features/potato/PotatoPage'
import ActivitiesPage from '@/features/activities/ActivitiesPage'
import TestPage from '@/features/test/TestPage'
import StatusBar from '@/components/StatusBar'
import RestReminderOverlay from '@/components/RestReminderOverlay'
import { BrowserOverlay } from '@/components/BrowserOverlay'
import { NavItem } from '@/components/common/NavItem'
import { ToastContainer } from '@/components/ui/toast'

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


  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()
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
