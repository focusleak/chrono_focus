import { Routes, Route } from 'react-router-dom'

import { ROUTES } from './routes'

import ActivitiesPage from '@/features/activities/ActivitiesPage'
import PomodoroPage from '@/features/pomodoro/PomodoroPage'
import PotatoPage from '@/features/potato/PotatoPage'
import SettingsPage from '@/features/settings/SettingsPage'
import StatsPage from '@/features/stats/StatsPage'
import TestPage from '@/features/test/TestPage'
import { BlueberryPage } from '@/features/blueberry/BlueberryPage'

const isDev = import.meta.env.DEV

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.POMODORO} element={<PomodoroPage />} />
      <Route path={ROUTES.POTATO} element={<PotatoPage />} />
      <Route path={ROUTES.BLUEBERRY} element={<BlueberryPage />} />
      <Route path={ROUTES.ACTIVITIES} element={<ActivitiesPage />} />
      {isDev && <Route path={ROUTES.TEST} element={<TestPage />} />}
      <Route path={ROUTES.STATS} element={<StatsPage />} />
      <Route path={`${ROUTES.SETTINGS}/*`} element={<SettingsPage />} />
    </Routes>
  )
}
