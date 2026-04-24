/**
 * TimerEngine - 统一计时引擎
 * 
 * 基于精确时间源的单例计时引擎，管理所有计时器实例
 * 提供倒计时和正计时两种模式，自动处理时间漂移和后台唤醒补偿
 */

import { createTimeSource, type TimeSource, type TimerTickEvent } from './timeSource'

// ========== 类型定义 ==========

export type TimerMode = 'countdown' | 'stopwatch'

export interface TimerConfig {
  id: string
  mode: TimerMode
  interval?: number       // 触发间隔（毫秒），默认 1000ms
  duration?: number       // 总时长（毫秒），仅 countdown 模式需要
  enabled?: boolean       // 是否启用
}

export interface TimerState {
  id: string
  mode: TimerMode
  startTime: number       // 启动时间戳
  elapsed: number         // 已耗时（毫秒）
  remaining?: number      // 剩余时间（毫秒）
  isRunning: boolean
  isComplete: boolean
}

export type TimerCallback = (state: TimerState) => void

interface TimerInstance {
  config: TimerConfig
  state: TimerState
  onTick?: TimerCallback
  onComplete?: TimerCallback
  unsubscribe?: () => void
}

// ========== TimerEngine 单例 ==========

class TimerEngine {
  private timeSource: TimeSource
  private timers = new Map<string, TimerInstance>()
  private globalTickListeners = new Set<(event: TimerTickEvent) => void>()

  constructor() {
    this.timeSource = createTimeSource()
  }

  /**
   * 注册计时器
   */
  register(
    config: TimerConfig,
    onTick?: TimerCallback,
    onComplete?: TimerCallback,
  ): () => void {
    const { id, mode, interval = 1000, duration, enabled = false } = config

    if (this.timers.has(id)) {
      console.warn(`[TimerEngine] Timer "${id}" already exists, unregistering first`)
      this.unregister(id)
    }

    const state: TimerState = {
      id,
      mode,
      startTime: 0,
      elapsed: 0,
      remaining: mode === 'countdown' && duration ? duration : undefined,
      isRunning: false,
      isComplete: false,
    }

    const instance: TimerInstance = {
      config: { id, mode, interval, duration, enabled },
      state,
      onTick,
      onComplete,
    }

    this.timers.set(id, instance)

    // 如果启用则立即启动
    if (enabled) {
      this.start(id)
    }

    // 返回注销函数
    return () => this.unregister(id)
  }

  /**
   * 注销计时器
   */
  unregister(id: string): void {
    const instance = this.timers.get(id)
    if (!instance) return

    if (instance.state.isRunning) {
      this.stop(id)
    }

    instance.unsubscribe?.()
    this.timers.delete(id)
  }

  /**
   * 启动计时器
   */
  async start(id: string): Promise<void> {
    const instance = this.timers.get(id)
    if (!instance) {
      throw new Error(`[TimerEngine] Timer "${id}" not found`)
    }

    if (instance.state.isRunning) return

    const interval = instance.config.interval ?? 1000
    const duration = instance.config.duration

    // 设置初始状态
    instance.state.startTime = Date.now()
    instance.state.elapsed = 0
    instance.state.remaining = instance.config.mode === 'countdown' ? duration : undefined
    instance.state.isRunning = true
    instance.state.isComplete = false

    // 启动底层时间源
    await this.timeSource.start(id, interval, instance.config.mode === 'countdown' ? duration : undefined)

    // 订阅 tick 事件
    instance.unsubscribe = this.timeSource.onTick((event) => {
      if (event.id !== id) return

      instance.state.elapsed = event.elapsed
      if (event.remaining !== undefined) {
        instance.state.remaining = event.remaining
      }

      // 检查是否完成
      if (instance.config.mode === 'countdown' && event.remaining !== undefined && event.remaining <= 0) {
        instance.state.isComplete = true
        instance.state.isRunning = false
        instance.onComplete?.(instance.state)
      }

      // 触发回调
      instance.onTick?.(instance.state)
    })

    // 通知全局监听器
    this.notifyStart(id)
  }

  /**
   * 停止计时器
   */
  async stop(id: string): Promise<void> {
    const instance = this.timers.get(id)
    if (!instance) return

    if (!instance.state.isRunning) return

    instance.state.isRunning = false
    instance.unsubscribe?.()
    instance.unsubscribe = undefined

    await this.timeSource.stop(id)
    this.notifyStop(id)
  }

  /**
   * 暂停计时器（保留当前进度）
   */
  async pause(id: string): Promise<void> {
    const instance = this.timers.get(id)
    if (!instance) return

    if (!instance.state.isRunning) return

    // 停止底层计时器，但保留状态
    instance.state.isRunning = false
    instance.unsubscribe?.()
    instance.unsubscribe = undefined

    await this.timeSource.stop(id)
  }

  /**
   * 恢复计时器（从暂停处继续）
   */
  async resume(id: string): Promise<void> {
    const instance = this.timers.get(id)
    if (!instance) return

    if (instance.state.isRunning) return

    const interval = instance.config.interval ?? 1000
    const duration = instance.config.duration

    // 重新计算 startTime，使 elapsed 保持不变
    instance.state.startTime = Date.now() - instance.state.elapsed
    instance.state.isRunning = true
    instance.state.isComplete = false

    // 重新启动
    await this.timeSource.start(id, interval, instance.config.mode === 'countdown' ? duration : undefined)

    instance.unsubscribe = this.timeSource.onTick((event) => {
      if (event.id !== id) return

      instance.state.elapsed = event.elapsed
      if (event.remaining !== undefined) {
        instance.state.remaining = event.remaining
      }

      if (instance.config.mode === 'countdown' && event.remaining !== undefined && event.remaining <= 0) {
        instance.state.isComplete = true
        instance.state.isRunning = false
        instance.onComplete?.(instance.state)
      }

      instance.onTick?.(instance.state)
    })
  }

  /**
   * 获取计时器状态
   */
  getState(id: string): TimerState | undefined {
    const instance = this.timers.get(id)
    return instance?.state
  }

  /**
   * 获取所有计时器状态
   */
  getAllStates(): Map<string, TimerState> {
    const result = new Map<string, TimerState>()
    this.timers.forEach((instance, id) => {
      result.set(id, instance.state)
    })
    return result
  }

  /**
   * 是否正在运行
   */
  isRunning(id: string): boolean {
    return this.timers.get(id)?.state.isRunning ?? false
  }

  /**
   * 停止所有计时器
   */
  async stopAll(): Promise<void> {
    const promises = Array.from(this.timers.keys()).map(id => this.stop(id))
    await Promise.all(promises)
  }

  /**
   * 销毁引擎，清理所有资源
   */
  async destroy(): Promise<void> {
    await this.stopAll()
    this.timers.clear()
    this.globalTickListeners.clear()
    this.timeSource.destroy()
  }

  // ========== 私有方法 ==========

  private notifyStart(_id: string): void {
    // 预留：可触发全局事件
  }

  private notifyStop(_id: string): void {
    // 预留：可触发全局事件
  }
}

// 单例导出
export const timerEngine = new TimerEngine()
