import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, body) =>
    ipcRenderer.invoke('show-notification', { title, body }),

  requestNotificationPermission: () =>
    ipcRenderer.invoke('request-notification-permission'),

  setAutoLaunch: (enabled) =>
    ipcRenderer.invoke('set-auto-launch', enabled),

  getAutoLaunchStatus: () =>
    ipcRenderer.invoke('get-auto-launch'),

  showFullscreenOverlay: () =>
    ipcRenderer.invoke('show-fullscreen-overlay'),

  closeFullscreenOverlay: () =>
    ipcRenderer.invoke('close-fullscreen-overlay'),

  onOverlayClosed: (callback) =>
    ipcRenderer.on('overlay-closed', () => callback()),

  showRestReminderOverlay: (config) =>
    ipcRenderer.invoke('show-rest-reminder-overlay', config),

  showQuizOverlay: (config) =>
    ipcRenderer.invoke('show-quiz-overlay', config),

  closeOverlay: () =>
    ipcRenderer.invoke('close-overlay'),

  updateTrayText: (text) =>
    ipcRenderer.invoke('update-tray-text', { text }),

  updateTrayMenu: (state) =>
    ipcRenderer.invoke('update-tray-menu', { state }),

  onTrayAction: (callback) => {
    const handler = (_event, action) => callback(action)
    ipcRenderer.on('tray-action', handler)
    return () => ipcRenderer.removeListener('tray-action', handler)
  },

  onOverlayAction: (callback) =>
    ipcRenderer.on('overlay-action', (_event, action) => callback(action)),
})
