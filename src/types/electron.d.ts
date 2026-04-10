export interface ElectronAPI {
  // 通知
  showNotification: (title: string, body: string) => Promise<boolean>
  requestNotificationPermission: () => Promise<boolean>

  // 开机自启
  setAutoLaunch: (enabled: boolean) => Promise<{ success: boolean; enabled?: boolean; error?: string }>
  getAutoLaunchStatus: () => Promise<{ success: boolean; enabled?: boolean; error?: string }>

  // 系统托盘
  updateTrayText: (text: string) => Promise<boolean>
  updateTrayMenu: (state: string) => Promise<boolean>
  onTrayAction: (callback: (action: string) => void) => () => void

  // FullScreenOverlay
  fullscreenOverlay: {
    show: (config: { content: string; backgroundColor?: string }) => Promise<void>
    close: () => Promise<void>
    onAction: (callback: (action: string) => void) => () => void
  }

  // Electron 定时器
  electronTimer: {
    create: (id: string, delay: number) => Promise<boolean>
    stop: (id: string) => Promise<boolean>
    stopAll: () => Promise<boolean>
    onTick: (callback: (id: string, elapsed?: number) => void) => () => void
    onWakeUp: (callback: (id: string) => void) => () => void
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
