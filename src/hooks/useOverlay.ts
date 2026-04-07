import { useEffect, useState, useCallback } from 'react'

/**
 * 全屏遮罩 Hook
 * 提供显示和关闭 Electron 全屏遮罩的能力
 */
export function useOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 监听遮罩关闭事件
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.onOverlayClosed(() => {
        setIsOpen(false)
        setError(null)
      })
    }
  }, [])

  const show = useCallback(async () => {
    if (typeof window === 'undefined' || !window.electronAPI) {
      setError('electronAPI 不可用')
      return false
    }

    try {
      setError(null)
      const result = await window.electronAPI.showFullscreenOverlay()
      setIsOpen(true)
      return result
    } catch (err: any) {
      setError(err?.message || String(err))
      return false
    }
  }, [])

  const hide = useCallback(async () => {
    if (typeof window === 'undefined' || !window.electronAPI) {
      setError('electronAPI 不可用')
      return false
    }

    try {
      const result = await window.electronAPI.closeFullscreenOverlay()
      setIsOpen(false)
      setError(null)
      return result
    } catch (err: any) {
      setError(err?.message || String(err))
      return false
    }
  }, [])

  return {
    isOpen,
    error,
    show,
    hide,
  }
}
