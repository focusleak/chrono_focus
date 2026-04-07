import { useOverlay } from '../hooks/useOverlay'

interface ElectronOverlayProps {
  children?: React.ReactNode
}

/**
 * Electron 全屏遮罩组件
 * 这是一个可选组件，提供更友好的 API
 */
export function ElectronOverlay({ children }: ElectronOverlayProps) {
  const { isOpen, show, hide } = useOverlay()

  // 将方法暴露到 window 供全局使用
  if (typeof window !== 'undefined') {
    ;(window as any).__overlayAPI = { isOpen, show, hide }
  }

  return children ? <>{children}</> : null
}

// 导出 Hook 方便直接使用
export { useOverlay }
