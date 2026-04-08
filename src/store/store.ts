import { useRuntimeStore } from './runtimeStore'
import { useSettingsStore } from './settingsStore'

export { useSettingsStore, useRuntimeStore }

export type { SettingsState, ThemeMode } from './settingsStore'
export type { RuntimeState } from './runtimeStore'

export type { ActivityType, SubTask, Task, DailyStats, PotatoActivity, PomodoroType } from '../types'

const createUnifiedStore = () => {
  const unifiedHook: any = (selector?: any) => {
    if (selector) {
      const runtimeResult = useRuntimeStore(selector)
      const settingsResult = useSettingsStore(selector)
      if (typeof runtimeResult === 'object' && typeof settingsResult === 'object') {
        return { ...runtimeResult, ...settingsResult }
      }
      return runtimeResult
    }

    const runtimeState = useRuntimeStore()
    const settingsState = useSettingsStore()
    return { ...runtimeState, ...settingsState }
  }

  unifiedHook.getState = () => ({
    ...useRuntimeStore.getState(),
    ...useSettingsStore.getState(),
  })

  unifiedHook.setState = (partial: any, replace?: boolean) => {
    useRuntimeStore.setState(partial, replace)
    useSettingsStore.setState(partial, replace)
  }

  unifiedHook.subscribe = (listener: any) => {
    return useRuntimeStore.subscribe(listener)
  }

  return unifiedHook
}

export const useStore = createUnifiedStore()
