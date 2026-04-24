import { ROUTES, type RouteKey } from './routes'

/** 将路由 key 映射到路径 */
export const routeMap: Record<RouteKey, string> = {
  POMODORO: ROUTES.POMODORO,
  PATATA: ROUTES.PATATA,
  BLUEBERRY: ROUTES.BLUEBERRY,
  ACTIVITIES: ROUTES.ACTIVITIES,
  STATS: ROUTES.STATS,
  GOALS: ROUTES.GOALS,
  TASKS: ROUTES.TASKS,
  REVIEWS: ROUTES.REVIEWS,
  RESOURCES: ROUTES.RESOURCES,
  PDCA: ROUTES.PDCA,
  ANALYTICS: ROUTES.ANALYTICS,
  NOTIFICATIONS: ROUTES.NOTIFICATIONS,
  SETTINGS: ROUTES.SETTINGS,
  TEST: ROUTES.TEST,
}

/** 根据 pathname 获取 activeTab */
export const getActiveTab = (pathname: string): string => {
  if (pathname.startsWith(ROUTES.SETTINGS)) return 'settings'
  if (pathname.startsWith(ROUTES.PATATA)) return 'patata'
  if (pathname.startsWith(ROUTES.BLUEBERRY)) return 'blueberry'
  if (pathname.startsWith(ROUTES.STATS)) return 'stats'
  if (pathname.startsWith(ROUTES.GOALS)) return 'goals'
  if (pathname.startsWith(ROUTES.TASKS)) return 'tasks'
  if (pathname.startsWith(ROUTES.REVIEWS)) return 'reviews'
  if (pathname.startsWith(ROUTES.RESOURCES)) return 'resources'
  if (pathname.startsWith(ROUTES.PDCA)) return 'pdca'
  if (pathname.startsWith(ROUTES.ANALYTICS)) return 'analytics'
  if (pathname.startsWith(ROUTES.NOTIFICATIONS)) return 'notifications'
  if (pathname.startsWith(ROUTES.ACTIVITIES)) return 'activities'
  if (pathname.startsWith(ROUTES.TEST)) return 'test'
  return 'pomodoro'
}
