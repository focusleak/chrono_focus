export const ROUTES = {
  POMODORO: '/',
  PATATA: '/patata',
  BLUEBERRY: '/blueberry',
  ACTIVITIES: '/activities',
  STATS: '/stats',
  SETTINGS: '/settings',
  TEST: '/test',
} as const

export type RouteKey = keyof typeof ROUTES
