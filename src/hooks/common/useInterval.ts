import { useRef, useEffect, useCallback } from 'react'

/**
 * 通用定时器 Hook
 * @param callback 定时执行的回调
 * @param delay 间隔时间（毫秒）
 * @param enabled 是否启用定时器
 */
export function useInterval(
  callback: () => void,
  delay: number,
  enabled: boolean = true,
) {
  const savedCallback = useRef(callback)
  const savedDelay = useRef(delay)

  // 保存最新的 callback 和 delay
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    savedDelay.current = delay
  }, [delay])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(
      () => savedCallback.current(),
      savedDelay.current,
    )
  }, [])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // 根据 enabled 自动启停
  useEffect(() => {
    if (enabled) {
      start()
    } else {
      stop()
    }
    return stop
  }, [enabled, start, stop])

  // delay 变化时重建 interval
  useEffect(() => {
    if (enabled && intervalRef.current) {
      stop()
      start()
    }
  }, [delay, enabled, start, stop])

  // 组件卸载时清理
  useEffect(() => stop, [stop])

  return { start, stop }
}
