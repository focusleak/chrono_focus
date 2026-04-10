/**
 * 平台策略工厂
 * 
 * 使用策略模式统一管理不同平台（Electron / Browser）的 API 实现
 * 自动检测运行环境并选择最佳策略
 */

// ========== 通知策略接口 ==========

export interface NotificationStrategy {
  show(title: string, body: string): Promise<void>
  requestPermission(): Promise<boolean>
}

class ElectronNotificationStrategy implements NotificationStrategy {
  async show(title: string, body: string): Promise<void> {
    await window.electronAPI.showNotification(title, body)
  }

  async requestPermission(): Promise<boolean> {
    return await window.electronAPI.requestNotificationPermission()
  }
}

class BrowserNotificationStrategy implements NotificationStrategy {
  async show(title: string, body: string): Promise<void> {
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        new Notification(title, { body })
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (Notification.permission === 'granted') return true
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }
}

// ========== 托盘策略接口 ==========

export interface TrayActionStrategy {
  onAction(callback: (action: string) => void): () => void
}

class ElectronTrayActionStrategy implements TrayActionStrategy {
  onAction(callback: (action: string) => void): () => void {
    if (!window.electronAPI?.onTrayAction) {
      return () => {}
    }
    return window.electronAPI.onTrayAction(callback)
  }
}

class NoopTrayActionStrategy implements TrayActionStrategy {
  onAction(_callback: (action: string) => void): () => void {
    return () => {}
  }
}

export interface TraySyncStrategy {
  update(text: string, menuState: string): void
}

class ElectronTraySyncStrategy implements TraySyncStrategy {
  update(text: string, menuState: string): void {
    if (!window.electronAPI?.updateTrayText) return
    window.electronAPI.updateTrayText(text)
    window.electronAPI.updateTrayMenu(menuState)
  }
}

class NoopTraySyncStrategy implements TraySyncStrategy {
  update(): void {
    // 浏览器模式无需操作
  }
}

// ========== 全屏遮罩策略接口 ==========

export interface FullScreenOverlayStrategy {
  show(config: { content: string; backgroundColor?: string }): Promise<void>
  close(): Promise<void>
  onAction(callback: (action: string) => void): () => void
}

class ElectronFullScreenOverlayStrategy implements FullScreenOverlayStrategy {
  async show(config: { content: string; backgroundColor?: string }): Promise<void> {
    if (!window.electronAPI?.fullscreenOverlay) {
      throw new Error('FullScreenOverlay API not available')
    }
    await window.electronAPI.fullscreenOverlay.show(config)
  }

  async close(): Promise<void> {
    if (!window.electronAPI?.fullscreenOverlay) return
    await window.electronAPI.fullscreenOverlay.close()
  }

  onAction(callback: (action: string) => void): () => void {
    if (!window.electronAPI?.fullscreenOverlay) {
      return () => {}
    }
    return window.electronAPI.fullscreenOverlay.onAction(callback)
  }
}

class NoopFullScreenOverlayStrategy implements FullScreenOverlayStrategy {
  async show(): Promise<void> {
    console.warn('FullScreenOverlay not available in browser mode')
  }

  async close(): Promise<void> {
    // 浏览器模式无需操作
  }

  onAction(): () => void {
    return () => {}
  }
}

// ========== 开机自启策略接口 ==========

export interface AutoLaunchStrategy {
  getStatus(): Promise<{ success: boolean; enabled?: boolean; error?: string }>
  setEnabled(enabled: boolean): Promise<{ success: boolean; enabled?: boolean; error?: string }>
}

class ElectronAutoLaunchStrategy implements AutoLaunchStrategy {
  async getStatus(): Promise<{ success: boolean; enabled?: boolean; error?: string }> {
    return await window.electronAPI.getAutoLaunchStatus()
  }

  async setEnabled(enabled: boolean): Promise<{ success: boolean; enabled?: boolean; error?: string }> {
    return await window.electronAPI.setAutoLaunch(enabled)
  }
}

class NoopAutoLaunchStrategy implements AutoLaunchStrategy {
  async getStatus(): Promise<{ success: boolean; enabled?: boolean; error?: string }> {
    return { success: true, enabled: false }
  }

  async setEnabled(): Promise<{ success: boolean; enabled?: boolean; error?: string }> {
    return { success: true, enabled: false }
  }
}

// ========== 工厂方法 ==========

function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI
}

export function createNotificationStrategy(): NotificationStrategy {
  return isElectron() ? new ElectronNotificationStrategy() : new BrowserNotificationStrategy()
}

export function createTrayActionStrategy(): TrayActionStrategy {
  return isElectron() ? new ElectronTrayActionStrategy() : new NoopTrayActionStrategy()
}

export function createTraySyncStrategy(): TraySyncStrategy {
  return isElectron() ? new ElectronTraySyncStrategy() : new NoopTraySyncStrategy()
}

export function createFullScreenOverlayStrategy(): FullScreenOverlayStrategy {
  return isElectron() ? new ElectronFullScreenOverlayStrategy() : new NoopFullScreenOverlayStrategy()
}

export function createAutoLaunchStrategy(): AutoLaunchStrategy {
  return isElectron() ? new ElectronAutoLaunchStrategy() : new NoopAutoLaunchStrategy()
}
