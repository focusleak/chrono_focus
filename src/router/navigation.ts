import { ROUTES, type RouteKey } from './routes'

export interface NavItemConfig {
  key: RouteKey
  label: string
  position: 'main' | 'secondary'
}

export const NAV_CONFIG: Record<RouteKey, NavItemConfig> = {
  POMODORO: { key: 'POMODORO', label: '番茄钟', position: 'main' },
  PATATA: { key: 'PATATA', label: '土豆钟', position: 'main' },
  BLUEBERRY: { key: 'BLUEBERRY', label: '蓝莓钟', position: 'main' },
  ACTIVITIES: { key: 'ACTIVITIES', label: '活动', position: 'secondary' },
  STATS: { key: 'STATS', label: '统计', position: 'secondary' },
  GOALS: { key: 'GOALS', label: '目标', position: 'secondary' },
  TASKS: { key: 'TASKS', label: '任务', position: 'secondary' },
  REVIEWS: { key: 'REVIEWS', label: '复盘', position: 'secondary' },
  RESOURCES: { key: 'RESOURCES', label: '资源', position: 'secondary' },
  PDCA: { key: 'PDCA', label: 'PDCA', position: 'secondary' },
  ANALYTICS: { key: 'ANALYTICS', label: '分析', position: 'secondary' },
  NOTIFICATIONS: { key: 'NOTIFICATIONS', label: '通知', position: 'secondary' },
  SETTINGS: { key: 'SETTINGS', label: '设置', position: 'secondary' },
  TEST: { key: 'TEST', label: '测试', position: 'secondary' },
}

export const MAIN_NAV: NavItemConfig[] = Object.values(NAV_CONFIG).filter(
  (item) => item.position === 'main'
)

export const SECONDARY_NAV: NavItemConfig[] = Object.values(NAV_CONFIG).filter(
  (item) => item.position === 'secondary'
)

export const getPath = (key: RouteKey): string => ROUTES[key]
