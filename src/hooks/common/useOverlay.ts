import { useEffect, useState, useCallback, useRef } from 'react'

export type OverlayType = 'default' | 'rest-reminder' | 'quiz'

export interface RestReminderConfig {
  isLongBreak: boolean
  timeLeft: number
  progress: number
  breakDuration: number
  isSkipped?: boolean
  skipCount?: number
}

export interface QuizConfig {
  num1: number
  num2: number
}

/**
 * 全屏遮罩 Hook
 * 提供显示和关闭 Electron 全屏遮罩的能力
 * 支持浏览器端降级为 React 组件渲染
 */
export function useOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [overlayType, setOverlayType] = useState<OverlayType>('default')
  const [error, setError] = useState<string | null>(null)

  // 浏览器降级模式：使用 React 状态控制渲染
  const [browserOverlayVisible, setBrowserOverlayVisible] = useState(false)
  const [browserRestConfig, setBrowserRestConfig] = useState<RestReminderConfig | null>(null)
  const [browserQuizConfig, setBrowserQuizConfig] = useState<QuizConfig | null>(null)

  // 回调引用
  const onContinueWorkRef = useRef<(() => void) | null>(null)
  const onSkipRef = useRef<(() => void) | null>(null)
  const onQuizCorrectRef = useRef<(() => void) | null>(null)
  const onQuizCloseRef = useRef<(() => void) | null>(null)

  // 监听遮罩关闭事件（Electron 模式）
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.onOverlayClosed(() => {
        setIsOpen(false)
        setOverlayType('default')
        setError(null)
        setBrowserOverlayVisible(false)
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
      setOverlayType('default')
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
      setOverlayType('default')
      setError(null)
      setBrowserOverlayVisible(false)
      return result
    } catch (err: any) {
      setError(err?.message || String(err))
      return false
    }
  }, [])

  // 显示休息提醒遮罩
  const showRestReminder = useCallback(async (config: RestReminderConfig, callbacks: {
    onContinueWork?: () => void
    onSkip?: () => void
    onQuizCorrect?: () => void
    onQuizClose?: () => void
  }) => {
    if (typeof window === 'undefined' || !window.electronAPI) {
      // 浏览器降级模式
      setBrowserOverlayVisible(true)
      setBrowserRestConfig(config)
      onContinueWorkRef.current = callbacks.onContinueWork || null
      onSkipRef.current = callbacks.onSkip || null
      onQuizCorrectRef.current = callbacks.onQuizCorrect || null
      onQuizCloseRef.current = callbacks.onQuizClose || null
      return true
    }

    try {
      // 设置全局回调供 Electron 遮罩调用
      ;(window as any).onContinueWork = callbacks.onContinueWork || null
      ;(window as any).onSkip = callbacks.onSkip || null
      ;(window as any).onQuizCorrect = callbacks.onQuizCorrect || null
      ;(window as any).onQuizClose = callbacks.onQuizClose || null

      const result = await window.electronAPI.showRestReminderOverlay(config)
      setIsOpen(true)
      setOverlayType('rest-reminder')
      return result
    } catch (err: any) {
      setError(err?.message || String(err))
      return false
    }
  }, [])

  // 显示答题遮罩
  const showQuiz = useCallback(async (config: QuizConfig, callbacks: {
    onQuizCorrect?: () => void
    onQuizClose?: () => void
  }) => {
    if (typeof window === 'undefined' || !window.electronAPI) {
      // 浏览器降级模式
      setBrowserOverlayVisible(true)
      setBrowserQuizConfig(config)
      onQuizCorrectRef.current = callbacks.onQuizCorrect || null
      onQuizCloseRef.current = callbacks.onQuizClose || null
      return true
    }

    try {
      ;(window as any).onQuizCorrect = callbacks.onQuizCorrect || null
      ;(window as any).onQuizClose = callbacks.onQuizClose || null

      const result = await window.electronAPI.showQuizOverlay(config)
      setIsOpen(true)
      setOverlayType('quiz')
      return result
    } catch (err: any) {
      setError(err?.message || String(err))
      return false
    }
  }, [])

  // 关闭遮罩
  const close = useCallback(async () => {
    // 清理全局回调
    delete (window as any).onContinueWork
    delete (window as any).onSkip
    delete (window as any).onQuizCorrect
    delete (window as any).onQuizClose
    onContinueWorkRef.current = null
    onSkipRef.current = null
    onQuizCorrectRef.current = null
    onQuizCloseRef.current = null

    if (typeof window === 'undefined' || !window.electronAPI) {
      // 浏览器降级模式
      setBrowserOverlayVisible(false)
      setBrowserRestConfig(null)
      setBrowserQuizConfig(null)
      setIsOpen(false)
      setOverlayType('default')
      return true
    }

    try {
      await window.electronAPI.closeOverlay()
      setIsOpen(false)
      setOverlayType('default')
      setBrowserOverlayVisible(false)
      setBrowserRestConfig(null)
      setBrowserQuizConfig(null)
      return true
    } catch (err: any) {
      setError(err?.message || String(err))
      return false
    }
  }, [])

  return {
    isOpen,
    overlayType,
    error,
    show,
    hide,
    close,
    showRestReminder,
    showQuiz,
    // 浏览器降级模式状态
    browserOverlayVisible,
    browserRestConfig,
    browserQuizConfig,
    // 浏览器回调引用
    onContinueWorkRef,
    onSkipRef,
    onQuizCorrectRef,
    onQuizCloseRef,
  }
}
