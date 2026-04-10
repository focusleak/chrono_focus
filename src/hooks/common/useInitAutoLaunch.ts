import { useEffect, useCallback } from 'react'

import { useSettingsStore } from '@/store/settingsStore'
import { createAutoLaunchStrategy } from '@/utils/platform-strategies'

/**
 * 初始化开机自启动状态
 * 应用启动时获取开机自启动状态并同步到 store
 * 使用策略模式自动适配 Electron/浏览器环境
 */
export const useInitAutoLaunch = () => {
  const setAutoStartEnabled = useSettingsStore.use.setAutoStartEnabled()

  useEffect(() => {
    const initAutoLaunch = async () => {
      try {
        const strategy = createAutoLaunchStrategy()
        const result = await strategy.getStatus()
        if (result.success && result.enabled !== undefined) {
          setAutoStartEnabled(result.enabled)
        }
      } catch (error) {
        console.error('Failed to get auto-launch status:', error)
      }
    }

    initAutoLaunch()
  }, [setAutoStartEnabled])
}

/**
 * 设置开机自启动
 * 同时更新 store 状态和平台配置
 * 使用策略模式自动适配 Electron/浏览器环境
 */
export const useSetAutoLaunch = () => {
  const setAutoStartEnabled = useSettingsStore.use.setAutoStartEnabled()

  return useCallback(async (enabled: boolean) => {
    // 先更新 store 状态
    setAutoStartEnabled(enabled)

    // 同步到平台配置
    try {
      const strategy = createAutoLaunchStrategy()
      await strategy.setEnabled(enabled)
    } catch (error) {
      console.error('Failed to set auto-launch:', error)
    }
  }, [setAutoStartEnabled])
}
