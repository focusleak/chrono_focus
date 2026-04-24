/**
 * usePrecisionTimer Hook
 * 
 * 基于 TimerEngine 的精确计时 Hook，替代原有 useInterval
 * 提供稳定的时间源，不受浏览器后台限流影响
 * 
 * @example
 * ```tsx
 * // 倒计时模式
 * usePrecisionTimer({
 *   id: 'pomodoro',
 *   mode: 'countdown',
 *   duration: 25 * 60 * 1000,
 *   enabled: isRunning,
 *   onTick: (state) => {
 *     setTimeLeft(Math.ceil(state.remaining! / 1000))
 *   },
 *   onComplete: () => {
 *     handleComplete()
 *   }
 * })
 * 
 * // 正计时模式
 * usePrecisionTimer({
 *   id: 'patata',
 *   mode: 'stopwatch',
 *   enabled: isRunning,
 *   onTick: (state) => {
 *     setElapsed(Math.floor(state.elapsed / 1000))
 *   }
 * })
 * ```
 */

import { useEffect, useRef } from 'react'
import { timerEngine, type TimerConfig, type TimerCallback } from '@/engine/timerEngine'

export interface UsePrecisionTimerOptions {
  id: string
  mode: TimerConfig['mode']
  duration?: number           // 毫秒，仅 countdown 模式需要
  enabled?: boolean
  interval?: number           // 毫秒，默认 1000ms
  onTick?: TimerCallback
  onComplete?: TimerCallback
}

export function usePrecisionTimer(options: UsePrecisionTimerOptions) {
  const {
    id,
    mode,
    duration,
    enabled = true,
    interval = 1000,
    onTick,
    onComplete,
  } = options

  // 使用 ref 保存最新的回调，避免闭包问题
  const onTickRef = useRef(onTick)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onTickRef.current = onTick
    onCompleteRef.current = onComplete
  }, [onTick, onComplete])

  useEffect(() => {
    // 注册计时器
    const unregister = timerEngine.register(
      {
        id,
        mode,
        interval,
        duration,
        enabled: false, // 手动控制启停
      },
      (state) => onTickRef.current?.(state),
      (state) => onCompleteRef.current?.(state),
    )

    // 组件卸载时注销
    return () => {
      unregister()
    }
  }, [id, mode, interval, duration])

  // enabled 变化时控制启停
  useEffect(() => {
    const isRunning = timerEngine.isRunning(id)

    if (enabled && !isRunning) {
      // 检查是否已完成（需要重置）
      const state = timerEngine.getState(id)
      if (state?.isComplete) {
        // 重新注册（因为 complete 后状态已终态）
        timerEngine.unregister(id)
        timerEngine.register(
          { id, mode, interval, duration, enabled: false },
          (state) => onTickRef.current?.(state),
          (state) => onCompleteRef.current?.(state),
        )
      }
      timerEngine.start(id)
    } else if (!enabled && isRunning) {
      timerEngine.stop(id)
    }
  }, [enabled, id, mode, interval, duration])
}
