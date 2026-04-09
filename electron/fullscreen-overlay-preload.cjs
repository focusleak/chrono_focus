const { contextBridge, ipcRenderer } = require('electron')

/**
 * FullScreenOverlay 预加载脚本
 * 暴露 overlayAPI 给遮罩窗口的渲染进程
 */
contextBridge.exposeInMainWorld('overlayAPI', {
  /** 关闭遮罩 */
  close: () => ipcRenderer.invoke('fullscreen-overlay:close'),

  /** 通知主进程用户操作 */
  notify: (action) => ipcRenderer.invoke('fullscreen-overlay:action', { action }),
})
