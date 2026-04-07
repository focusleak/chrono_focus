// Overlay window preload script
import { contextBridge, ipcRenderer } from 'electron'

console.log('[overlay-preload] Initializing overlay API')

contextBridge.exposeInMainWorld('overlayAPI', {
  // 直接关闭当前遮罩窗口
  close: () => {
    console.log('[overlayAPI] close called')
    return ipcRenderer.invoke('close-overlay')
  },
  // 通知主进程遮罩已关闭
  notifyClosed: () => ipcRenderer.invoke('overlay-action', { action: 'closed' }),
  // 通知主进程：跳过
  notifySkip: () => {
    console.log('[overlayAPI] notifySkip called')
    return ipcRenderer.invoke('overlay-action', { action: 'skip' })
  },
  // 通知主进程：继续工作
  notifyContinueWork: () => ipcRenderer.invoke('overlay-action', { action: 'continueWork' }),
  // 通知主进程：答题正确
  notifyQuizCorrect: () => ipcRenderer.invoke('overlay-action', { action: 'quizCorrect' }),
  // 通知主进程：关闭答题窗口
  notifyQuizClose: () => ipcRenderer.invoke('overlay-action', { action: 'quizClose' }),
})

console.log('[overlay-preload] overlayAPI exposed')
