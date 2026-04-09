import { ROUTES, type RouteKey } from './routes'

/** 将路由 key 映射到路径 */
export const routeMap: Record<RouteKey, string> = {
  POMODORO: ROUTES.POMODORO,
  POTATO: ROUTES.POTATO,
  BLUEBERRY: ROUTES.BLUEBERRY,
  ACTIVITIES: ROUTES.ACTIVITIES,
  STATS: ROUTES.STATS,
  SETTINGS: ROUTES.SETTINGS,
  TEST: ROUTES.TEST,
}

/** 根据 pathname 获取 activeTab */
export const getActiveTab = (pathname: string): string => {
  if (pathname.startsWith(ROUTES.SETTINGS)) return 'settings'
  if (pathname.startsWith(ROUTES.POTATO)) return 'potato'
  if (pathname.startsWith(ROUTES.BLUEBERRY)) return 'blueberry'
  if (pathname.startsWith(ROUTES.STATS)) return 'stats'
  if (pathname.startsWith(ROUTES.ACTIVITIES)) return 'activities'
  if (pathname.startsWith(ROUTES.TEST)) return 'test'
  return 'pomodoro'
}
