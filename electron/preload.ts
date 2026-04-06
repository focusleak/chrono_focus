import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('show-notification', { title, body }),
  requestNotificationPermission: () =>
    ipcRenderer.invoke('request-notification-permission'),
  setAutoLaunch: (enabled: boolean) =>
    ipcRenderer.invoke('set-auto-launch', enabled),
  getAutoLaunchStatus: () =>
    ipcRenderer.invoke('get-auto-launch'),
})
