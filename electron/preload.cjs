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

  // 遮罩管理
  showRestReminderOverlay: (config) =>
    ipcRenderer.invoke('show-rest-reminder-overlay', config),

  showQuizOverlay: (config) =>
    ipcRenderer.invoke('show-quiz-overlay', config),

  closeOverlay: () =>
    ipcRenderer.invoke('close-overlay'),

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

  onOverlayAction: (callback) =>
    ipcRenderer.on('overlay-action', (_event, action) => callback(action)),

  onOverlayClosed: (callback) =>
    ipcRenderer.on('overlay-closed', () => callback()),
})
