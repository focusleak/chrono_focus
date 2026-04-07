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
})
