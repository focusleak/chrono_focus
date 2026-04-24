/**
 * Web Worker 精确时间源
 * 
 * 不受浏览器后台限流影响，提供稳定的高精度计时
 * 支持多计时器实例管理
 */

interface TimerMessage {
  type: 'start' | 'stop' | 'tick' | 'complete' | 'error'
  id: string
  interval?: number
  duration?: number
  elapsed?: number
  remaining?: number
  startTime?: number
}

interface TimerInstance {
  id: string
  intervalId: ReturnType<typeof setInterval> | null
  startTime: number
  interval: number
  duration?: number
  tickCount: number
}

const timers = new Map<string, TimerInstance>()

/**
 * 启动计时器
 */
function startTimer(id: string, interval: number, duration?: number): void {
  // 如果已存在，先停止
  if (timers.has(id)) {
    stopTimer(id)
  }

  const startTime = Date.now()
  const timer: TimerInstance = {
    id,
    intervalId: null,
    startTime,
    interval,
    duration,
    tickCount: 0,
  }

  timer.intervalId = setInterval(() => {
    const elapsed = Date.now() - startTime
    timer.tickCount++

    const message: TimerMessage = {
      type: 'tick',
      id,
      elapsed,
    }

    // 倒计时模式：计算剩余时间
    if (duration !== undefined) {
      const remaining = Math.max(0, duration - elapsed)
      message.remaining = remaining

      if (remaining <= 0) {
        message.type = 'complete'
        self.postMessage(message)
        stopTimer(id)
        return
      }
    }

    self.postMessage(message)
  }, interval)

  timers.set(id, timer)
}

/**
 * 停止计时器
 */
function stopTimer(id: string): void {
  const timer = timers.get(id)
  if (timer && timer.intervalId !== null) {
    clearInterval(timer.intervalId)
    timers.delete(id)
  }
}

/**
 * 停止所有计时器
 */
function stopAllTimers(): void {
  timers.forEach((timer) => {
    if (timer.intervalId !== null) {
      clearInterval(timer.intervalId)
    }
  })
  timers.clear()
}

// 监听主线程消息
self.onmessage = (e: MessageEvent) => {
  const { type, id, interval, duration } = e.data as TimerMessage

  switch (type) {
    case 'start':
      if (interval && interval > 0) {
        startTimer(id, interval, duration)
      }
      break

    case 'stop':
      stopTimer(id)
      break

    case 'error':
      console.error('[TimerWorker] Error message received:', e.data)
      break

    default:
      console.warn('[TimerWorker] Unknown message type:', type)
  }
}

// Worker 卸载时清理
self.onclose = () => {
  stopAllTimers()
}

export {}
