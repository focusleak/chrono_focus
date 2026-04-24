import { Routes, Route } from 'react-router-dom'

import { ROUTES } from './routes'

import ActivitiesPage from '@/features/activities/ActivitiesPage'
import PomodoroPage from '@/features/pomodoro/PomodoroPage'
import PatataPage from '@/features/patata/PatataPage'
import SettingsPage from '@/features/settings/SettingsPage'
import StatsPage from '@/features/stats/StatsPage'
import TestPage from '@/features/test/TestPage'
import { BlueberryPage } from '@/features/blueberry/BlueberryPage'
import { GoalsPage } from '@/features/goals/GoalsPage'
import { TasksPage } from '@/features/tasks/TasksPage'
import { ReviewsPage } from '@/features/reviews/ReviewsPage'
import { ResourcesPage } from '@/features/resources/ResourcesPage'
import { PDCAPage } from '@/features/pdca/PDCAPage'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'

const isDev = import.meta.env.DEV

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.POMODORO} element={<PomodoroPage />} />
      <Route path={ROUTES.PATATA} element={<PatataPage />} />
      <Route path={ROUTES.BLUEBERRY} element={<BlueberryPage />} />
      <Route path={ROUTES.ACTIVITIES} element={<ActivitiesPage />} />
      {isDev && <Route path={ROUTES.TEST} element={<TestPage />} />}
      <Route path={ROUTES.STATS} element={<StatsPage />} />
      <Route path={`${ROUTES.SETTINGS}/*`} element={<SettingsPage />} />
      <Route path={ROUTES.GOALS} element={<GoalsPage />} />
      <Route path={ROUTES.TASKS} element={<TasksPage />} />
      <Route path={ROUTES.REVIEWS} element={<ReviewsPage />} />
      <Route path={ROUTES.RESOURCES} element={<ResourcesPage />} />
      <Route path={ROUTES.PDCA} element={<PDCAPage />} />
      <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
      <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
    </Routes>
  )
}
