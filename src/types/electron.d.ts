export interface ElectronAPI {
  // 通知
  showNotification: (title: string, body: string) => Promise<boolean>
  requestNotificationPermission: () => Promise<boolean>

  // 开机自启
  setAutoLaunch: (enabled: boolean) => Promise<{ success: boolean; enabled?: boolean; error?: string }>
  getAutoLaunchStatus: () => Promise<{ success: boolean; enabled?: boolean; error?: string }>

  // 遮罩管理
  showRestReminderOverlay: (config: {
    isLongBreak: boolean
    timeLeft: number
    progress: number
    breakDuration: number
    isSkipped?: boolean
    skipCount?: number
  }) => Promise<boolean>
  showQuizOverlay: (config: { num1: number; num2: number }) => Promise<boolean>
  closeOverlay: () => Promise<boolean>
  onOverlayClosed: (callback: () => void) => void

  // 系统托盘
  updateTrayText: (text: string) => Promise<boolean>
  updateTrayMenu: (state: string) => Promise<boolean>
  onTrayAction: (callback: (action: string) => void) => () => void

  // 事件监听
  onOverlayAction: (callback: (action: string) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
