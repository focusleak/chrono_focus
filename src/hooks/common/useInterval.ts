import { useRef, useEffect, useCallback, useState } from 'react'

// ========== 策略接口定义 ==========

/**
 * 定时器策略接口
 * 定义所有平台定时器必须实现的接口
 */
interface TimerStrategy {
  start(callback: () => void, delay: number): void
  stop(): void
  isRunning(): boolean
}

/**
 * 浏览器定时器策略（使用原生 setInterval）
 */
class BrowserTimerStrategy implements TimerStrategy {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private callbackRef: (() => void) | null = null

  start(callback: () => void, delay: number): void {
    if (this.intervalId) return
    this.callbackRef = callback
    this.intervalId = setInterval(() => {
      this.callbackRef?.()
    }, delay)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.callbackRef = null
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null
  }
}

/**
 * Electron 定时器策略（使用主进程 IPC）
 */
class ElectronTimerStrategy implements TimerStrategy {
  private timerId: string
  private callbackRef: (() => void) | null = null
  private listenerCleanup: (() => void) | null = null
  private running = false
  private isStarting = false // 防止并发 start

  constructor() {
    this.timerId = `timer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }

  start(callback: () => void, delay: number): void {
    if (this.running || this.isStarting || !window.electronAPI?.electronTimer) return

    this.isStarting = true
    this.callbackRef = callback

    // 设置监听器
    this.listenerCleanup = window.electronAPI.electronTimer.onTick((id) => {
      if (id === this.timerId && this.running) {
        this.callbackRef?.()
      }
    })

    // 创建定时器
    window.electronAPI.electronTimer
      .create(this.timerId, delay)
      .then(() => {
        this.running = true
        this.isStarting = false
      })
      .catch((err) => {
        console.error('[ElectronTimer] Failed to start:', err)
        this.cleanup()
      })
  }

  stop(): void {
    if (!this.running && !this.isStarting) return
    this.cleanup()
  }

  isRunning(): boolean {
    return this.running || this.isStarting
  }

  private cleanup(): void {
    if (this.listenerCleanup) {
      this.listenerCleanup()
      this.listenerCleanup = null
    }

    if (window.electronAPI?.electronTimer) {
      window.electronAPI.electronTimer.stop(this.timerId).catch(() => {})
    }

    this.callbackRef = null
    this.running = false
    this.isStarting = false
  }
}

// ========== 策略工厂 ==========

/**
 * 定时器策略工厂
 * 根据运行环境自动选择合适的策略
 */
function createTimerStrategy(): TimerStrategy {
  // 检测 Electron 环境
  if (typeof window !== 'undefined' && window.electronAPI?.electronTimer) {
    return new ElectronTimerStrategy()
  }
  
  // 默认使用浏览器策略
  return new BrowserTimerStrategy()
}

// ========== Hook 实现 ==========

/**
 * 通用定时器 Hook
 * 使用策略模式自动适配不同平台的定时器实现
 *
 * 支持平台：
 * - Electron：使用主进程定时器，后台运行可靠
 * - Browser：使用原生 setInterval
 *
 * @param callback 定时执行的回调
 * @param delay 间隔时间（毫秒）
 * @param enabled 是否启用定时器
 *
 * @returns {Object} { start, stop, isRunning }
 *
 * @example
 * ```tsx
 * // 基础用法
 * const { start, stop, isRunning } = useInterval(
 *   () => console.log('tick'),
 *   1000,
 *   true
 * )
 *
 * // 手动控制
 * const { start, stop } = useInterval(callback, 1000, false)
 * start()  // 手动启动
 * stop()   // 手动停止
 * ```
 */
export function useInterval(
  callback: () => void,
  delay: number,
  enabled: boolean = true,
) {
  const [isRunningState, setIsRunning] = useState(false)
  const savedCallback = useRef(callback)
  const strategyRef = useRef<TimerStrategy>(createTimerStrategy())
  const delayRef = useRef(delay)

  // 保存最新的 callback 和 delay
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    delayRef.current = delay
  }, [delay])

  const start = useCallback(() => {
    const strategy = strategyRef.current
    if (strategy.isRunning()) return

    strategy.start(() => savedCallback.current(), delayRef.current)
    
    // 使用轮询检查策略状态（因为 Electron 是异步的）
    const checkRunning = setInterval(() => {
      if (strategy.isRunning()) {
        setIsRunning(true)
        clearInterval(checkRunning)
      }
    }, 10)
    
    // 50ms 后强制设置为运行状态（避免 Electron 模式下延迟）
    setTimeout(() => {
      if (strategy.isRunning()) {
        setIsRunning(true)
      }
      clearInterval(checkRunning)
    }, 50)
  }, [])

  const stop = useCallback(() => {
    strategyRef.current.stop()
    setIsRunning(false)
  }, [])

  // enabled 变化时控制启停
  useEffect(() => {
    if (enabled) {
      start()
    } else {
      stop()
    }

    return () => {
      if (strategyRef.current.isRunning()) {
        stop()
      }
    }
  }, [enabled, start, stop])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      strategyRef.current.stop()
    }
  }, [])

  // 同步策略的运行状态到 React state
  useEffect(() => {
    const interval = setInterval(() => {
      const running = strategyRef.current.isRunning()
      setIsRunning(running)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return { start, stop, isRunning: isRunningState }
}

// ========== 导出策略类（供高级使用） ==========

export {
  BrowserTimerStrategy,
  ElectronTimerStrategy,
  createTimerStrategy,
  type TimerStrategy,
}
