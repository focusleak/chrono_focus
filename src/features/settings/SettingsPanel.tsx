import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom'
import { Settings2, Bell } from 'lucide-react'
import GeneralSettings from './GeneralSettings'
import RemindersSettings from './RemindersSettings'

// 设置侧边栏导航项
const navItems = [
  { id: '', label: '常规设置', icon: Settings2 },
  { id: 'reminders', label: '提醒设置', icon: Bell },
]

const SettingsLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // 获取当前子路由
  const currentPath = location.pathname.replace('/settings', '').replace('/', '') || ''

  const handleNav = (id: string) => {
    navigate(`/settings/${id}`)
  }

  return (
    <div className="flex gap-8">
      {/* 左侧子导航 */}
      <div className="w-48 flex-shrink-0">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.id || (item.id === '' && currentPath === '')
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-[#2c2c2e]/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 dark:bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-sm">
          <Routes>
            <Route index element={<GeneralSettings />} />
            <Route path="reminders" element={<RemindersSettings />} />
            <Route path="*" element={<Navigate to="/settings" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default SettingsLayout
