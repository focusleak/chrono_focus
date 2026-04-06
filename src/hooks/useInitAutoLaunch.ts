import { useEffect } from 'react'
import { useTimerStore } from '../store/timerStore'

// 应用启动时从 Electron 获取开机自启动状态
export const useInitAutoLaunch = () => {
  const { setAutoStartEnabled } = useTimerStore()

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
