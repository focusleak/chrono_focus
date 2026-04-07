import { useEffect, useRef, useState } from 'react'
import { useOverlay, type RestReminderConfig, type QuizConfig } from '../hooks/useOverlay'
import { CheckCircle, XCircle, X } from 'lucide-react'

/**
 * 浏览器降级全屏遮罩组件
 * 当 Electron API 不可用时，使用 React 组件渲染全屏遮罩
 */
export function BrowserOverlay() {
  const {
    browserOverlayVisible,
    browserRestConfig,
    browserQuizConfig,
    close,
    onContinueWorkRef,
    onSkipRef,
    onQuizCorrectRef,
    onQuizCloseRef,
  } = useOverlay()

  const [timeLeft, setTimeLeft] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [answerInput, setAnswerInput] = useState('')
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 休息提醒倒计时
  useEffect(() => {
    if (browserOverlayVisible && browserRestConfig && !browserQuizConfig) {
      setTimeLeft(browserRestConfig.timeLeft)
    }
  }, [browserOverlayVisible, browserRestConfig, browserQuizConfig])

  useEffect(() => {
    if (browserOverlayVisible && browserRestConfig && !browserQuizConfig && timeLeft > 0) {
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
  }, [browserOverlayVisible, browserQuizConfig, timeLeft])

  // 聚焦输入框
  useEffect(() => {
    if (browserQuizConfig) {
      inputRef.current?.focus()
    }
  }, [browserQuizConfig])

  if (!browserOverlayVisible) return null

  // 答题界面
  if (browserQuizConfig) {
    const correctAnswer = browserQuizConfig.num1 * browserQuizConfig.num2

    const handleSubmit = () => {
      if (!answerInput.trim()) return
      const userAnswer = parseInt(answerInput.trim(), 10)
      const isCorrect = userAnswer === correctAnswer

      if (isCorrect) {
        setQuizResult('correct')
        setTimeout(() => {
          onQuizCorrectRef.current?.()
          close()
        }, 1000)
      } else {
        setQuizResult('wrong')
        setTimeout(() => setQuizResult(null), 1500)
      }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl p-10 max-w-sm w-full mx-4 text-center relative">
          <button
            onClick={() => {
              setAnswerInput('')
              setQuizResult(null)
              onQuizCloseRef.current?.()
              close()
            }}
            className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">×</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">请回答</h2>
          <div className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-8">
            {browserQuizConfig.num1} × {browserQuizConfig.num2} = ?
          </div>

          <div className="mb-4">
            <input
              ref={inputRef}
              type="number"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              disabled={quizResult !== null}
              placeholder="输入答案后按回车提交"
              className="w-full h-14 px-4 text-2xl font-mono text-center rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-[#2c2c2e] focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          {quizResult === 'correct' && (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">回答正确！</span>
            </div>
          )}
          {quizResult === 'wrong' && (
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 text-red-500 mb-1">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">回答错误，请重试</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={quizResult === 'wrong'}
            className="w-full px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium transition-colors"
          >
            提交答案
          </button>
        </div>
      </div>
    )
  }

  // 休息提醒界面
  if (browserRestConfig) {
    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
    }

    const progress = browserRestConfig.breakDuration > 0
      ? ((browserRestConfig.breakDuration - timeLeft) / browserRestConfig.breakDuration) * 100
      : 0

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 dark:text-orange-400">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
                <line x1="6" x2="6" y1="2" y2="4"/>
                <line x1="10" x2="10" y1="2" y2="4"/>
                <line x1="14" x2="14" y1="2" y2="4"/>
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {browserRestConfig.isLongBreak ? '长休息提醒' : '休息提醒'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {browserRestConfig.isLongBreak ? '已经连续短休多次，本次为长休息' : '你已经工作了一段时间，记得休息一下哦'}
          </p>
          {browserRestConfig.isSkipped && (
            <p className="text-xs text-amber-500 dark:text-amber-400 mb-4 font-medium">
              已跳过 {browserRestConfig.skipCount} 次，1 分钟后再次提醒
            </p>
          )}

          <div className="mb-8">
            <div
              className="text-5xl font-semibold font-mono text-gray-900 dark:text-gray-100 mb-2"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatTime(timeLeft)}
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">倒计时结束后自动关闭</p>
          </div>

          <button
            onClick={() => onSkipRef.current?.()}
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2c2c2e] hover:bg-gray-200 dark:hover:bg-[#3a3a3c] transition-colors"
          >
            跳过
          </button>
        </div>
      </div>
    )
  }

  return null
}
