import { useNavigate, useLocation } from 'react-router-dom'

import { NavItem } from '@/features/sidebar/NavItem'

import {
  MAIN_NAV,
  SECONDARY_NAV,
  getActiveTab,
  routeMap,
} from '@/router'

/**
 * 侧边栏组件
 * 显示主导航和次导航，处理路由跳转逻辑
 */
const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isDev = import.meta.env.DEV

  const activeTab = getActiveTab(location.pathname)

  const handleNav = (tab: string) => {
    const key = tab.toUpperCase() as keyof typeof routeMap
    const path = routeMap[key]
    if (path) navigate(path)
  }

  return (
    <div className="w-56 bg-white/20 backdrop-blur-xl shadow-lg flex flex-col pt-10 pb-2">
      <nav className="flex-1 px-3 space-y-0.5">
        {MAIN_NAV.map((item) => (
          item.key === 'TEST' && !isDev ? null : (
            <NavItem
              key={item.key}
              label={item.label}
              isActive={activeTab === item.key.toLowerCase()}
              onClick={() => handleNav(item.key.toLowerCase())}
            />
          )
        ))}
      </nav>

      <nav className="px-3 space-y-0.5">
        {SECONDARY_NAV.map((item) => (
          item.key === 'TEST' && !isDev ? null : (
            <NavItem
              key={item.key}
              label={item.label}
              isActive={activeTab === item.key.toLowerCase()}
              onClick={() => handleNav(item.key.toLowerCase())}
            />
          )
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
