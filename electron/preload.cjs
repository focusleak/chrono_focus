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
})
