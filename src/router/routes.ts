export const ROUTES = {
  POMODORO: '/',
  PATATA: '/patata',
  BLUEBERRY: '/blueberry',
  ACTIVITIES: '/activities',
  STATS: '/stats',
  SETTINGS: '/settings',
  TEST: '/test',
  GOALS: '/goals',
  TASKS: '/tasks',
  REVIEWS: '/reviews',
  RESOURCES: '/resources',
  PDCA: '/pdca',
  ANALYTICS: '/analytics',
  NOTIFICATIONS: '/notifications',
} as const

export type RouteKey = keyof typeof ROUTES
