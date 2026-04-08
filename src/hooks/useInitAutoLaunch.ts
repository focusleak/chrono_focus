import { useEffect, useCallback } from 'react'
import { useSettingsStore } from '../store/settingsStore'

/**
 * 初始化开机自启动状态
 * 应用启动时从 Electron 获取开机自启动状态并同步到 store
 */
export const useInitAutoLaunch = () => {
  const setAutoStartEnabled = useSettingsStore.use.setAutoStartEnabled()

  useEffect(() => {
    const initAutoLaunch = async () => {
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.getAutoLaunchStatus()
          if (result.success && result.enabled !== undefined) {
            setAutoStartEnabled(result.enabled)
          }
        } catch (error) {
          console.error('Failed to get auto-launch status:', error)
        }
      }
    }

    initAutoLaunch()
  }, [setAutoStartEnabled])
}

/**
 * 设置开机自启动
 * 同时更新 store 状态和 Electron 配置
 */
export const useSetAutoLaunch = () => {
  const setAutoStartEnabled = useSettingsStore.use.setAutoStartEnabled()

  return useCallback(async (enabled: boolean) => {
    // 先更新 store 状态
    setAutoStartEnabled(enabled)

    // 同步到 Electron
    if (window.electronAPI) {
      try {
        await window.electronAPI.setAutoLaunch(enabled)
      } catch (error) {
        console.error('Failed to set auto-launch:', error)
      }
    }
  }, [setAutoStartEnabled])
}
