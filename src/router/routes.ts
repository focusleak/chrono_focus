export const ROUTES = {
  POMODORO: '/',
  POTATO: '/potato',
  BLUEBERRY: '/blueberry',
  ACTIVITIES: '/activities',
  STATS: '/stats',
  SETTINGS: '/settings',
  TEST: '/test',
} as const

export type RouteKey = keyof typeof ROUTES
