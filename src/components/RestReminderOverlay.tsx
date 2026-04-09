import { useEffect, useRef, useState, useMemo, useCallback } from 'react'

import { useFullScreenOverlay } from '@/hooks/useFullScreenOverlay'

import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'

/**
 * 休息提醒全屏遮罩组件
 * 使用通用 FullScreenOverlay 组件
 * 休息提醒倒计时到 0 后显示
 * 弹出后暂停所有计时，关闭后恢复
 */
const RestReminderOverlay = () => {
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()
  const restReminderSkipped = useRuntimeStore.use.restReminderSkipped()
  const restReminderSkipCount = useRuntimeStore.use.restReminderSkipCount()
  const setShowRestReminderPrompt = useRuntimeStore.use.setShowRestReminderPrompt()
  const nextRestBreak = useRuntimeStore.use.nextRestBreak()
  const skipRestReminder = useRuntimeStore.use.skipRestReminder()
  const resumeTimersAfterOverlay = useRuntimeStore.use.resumeTimersAfterOverlay()
  const restBreakDuration = useSettingsStore.use.restBreakDuration()

  const { show, close, onAction } = useFullScreenOverlay()

  const breakDuration = restBreakDuration * 60

  const [timeLeft, setTimeLeft] = useState(breakDuration)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const initializedRef = useRef(false)
  const overlayShownRef = useRef(false)

  // Quiz 内部状态
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizNum1, setQuizNum1] = useState(0)
  const [quizNum2, setQuizNum2] = useState(0)

  // 生成乘法题目
  const generateQuiz = useCallback(() => {
    const num1 = Math.floor(Math.random() * 90) + 10
    const num2 = Math.floor(Math.random() * 90) + 10
    setQuizNum1(num1)
    setQuizNum2(num2)
    setShowQuiz(true)
  }, [])

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
      setShowQuiz(false)
    }
  }, [showRestReminderPrompt])

  // 生成休息提醒 HTML 内容
  const restOverlayContent = useMemo(() => {
    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
    }

    const isLongBreak = false
    const skipInfo = restReminderSkipped ? `<p style="font-size: 12px; color: #fbbf24; margin-bottom: 24px; font-weight: 500;">已跳过 ${restReminderSkipCount || 0} 次</p>` : ''

    return `
      <div style="text-align: center; max-width: 448px; padding: 40px; background: rgba(255,255,255,0.95); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: #fed7aa; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
            <line x1="6" x2="6" y1="2" y2="4"/>
            <line x1="10" x2="10" y1="2" y2="4"/>
            <line x1="14" x2="14" y1="2" y2="4"/>
          </svg>
        </div>
        <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 8px;">${isLongBreak ? '长休息提醒' : '休息提醒'}</h2>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">${isLongBreak ? '已经连续短休多次，本次为长休息' : '你已经工作了一段时间，记得休息一下哦'}</p>
        ${skipInfo}
        <div id="timerDisplay" style="font-size: 48px; font-weight: 600; font-family: monospace; color: #111827; margin-bottom: 8px; font-variant-numeric: tabular-nums;">
          ${formatTime(timeLeft)}
        </div>
        <p style="font-size: 12px; color: #9ca3af; margin-bottom: 32px;">倒计时结束后自动关闭</p>
        <button id="skipBtn" style="width: 100%; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; background: #f3f4f6; color: #374151;">
          跳过
        </button>
      </div>
      <script>
        window.__intervals = window.__intervals || []
        let currentTime = ${timeLeft}

        const timerEl = document.getElementById('timerDisplay')
        const skipBtn = document.getElementById('skipBtn')

        function formatTimeStr(seconds) {
          const m = Math.floor(seconds / 60)
          const s = seconds % 60
          return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
        }

        const interval = setInterval(() => {
          if (currentTime > 0) {
            currentTime--
            timerEl.textContent = formatTimeStr(currentTime)
          } else {
            clearInterval(interval)
            window.overlayAPI?.close()
            window.overlayAPI?.notify('closed')
          }
        }, 1000)

        window.__intervals.push(interval)

        skipBtn.addEventListener('click', () => {
          skipBtn.disabled = true
          window.overlayAPI?.close()
          window.overlayAPI?.notify('skip')
        })
      </script>
    `
  }, [timeLeft, restReminderSkipped, restReminderSkipCount])

  // 生成答题 HTML 内容
  const quizOverlayContent = useMemo(() => {
    const correctAnswer = quizNum1 * quizNum2

    return `
      <div style="text-align: center; max-width: 384px; padding: 40px; background: rgba(255,255,255,0.95); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); position: relative;">
        <button id="closeBtn" style="position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; cursor: pointer; color: #9ca3af; font-size: 20px;">
          ✕
        </button>
        <div style="width: 64px; height: 64px; border-radius: 50%; background: #dbeafe; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
          <span style="font-size: 32px; font-weight: bold; color: #2563eb;">×</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 24px;">请回答</h2>
        <div style="font-size: 36px; font-weight: bold; font-family: monospace; color: #111827; margin-bottom: 32px;">
          ${quizNum1} × ${quizNum2} = ?
        </div>
        <input id="answerInput" type="number" style="width: 100%; height: 56px; padding: 0 16px; font-size: 24px; text-align: center; border-radius: 12px; border: 2px solid #d1d5db; background: #ffffff; color: #111827; outline: none; margin-bottom: 16px;" placeholder="输入答案后按回车提交" />
        <div id="resultArea" style="margin-bottom: 16px; min-height: 24px;"></div>
        <button id="submitBtn" style="width: 100%; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; background: #3b82f6; color: white;">
          提交答案
        </button>
      </div>
      <script>
        const correctAnswer = ${correctAnswer}
        const inputEl = document.getElementById('answerInput')
        const submitBtn = document.getElementById('submitBtn')
        const resultArea = document.getElementById('resultArea')
        const closeBtn = document.getElementById('closeBtn')

        inputEl.focus()

        function submitAnswer() {
          const val = inputEl.value.trim()
          if (!val) return

          const userAnswer = parseInt(val, 10)
          const isCorrect = userAnswer === correctAnswer

          inputEl.disabled = true
          submitBtn.disabled = true

          if (isCorrect) {
            resultArea.innerHTML = '<div style="color: #16a34a; font-size: 14px; font-weight: 500;">✓ 回答正确！</div>'
            setTimeout(() => {
              window.overlayAPI?.notify('quizCorrect')
            }, 1000)
          } else {
            resultArea.innerHTML = '<div style="color: #dc2626; font-size: 14px; font-weight: 500;">✗ 回答错误，请重试</div>'
            inputEl.disabled = false
            inputEl.value = ''
            inputEl.focus()
            submitBtn.disabled = false
          }
        }

        submitBtn.addEventListener('click', () => {
          submitAnswer()
        })

        inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submitAnswer()
          }
        })

        closeBtn.addEventListener('click', () => {
          window.overlayAPI?.close()
          window.overlayAPI?.notify('quizClose')
        })
      </script>
    `
  }, [quizNum1, quizNum2, showQuiz])

  // 监听 FullScreenOverlay 动作事件
  useEffect(() => {
    const handleAction = (action: string) => {
      switch (action) {
        case 'skip':
          close()
          skipRestReminder()
          setShowRestReminderPrompt(false)
          break
        case 'continueWork':
          generateQuiz()
          break
        case 'quizCorrect':
          close()
          nextRestBreak()
          resumeTimersAfterOverlay()
          setShowRestReminderPrompt(false)
          setShowQuiz(false)
          break
        case 'quizClose':
          close()
          setShowRestReminderPrompt(false)
          resumeTimersAfterOverlay()
          setShowQuiz(false)
          break
        case 'closed':
          setShowQuiz(false)
          setShowRestReminderPrompt(false)
          resumeTimersAfterOverlay()
          break
      }
    }

    // 注册事件监听
    const cleanup = onAction(handleAction)
    return cleanup
  }, [close, generateQuiz, nextRestBreak, onAction, resumeTimersAfterOverlay, setShowRestReminderPrompt, skipRestReminder])

  // 当弹窗显示且未显示遮罩时，显示休息提醒遮罩
  useEffect(() => {
    if (showRestReminderPrompt && !showQuiz && !overlayShownRef.current) {
      overlayShownRef.current = true

      show({
        content: restOverlayContent,
      })
    }
  }, [showRestReminderPrompt, showQuiz, restOverlayContent, show])

  // 当 showQuiz 变为 true 时，显示答题遮罩
  useEffect(() => {
    if (showQuiz) {
      show({
        content: quizOverlayContent,
      })
    }
  }, [showQuiz, quizOverlayContent, show])

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
      close()
      nextRestBreak()
      resumeTimersAfterOverlay()
    }
  }, [showRestReminderPrompt, showQuiz, timeLeft, close, nextRestBreak, resumeTimersAfterOverlay])

  // 不渲染任何 UI
  return null
}

export default RestReminderOverlay
