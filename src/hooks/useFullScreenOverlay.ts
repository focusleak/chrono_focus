/**
 * useFullScreenOverlay - 通用 Electron 全屏遮罩 Hook
 * 
 * 仅支持 Electron 模式
 * 提供统一的接口来显示自定义内容的全屏遮罩
 */

interface FullScreenConfig {
  /** HTML 内容 */
  content: string
  /** 背景色，默认 rgba(0,0,0,0.7) */
  backgroundColor?: string
}

interface UseFullScreenOverlayReturn {
  /** 显示全屏遮罩 */
  show: (config: FullScreenConfig) => Promise<void>
  /** 关闭遮罩 */
  close: () => Promise<void>
  /** 监听遮罩动作 */
  onAction: (callback: (action: string) => void) => () => void
}

export function useFullScreenOverlay(): UseFullScreenOverlayReturn {
  /** 显示全屏遮罩 */
  const show = async (config: FullScreenConfig) => {
    if (typeof window === 'undefined' || !window.electronAPI?.fullscreenOverlay) {
      console.warn('FullScreenOverlay: Electron API 不可用')
      return
    }

    try {
      await window.electronAPI.fullscreenOverlay.show(config)
    } catch (error) {
      console.error('FullScreenOverlay: 显示遮罩失败', error)
    }
  }

  /** 关闭遮罩 */
  const close = async () => {
    if (typeof window === 'undefined' || !window.electronAPI?.fullscreenOverlay) {
      return
    }

    try {
      await window.electronAPI.fullscreenOverlay.close()
    } catch (error) {
      console.error('FullScreenOverlay: 关闭遮罩失败', error)
    }
  }

  /** 监听遮罩动作 */
  const onAction = (callback: (action: string) => void) => {
    if (typeof window === 'undefined' || !window.electronAPI?.fullscreenOverlay) {
      return () => {}
    }

    return window.electronAPI.fullscreenOverlay.onAction(callback)
  }

  return {
    show,
    close,
    onAction,
  }
}
