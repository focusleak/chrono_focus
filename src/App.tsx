import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from './store/store'
import { usePomodoroTimer } from './hooks/usePomodoroTimer'
import { useAutoStart } from './hooks/useAutoStart'
import { useInitAutoLaunch } from './hooks/useInitAutoLaunch'
import { usePotatoTimer } from './hooks/usePotatoTimer'
import { useThemeSync } from './hooks/useThemeSync'
import { requestNotificationPermission } from './lib/utils'
import PomodoroClock from './features/pomodoro/PomodoroClock'
import SettingsPanel from './features/settings/SettingsPanel'
import StatsPanel from './features/stats/StatsPanel'
import PotatoClock from './features/potato/PotatoClock'
import { ToastContainer } from '@/components/ui/toast'

// 主内容组件，使用路由
function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  
  usePomodoroTimer()
  useAutoStart()
  useInitAutoLaunch()
  usePotatoTimer()
  useThemeSync()

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
      navigate('/settings?tab=activities')
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
      case 'stats':
        navigate('/stats')
        break
      case 'settings':
        navigate('/settings')
        break
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${getBackgroundColor()}`}>
      <div className="flex h-screen">
        {/* 左侧导航栏 */}
        <div className="w-56 bg-white/10 backdrop-blur-xl border-r border-white/20 flex flex-col">
          {/* 搜索框 */}
          <div className="px-3 py-3">
            <div className="relative group">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/70 dark:text-gray-400/70 group-focus-within:text-gray-700 dark:group-focus-within:text-gray-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索..."
                className="w-full h-8 pl-8 pr-3 rounded-md bg-black/5 dark:bg-white/5 border border-transparent focus:border-white/20 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500/70 dark:placeholder-gray-400/70 focus:outline-none focus:bg-black/10 dark:focus:bg-white/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            <button
              onClick={() => handleNav('pomodoro')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'pomodoro'
                  ? 'bg-black/10 text-gray-900 shadow-sm'
                  : 'text-gray-900 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-[#2c2c2e]/80'
              }`}
            >
              <span className="text-sm">番茄钟</span>
            </button>
            <button
              onClick={() => handleNav('potato')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'potato'
                  ? 'bg-black/10 text-gray-900 shadow-sm'
                  : 'text-gray-900 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-[#2c2c2e]/80'
              }`}
            >
              <span className="text-sm">土豆钟</span>
            </button>
          </nav>

          {/* 底部：统计和设置 */}
          <div className="px-3 py-2 space-y-0.5">
            <button
              onClick={() => handleNav('stats')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'stats'
                  ? 'bg-black/10 text-gray-900 shadow-sm'
                  : 'text-gray-900 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-[#2c2c2e]/80'
              }`}
            >
              <span className="text-sm">统计</span>
            </button>
            <button
              onClick={() => handleNav('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-black/10 text-gray-900 shadow-sm'
                  : 'text-gray-900 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-[#2c2c2e]/80'
              }`}
            >
              <span className="text-sm">设置</span>
            </button>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-10">
            <Routes>
              <Route path="/" element={<PomodoroClock />} />
              <Route path="/potato" element={<PotatoClock />} />
              <Route path="/stats" element={<StatsPanel />} />
              <Route path="/settings/*" element={<SettingsPanel />} />
            </Routes>
          </div>
        </div>
      </div>
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
