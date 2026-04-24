// ========== 定时器管理 ==========
const timers = new Map()

export function createTimer(id, delay, mainWindow) {
  console.log('[Electron Timer] Creating timer', { id, delay })

  if (timers.has(id)) {
    console.log('[Electron Timer] Timer already exists, stopping first', { id })
    stopTimer(id)
  }

  // 记录创建时间戳,用于后台唤醒后的时间补偿
  const startTime = Date.now()
  const timerId = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      // 发送定时器 ID 和实际经过的时间
      const elapsed = Date.now() - startTime
      console.log('[Electron Timer] Sending tick', { id, elapsed })
      mainWindow.webContents.send('electron-timer:tick', { id, elapsed })
    } else {
      console.log('[Electron Timer] Cannot send tick - mainWindow destroyed or null', { id })
    }
  }, delay)

  timers.set(id, { timerId, delay, startTime })
  console.log('[Electron Timer] Timer created successfully', { id, delay })
  return true
}

export function stopTimer(id) {
  console.log('[Electron Timer] Stopping timer', { id })
  if (timers.has(id)) {
    clearInterval(timers.get(id).timerId)
    timers.delete(id)
    console.log('[Electron Timer] Timer stopped', { id })
    return true
  }
  console.log('[Electron Timer] Timer not found', { id })
  return false
}

export function stopAllTimers() {
  timers.forEach((_, id) => stopTimer(id))
}

// 处理应用唤醒后的时间同步
export function handleAppWakeUp(mainWindow) {
  timers.forEach((timer, id) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      // 发送唤醒事件,让渲染进程可以同步状态
      mainWindow.webContents.send('electron-timer:wakeup', id)
    }
  })
}
