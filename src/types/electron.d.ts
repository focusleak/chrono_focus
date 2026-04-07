export interface ElectronAPI {
  showNotification: (title: string, body: string) => Promise<boolean>
  requestNotificationPermission: () => Promise<boolean>
  setAutoLaunch: (enabled: boolean) => Promise<{ success: boolean; enabled?: boolean; error?: string }>
  getAutoLaunchStatus: () => Promise<{ success: boolean; enabled?: boolean; error?: string }>
  showFullscreenOverlay: () => Promise<boolean>
  closeFullscreenOverlay: () => Promise<boolean>
  onOverlayClosed: (callback: () => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
