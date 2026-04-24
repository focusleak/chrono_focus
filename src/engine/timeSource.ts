/**
 * 精确时间源抽象层
 * 
 * 统一 Electron IPC / Web Worker / Browser 三种时间源策略
 * 提供精确的时间戳，避免后台限流导致的时间漂移
 */

import TimerWorker from './timer.worker.ts?worker'

// ========== 事件类型定义 ==========

export interface TimerTickEvent {
  id: string
  elapsed: number       // 已耗时（毫秒）
  remaining?: number    // 剩余时间（毫秒，仅倒计时模式）
}

export type TimerEventListener = (event: TimerTickEvent) => void

// ========== 策略接口 ==========

export interface TimeSource {
  /**
   * 启动计时器
   * @param id 计时器唯一标识
   * @param interval 触发间隔（毫秒）
   * @param duration 总时长（毫秒，可选，用于倒计时）
   */
  start(id: string, interval: number, duration?: number): Promise<void>

  /**
   * 停止计时器
   */
  stop(id: string): Promise<void>

  /**
   * 监听 tick 事件
   * @returns 取消监听的函数
   */
  onTick(listener: TimerEventListener): () => void

  /**
   * 是否正在运行
   */
  isRunning(id: string): boolean

  /**
   * 销毁时间源，清理所有资源
   */
  destroy(): void
}

// ========== Web Worker 策略 ==========

class WorkerTimeSource implements TimeSource {
  private worker: Worker
  private listeners = new Set<TimerEventListener>()
  private runningTimers = new Set<string>()

  constructor() {
    this.worker = new TimerWorker()

    this.worker.onmessage = (e: MessageEvent) => {
      const data = e.data
      if (data.type === 'tick' || data.type === 'complete') {
        const event: TimerTickEvent = {
          id: data.id,
          elapsed: data.elapsed,
          remaining: data.remaining,
        }
        this.listeners.forEach(listener => listener(event))

        if (data.type === 'complete') {
          this.runningTimers.delete(data.id)
        }
      }
    }
  }

  async start(id: string, interval: number, duration?: number): Promise<void> {
    this.worker.postMessage({
      type: 'start',
      id,
      interval,
      duration,
    })
    this.runningTimers.add(id)
  }

  async stop(id: string): Promise<void> {
    this.worker.postMessage({ type: 'stop', id })
    this.runningTimers.delete(id)
  }

  onTick(listener: TimerEventListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  isRunning(id: string): boolean {
    return this.runningTimers.has(id)
  }

  destroy(): void {
    this.worker.terminate()
    this.listeners.clear()
    this.runningTimers.clear()
  }
}

// ========== Electron IPC 策略 ==========

class ElectronTimeSource implements TimeSource {
  private listeners = new Set<TimerEventListener>()
  private runningTimers = new Set<string>()
  private cleanupFns = new Map<string, () => void>()

  async start(id: string, interval: number, _duration?: number): Promise<void> {
    if (!window.electronAPI?.electronTimer) {
      throw new Error('Electron API not available')
    }

    // 如果已存在，先停止
    if (this.runningTimers.has(id)) {
      await this.stop(id)
    }

    // 设置监听器
    const cleanup = window.electronAPI.electronTimer.onTick((id, elapsed) => {
      const event: TimerTickEvent = {
        id,
        elapsed: elapsed ?? 0,
      }
      this.listeners.forEach(listener => listener(event))
    })

    this.cleanupFns.set(id, cleanup)

    await window.electronAPI.electronTimer.create(id, interval)
    this.runningTimers.add(id)
  }

  async stop(id: string): Promise<void> {
    if (!window.electronAPI?.electronTimer) return

    const cleanup = this.cleanupFns.get(id)
    cleanup?.()
    this.cleanupFns.delete(id)

    try {
      await window.electronAPI.electronTimer.stop(id)
    } catch (err) {
      console.warn('[ElectronTimeSource] Failed to stop timer:', err)
    }

    this.runningTimers.delete(id)
  }

  onTick(listener: TimerEventListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  isRunning(id: string): boolean {
    return this.runningTimers.has(id)
  }

  destroy(): void {
    this.cleanupFns.forEach(cleanup => cleanup())
    this.cleanupFns.clear()
    this.listeners.clear()
    this.runningTimers.clear()
  }
}

// ========== Browser Fallback 策略（带时间校正） ==========

class BrowserTimeSource implements TimeSource {
  private listeners = new Set<TimerEventListener>()
  private runningTimers = new Map<string, {
    intervalId: number
    startTime: number
    interval: number
    duration?: number
  }>()

  start(id: string, interval: number, duration?: number): Promise<void> {
    // 如果已存在，先停止
    this.stop(id)

    const startTime = Date.now()
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startTime

      const event: TimerTickEvent = {
        id,
        elapsed,
      }

      if (duration !== undefined) {
        const remaining = Math.max(0, duration - elapsed)
        event.remaining = remaining

        if (remaining <= 0) {
          this.listeners.forEach(listener => listener(event))
          this.stop(id)
          return
        }
      }

      this.listeners.forEach(listener => listener(event))
    }, interval)

    this.runningTimers.set(id, { intervalId, startTime, interval, duration })
    return Promise.resolve()
  }

  stop(id: string): Promise<void> {
    const timer = this.runningTimers.get(id)
    if (timer) {
      clearInterval(timer.intervalId)
      this.runningTimers.delete(id)
    }
    return Promise.resolve()
  }

  onTick(listener: TimerEventListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  isRunning(id: string): boolean {
    return this.runningTimers.has(id)
  }

  destroy(): void {
    this.runningTimers.forEach(timer => clearInterval(timer.intervalId))
    this.runningTimers.clear()
    this.listeners.clear()
  }
}

// ========== 策略工厂 ==========

/**
 * 创建合适的时间源策略
 * 优先级: Electron > Web Worker > Browser
 */
export function createTimeSource(): TimeSource {
  // 1. Electron 环境
  if (typeof window !== 'undefined' && window.electronAPI?.electronTimer) {
    return new ElectronTimeSource()
  }

  // 2. Web Worker 环境（现代浏览器）
  if (typeof Worker !== 'undefined') {
    try {
      return new WorkerTimeSource()
    } catch (err) {
      console.warn('[TimeSource] Failed to create Worker, falling back to Browser:', err)
    }
  }

  // 3. Browser Fallback
  return new BrowserTimeSource()
}

export type {
  WorkerTimeSource,
  ElectronTimeSource,
  BrowserTimeSource,
}
