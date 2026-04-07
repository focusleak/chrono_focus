import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from './store/store'
import { usePomodoroTimer } from './hooks/usePomodoroTimer'
import { useInitAutoLaunch } from './hooks/useInitAutoLaunch'
import { usePotatoTimer } from './hooks/usePotatoTimer'
import { useThemeSync } from './hooks/useThemeSync'
import { useRestReminder } from './hooks/useRestReminder'
import { requestNotificationPermission } from './lib/utils'
import PomodoroClock from './features/pomodoro/PomodoroClock'
import SettingsPage from './features/settings/SettingsPage'
import StatsPanel from './features/stats/StatsPanel'
import PotatoClock from './features/potato/PotatoClock'
import ActivitiesPage from './features/activities/ActivitiesPage'
import TestPage from './features/test/TestPage'
import StatusBar from './components/StatusBar'
import RestReminderOverlay from './components/RestReminderOverlay'
import { NavItem } from './components/NavItem'
import { ToastContainer } from '@/components/ui/toast'

// 主内容组件，使用路由
function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  
  usePomodoroTimer()
  useInitAutoLaunch()
  usePotatoTimer()
  useThemeSync()
  useRestReminder()

  const { pomodoroType } = useStore()
  const [activeTab, setActiveTab] = useState('timer')

  // 同步路由到 activeTab
  useEffect(() => {
    const path = location.pathname
    if (path.startsWith('/settings')) {
      setActiveTab('settings')
    } else if (path.startsWith('/potato')) {
      setActiveTab('potato')
    } else if (path.startsWith('/stats')) {
      setActiveTab('stats')
    } else if (path.startsWith('/activities')) {
      setActiveTab('activities')
    } else if (path.startsWith('/test')) {
      setActiveTab('test')
    } else {
      setActiveTab('pomodoro')
    }
  }, [location])

  // 根据计时类型获取背景色
  const getBackgroundColor = () => {
    if (activeTab === 'potato') {
      return 'bg-[#FADFA1]'
    }
    if (activeTab !== 'pomodoro') {
      return 'bg-[#f5f5f7] dark:bg-[#0d0d0d]'
    }
    switch (pomodoroType) {
      case 'pomodoro':
        return 'bg-[#ba4949]'
      case 'shortBreak':
        return 'bg-[#38858a]'
      case 'longBreak':
        return 'bg-[#2f6a95]'
      default:
        return 'bg-[#ba4949]'
    }
  }

  useEffect(() => {
    requestNotificationPermission()

    const handleNavigateToTasks = () => {
      navigate('/activities')
    }
    window.addEventListener('navigate-to-tasks', handleNavigateToTasks)

    return () => {
      window.removeEventListener('navigate-to-tasks', handleNavigateToTasks)
    }
  }, [navigate])

  const handleNav = (tab: string) => {
    setActiveTab(tab)
    switch (tab) {
      case 'pomodoro':
        navigate('/')
        break
      case 'potato':
        navigate('/potato')
        break
      case 'activities':
        navigate('/activities')
        break
      case 'test':
        navigate('/test')
        break
      case 'stats':
        navigate('/stats')
        break
      case 'settings':
        navigate('/settings')
        break
    }
  }

  // 仅开发环境显示"测试"导航
  const isDev = import.meta.env.DEV

  return (
    <div className={`min-h-screen transition-colors ${getBackgroundColor()}`} style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="flex flex-col h-screen">
        {/* 中间区域 */}
        <div className="flex flex-1 min-h-0">
          {/* 左侧导航栏 */}
          <div className="w-56 bg-white/10 backdrop-blur-xl border-r border-white/20 flex flex-col">
            {/* 导航菜单（pt-8 留出 macOS 系统关闭按钮空间） */}
            <nav className="flex-1 px-3 pt-8 pb-2 space-y-0.5 overflow-y-auto">
              <NavItem label="番茄钟" isActive={activeTab === 'pomodoro'} onClick={() => handleNav('pomodoro')} />
              <NavItem label="土豆钟" isActive={activeTab === 'potato'} onClick={() => handleNav('potato')} />
            </nav>

            {/* 底部导航 */}
            <div className="px-3 py-2 space-y-0.5">
              <NavItem label="活动" isActive={activeTab === 'activities'} onClick={() => handleNav('activities')} />
              {isDev && <NavItem label="测试" isActive={activeTab === 'test'} onClick={() => handleNav('test')} />}
              <NavItem label="统计" isActive={activeTab === 'stats'} onClick={() => handleNav('stats')} />
              <NavItem label="设置" isActive={activeTab === 'settings'} onClick={() => handleNav('settings')} />
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-10">
              <Routes>
                <Route path="/" element={<PomodoroClock />} />
                <Route path="/potato" element={<PotatoClock />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                {isDev && <Route path="/test" element={<TestPage />} />}
                <Route path="/stats" element={<StatsPanel />} />
                <Route path="/settings/*" element={<SettingsPage />} />
              </Routes>
            </div>
          </div>
        </div>

        {/* 底部状态栏 */}
        <StatusBar />
      </div>
      <RestReminderOverlay />
      <ToastContainer />
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  )
}

export default App
