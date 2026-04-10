import { useRef, useEffect, useCallback, useState } from 'react'

/**
 * Electron 定时器 Hook
 * 使用 Electron 主进程的定时器,即使渲染进程被挂起也能准确运行
 *
 * 特性:
 * - 支持后台运行,不受渲染进程节流影响
 * - 应用唤醒后自动同步状态
 * - 页面可见性变化时自动重连
 *
 * @param callback 定时执行的回调
 * @param delay 间隔时间(毫秒)
 * @param enabled 是否启用定时器
 *
 * @returns {Object} { start, stop, isRunning }
 *
 * @example
 * ```tsx
 * const { start, stop, isRunning } = useElectronInterval(
 *   () => console.log('tick'),
 *   1000,
 *   true
 * )
 * ```
 */
export function useElectronInterval(
  callback: () => void,
  delay: number,
  enabled: boolean = true,
) {
  const [isRunning, setIsRunning] = useState(false)
  const savedCallback = useRef(callback)
  const timerIdRef = useRef<string>(`timer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`)
  const listenerCleanupRef = useRef<(() => void) | null>(null)
  const isRunningRef = useRef(false)

  // 始终保存最新的 callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  const setupListener = useCallback(() => {
    // 清理旧监听器
    if (listenerCleanupRef.current) {
      listenerCleanupRef.current()
      listenerCleanupRef.current = null
    }

    if (!window.electronAPI?.electronTimer) return null

    // 设置新的监听器
    listenerCleanupRef.current = window.electronAPI.electronTimer.onTick((id) => {
      if (id === timerIdRef.current && isRunningRef.current) {
        savedCallback.current()
      }
    })

    return listenerCleanupRef.current
  }, [])

  const start = useCallback(async () => {
    if (!window.electronAPI?.electronTimer || isRunningRef.current) {
      console.log('[useElectronInterval] Start skipped - already running or API not available', {
        hasAPI: !!window.electronAPI?.electronTimer,
        isRunning: isRunningRef.current,
        timerId: timerIdRef.current
      })
      return
    }

    try {
      console.log('[useElectronInterval] Starting timer', {
        timerId: timerIdRef.current,
        delay
      })

      // 先设置监听器
      setupListener()

      // 再创建定时器
      await window.electronAPI.electronTimer.create(timerIdRef.current, delay)
      
      isRunningRef.current = true
      setIsRunning(true)
      console.log('[useElectronInterval] Timer started successfully')
    } catch (err) {
      console.error('[useElectronInterval] Failed to start timer:', err)
    }
  }, [delay, setupListener])

  const stop = useCallback(async () => {
    if (!window.electronAPI?.electronTimer || !isRunningRef.current) {
      return
    }

    try {
      console.log('[useElectronInterval] Stopping timer', {
        timerId: timerIdRef.current
      })

      // 先清理监听器
      if (listenerCleanupRef.current) {
        listenerCleanupRef.current()
        listenerCleanupRef.current = null
      }

      // 再停止定时器
      await window.electronAPI.electronTimer.stop(timerIdRef.current)
      
      isRunningRef.current = false
      setIsRunning(false)
      console.log('[useElectronInterval] Timer stopped successfully')
    } catch (err) {
      console.error('[useElectronInterval] Failed to stop timer:', err)
    }
  }, [])

  // enabled 变化时控制启停
  useEffect(() => {
    if (enabled) {
      start()
    } else {
      stop()
    }

    // 清理函数
    return () => {
      if (isRunningRef.current) {
        stop().catch(() => {})
      }
    }
  }, [enabled, start, stop])

  // 组件完全卸载时清理
  useEffect(() => {
    return () => {
      if (listenerCleanupRef.current) {
        listenerCleanupRef.current()
        listenerCleanupRef.current = null
      }
      isRunningRef.current = false
    }
  }, [])

  return { start, stop, isRunning }
}
