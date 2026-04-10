/**
 * useFullScreenOverlay - 通用全屏遮罩 Hook
 *
 * 使用策略模式自动适配 Electron 和浏览器环境
 * - Electron 模式：使用原生全屏遮罩
 * - 浏览器模式：降级为 no-op（不显示）
 *
 * 提供统一的接口来显示自定义内容的全屏遮罩
 * 自动处理 'closed' 动作
 */

import { useEffect } from 'react'
import { createFullScreenOverlayStrategy } from '@/utils/platform-strategies'

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
    try {
      const strategy = createFullScreenOverlayStrategy()
      await strategy.show(config)
    } catch (error) {
      console.error('FullScreenOverlay: 显示遮罩失败', error)
    }
  }

  /** 关闭遮罩 */
  const close = async () => {
    try {
      const strategy = createFullScreenOverlayStrategy()
      await strategy.close()
    } catch (error) {
      console.error('FullScreenOverlay: 关闭遮罩失败', error)
    }
  }

  /** 监听遮罩动作 */
  const onAction = (callback: (action: string) => void) => {
    const strategy = createFullScreenOverlayStrategy()
    return strategy.onAction(callback)
  }

  // 自动处理 'closed' 动作
  useEffect(() => {
    const cleanup = onAction((action: string) => {
      if (action === 'closed') {
        close()
      }
    })
    return cleanup
  }, [close, onAction])

  return {
    show,
    close,
    onAction,
  }
}
