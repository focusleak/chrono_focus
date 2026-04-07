export interface ElectronAPI {
  showNotification: (title: string, body: string) => Promise<boolean>
  requestNotificationPermission: () => Promise<boolean>
  setAutoLaunch: (enabled: boolean) => Promise<{ success: boolean; enabled?: boolean; error?: string }>
  getAutoLaunchStatus: () => Promise<{ success: boolean; enabled?: boolean; error?: string }>
  showFullscreenOverlay: () => Promise<boolean>
  closeFullscreenOverlay: () => Promise<boolean>
  onOverlayClosed: (callback: () => void) => void

  // 休息提醒遮罩
  showRestReminderOverlay: (config: {
    isLongBreak: boolean
    timeLeft: number
    progress: number
    breakDuration: number
    isSkipped?: boolean
    skipCount?: number
  }) => Promise<boolean>
  // 答题遮罩
  showQuizOverlay: (config: { num1: number; num2: number }) => Promise<boolean>
  // 关闭遮罩
  closeOverlay: () => Promise<boolean>
  // 监听遮罩动作事件（从 Electron 遮罩窗口转发）
  onOverlayAction: (callback: (action: string) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
