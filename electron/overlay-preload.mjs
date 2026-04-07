// Overlay window preload script
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('closeOverlay', () => {
  return ipcRenderer.invoke('close-fullscreen-overlay')
})
