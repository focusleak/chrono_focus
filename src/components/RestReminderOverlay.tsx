import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/store'
import { useOverlay } from '../hooks/useOverlay'

/**
 * 休息提醒全屏遮罩组件
 * 使用 useOverlay hook（Electron 模式调用原生遮罩，浏览器模式降级为 React 组件）
 * 休息提醒倒计时到 0 后显示
 * 弹出后暂停所有计时，关闭后恢复
 */
const RestReminderOverlay = () => {
  const {
    showRestReminderPrompt,
    showQuiz,
    shortBreakTime,
    longBreakTime,
    restBreakCount,
    restReminderSkipped,
    restReminderSkipCount,
    setShowRestReminderPrompt,
    generateQuiz,
    nextRestBreak,
    skipRestReminder,
    resumeTimersAfterOverlay,
  } = useStore()

  const {
    showRestReminder,
    showQuiz: showQuizOverlay,
    close: closeOverlay,
  } = useOverlay()

  // 判断本次是短休息还是长休息
  const isLongBreak = restBreakCount >= 3
  const breakDuration = (isLongBreak ? longBreakTime : shortBreakTime) * 60

  const [timeLeft, setTimeLeft] = useState(breakDuration)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const initializedRef = useRef(false)
  const overlayShownRef = useRef(false)

  // 弹窗首次显示时初始化倒计时
  useEffect(() => {
    if (showRestReminderPrompt && !showQuiz && !initializedRef.current) {
      initializedRef.current = true
      overlayShownRef.current = false
      setTimeLeft(breakDuration)
    }
  }, [showRestReminderPrompt, showQuiz, breakDuration])

  // 重置初始化标记
  useEffect(() => {
    if (!showRestReminderPrompt) {
      initializedRef.current = false
      overlayShownRef.current = false
    }
  }, [showRestReminderPrompt])

  // 监听 Electron 遮罩窗口转发的动作事件
  useEffect(() => {
    const handleOverlayAction = (action: string) => {
      switch (action) {
        case 'skip':
          closeOverlay()
          skipRestReminder()
          setShowRestReminderPrompt(false)
          break
        case 'continueWork':
          generateQuiz()
          break
        case 'quizCorrect':
          closeOverlay()
          nextRestBreak()
          resumeTimersAfterOverlay()
          useStore.setState({ showQuiz: false, quizResult: null, userAnswer: null })
          break
        case 'quizClose':
          closeOverlay()
          useStore.setState({ showQuiz: false, quizResult: null, userAnswer: null })
          break
        case 'closed':
          // 遮罩窗口被关闭（从外部关闭）
          useStore.setState({ showQuiz: false, quizResult: null, userAnswer: null })
          setShowRestReminderPrompt(false)
          resumeTimersAfterOverlay()
          break
      }
    }

    if (window.electronAPI?.onOverlayAction) {
      window.electronAPI.onOverlayAction(handleOverlayAction)
    }
  }, [closeOverlay, generateQuiz, nextRestBreak, resumeTimersAfterOverlay, setShowRestReminderPrompt, skipRestReminder])

  // 当弹窗显示且未显示遮罩时，显示休息提醒遮罩
  useEffect(() => {
    if (showRestReminderPrompt && !showQuiz && !overlayShownRef.current) {
      overlayShownRef.current = true
      const progress = breakDuration > 0 ? ((breakDuration - timeLeft) / breakDuration) * 100 : 0

      showRestReminder(
        {
          isLongBreak,
          timeLeft,
          progress,
          breakDuration,
          isSkipped: restReminderSkipped,
          skipCount: restReminderSkipCount || 0,
        },
        {
          onContinueWork: () => generateQuiz(),
          onSkip: () => {
            closeOverlay()
            skipRestReminder()
            setShowRestReminderPrompt(false)
          },
          onQuizCorrect: () => {
            closeOverlay()
            nextRestBreak()
            resumeTimersAfterOverlay()
            useStore.setState({ showQuiz: false, quizResult: null, userAnswer: null })
          },
          onQuizClose: () => {
            closeOverlay()
            useStore.setState({ showQuiz: false, quizResult: null, userAnswer: null })
          },
        }
      )
    }
  }, [showRestReminderPrompt, showQuiz])

  // 当 showQuiz 变为 true 时，显示答题遮罩
  useEffect(() => {
    if (showQuiz) {
      const { quizNum1, quizNum2 } = useStore.getState()
      showQuizOverlay(
        { num1: quizNum1, num2: quizNum2 },
        {
          onQuizCorrect: () => {
            closeOverlay()
            nextRestBreak()
            resumeTimersAfterOverlay()
            useStore.setState({ showQuiz: false, quizResult: null, userAnswer: null })
          },
          onQuizClose: () => {
            closeOverlay()
            useStore.setState({ showQuiz: false, quizResult: null, userAnswer: null })
          },
        }
      )
    }
  }, [showQuiz])

  // 倒计时更新
  useEffect(() => {
    if (showRestReminderPrompt && !showQuiz && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [showRestReminderPrompt, showQuiz, timeLeft > 0])

  // 倒计时结束，自动关闭遮罩并恢复计时
  useEffect(() => {
    if (showRestReminderPrompt && !showQuiz && timeLeft <= 0) {
      closeOverlay()
      nextRestBreak()
      resumeTimersAfterOverlay()
    }
  }, [showRestReminderPrompt, showQuiz, timeLeft, nextRestBreak, resumeTimersAfterOverlay])

  // React 层不再渲染任何内容（浏览器降级由 BrowserOverlay 组件处理）
  return null
}

export default RestReminderOverlay
