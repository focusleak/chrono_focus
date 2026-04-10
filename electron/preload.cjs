const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 通知
  showNotification: (title, body) =>
    ipcRenderer.invoke('show-notification', { title, body }),

  requestNotificationPermission: () =>
    ipcRenderer.invoke('request-notification-permission'),

  // 开机自启
  setAutoLaunch: (enabled) =>
    ipcRenderer.invoke('set-auto-launch', enabled),

  getAutoLaunchStatus: () =>
    ipcRenderer.invoke('get-auto-launch'),

  // 系统托盘
  updateTrayText: (text) =>
    ipcRenderer.invoke('update-tray-text', { text }),

  updateTrayMenu: (state) =>
    ipcRenderer.invoke('update-tray-menu', { state }),

  // 事件监听
  onTrayAction: (callback) => {
    const handler = (_event, action) => callback(action)
    ipcRenderer.on('tray-action', handler)
    return () => ipcRenderer.removeListener('tray-action', handler)
  },

  // FullScreenOverlay
  fullscreenOverlay: {
    show: (config) =>
      ipcRenderer.invoke('fullscreen-overlay:show', config),

    close: () =>
      ipcRenderer.invoke('fullscreen-overlay:close'),

    onAction: (callback) => {
      const handler = (_event, action) => callback(action)
      ipcRenderer.on('fullscreen-overlay:action', handler)
      return () => ipcRenderer.removeListener('fullscreen-overlay:action', handler)
    },
  },

  // Electron 定时器
  electronTimer: {
    // 创建定时器
    create: (id, delay) => {
      console.log('[Preload] Creating timer', { id, delay });
      return ipcRenderer.invoke('electron-timer:create', { id, delay });
    },

    // 停止定时器
    stop: (id) => {
      console.log('[Preload] Stopping timer', { id });
      return ipcRenderer.invoke('electron-timer:stop', id);
    },

    // 停止所有定时器
    stopAll: () => {
      console.log('[Preload] Stopping all timers');
      return ipcRenderer.invoke('electron-timer:stopAll');
    },

    // 监听定时器触发事件 (支持新的对象格式 { id, elapsed })
    onTick: (callback) => {
      console.log('[Preload] Setting up onTick listener');
      const handler = (_event, data) => {
        // 兼容旧格式(纯字符串 ID)和新格式(对象)
        const id = typeof data === 'object' ? data.id : data
        const elapsed = typeof data === 'object' ? data.elapsed : undefined
        console.log('[Preload] Received tick', { id, elapsed, data });
        callback(id, elapsed)
      }
      ipcRenderer.on('electron-timer:tick', handler)
      return () => {
        console.log('[Preload] Removing onTick listener');
        ipcRenderer.removeListener('electron-timer:tick', handler)
      }
    },

    // 监听唤醒事件
    onWakeUp: (callback) => {
      const handler = (_event, id) => {
        console.log('[Preload] Received wakeup', { id });
        callback(id)
      }
      ipcRenderer.on('electron-timer:wakeup', handler)
      return () => ipcRenderer.removeListener('electron-timer:wakeup', handler)
    },
  },
})
