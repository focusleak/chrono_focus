// Preload script
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, body) => {
    console.log('[electronAPI] showNotification:', title, body)
    return ipcRenderer.invoke('show-notification', { title, body })
  },
  requestNotificationPermission: () => {
    console.log('[electronAPI] requestNotificationPermission')
    return ipcRenderer.invoke('request-notification-permission')
  },
  setAutoLaunch: (enabled) =>
    ipcRenderer.invoke('set-auto-launch', enabled),
  getAutoLaunchStatus: () =>
    ipcRenderer.invoke('get-auto-launch'),
  showFullscreenOverlay: () => {
    console.log('[preload] showFullscreenOverlay called')
    return ipcRenderer.invoke('show-fullscreen-overlay')
  },
  closeFullscreenOverlay: () => {
    console.log('[preload] closeFullscreenOverlay called')
    return ipcRenderer.invoke('close-fullscreen-overlay')
  },
  onOverlayClosed: (callback) => {
    console.log('[preload] onOverlayClosed listener registered')
    ipcRenderer.on('overlay-closed', () => callback())
  },

  // 休息提醒遮罩
  showRestReminderOverlay: (config) =>
    ipcRenderer.invoke('show-rest-reminder-overlay', config),
  // 答题遮罩
  showQuizOverlay: (config) =>
    ipcRenderer.invoke('show-quiz-overlay', config),
  // 关闭遮罩
  closeOverlay: () =>
    ipcRenderer.invoke('close-overlay'),
  // 监听遮罩动作事件（从 Electron 遮罩窗口转发）
  onOverlayAction: (callback) => {
    ipcRenderer.on('overlay-action', (_event, action) => callback(action))
  },
})
