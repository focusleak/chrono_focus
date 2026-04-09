const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('overlayAPI', {
  close: () => ipcRenderer.invoke('close-overlay'),

  notifyClosed: () => ipcRenderer.invoke('overlay-action', { action: 'closed' }),

  notifySkip: () => ipcRenderer.invoke('overlay-action', { action: 'skip' }),

  notifyContinueWork: () => ipcRenderer.invoke('overlay-action', { action: 'continueWork' }),

  notifyQuizCorrect: () => ipcRenderer.invoke('overlay-action', { action: 'quizCorrect' }),

  notifyQuizClose: () => ipcRenderer.invoke('overlay-action', { action: 'quizClose' }),
})
