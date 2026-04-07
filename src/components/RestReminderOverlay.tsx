import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/store'
import { format } from 'date-fns'
import { Coffee, Armchair, CheckCircle, XCircle, X } from 'lucide-react'

/**
 * 休息提醒全屏遮罩组件
 * 休息提醒倒计时到 0 后显示，全屏遮罩
 * 使用设置的短/长休息时长进行倒计时
 * 每 3 次短休息后自动安排 1 次长休息
 */
const RestReminderOverlay = () => {
  const {
    showRestReminderPrompt,
    showQuiz,
    quizNum1,
    quizNum2,
    quizResult,
    shortBreakTime,
    longBreakTime,
    restBreakCount,
    setShowRestReminderPrompt,
    resetRestReminder,
    generateQuiz,
    checkQuizAnswer,
    closeQuizAndRestReminder,
    nextRestBreak,
  } = useStore()

  // 判断本次是短休息还是长休息
  const isLongBreak = restBreakCount >= 3
  const breakDuration = (isLongBreak ? longBreakTime : shortBreakTime) * 60

  const [timeLeft, setTimeLeft] = useState(breakDuration)
  const [answerInput, setAnswerInput] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initializedRef = useRef(false)

  /** 格式化秒数为 MM:SS */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return format(new Date(0, 0, 0, 0, mins, secs), 'mm:ss')
  }

  // 弹窗首次显示时初始化倒计时
  useEffect(() => {
    if (showRestReminderPrompt && !showQuiz && !initializedRef.current) {
      initializedRef.current = true
      setTimeLeft(breakDuration)
    }
  }, [showRestReminderPrompt, showQuiz, breakDuration])

  // 重置初始化标记
  useEffect(() => {
    if (!showRestReminderPrompt) {
      initializedRef.current = false
    }
  }, [showRestReminderPrompt])

  // 当弹窗显示时，开始确认倒计时
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

  // 倒计时结束，自动关闭遮罩并重置
  useEffect(() => {
    if (showRestReminderPrompt && !showQuiz && timeLeft <= 0) {
      nextRestBreak()
      setShowRestReminderPrompt(false)
      resetRestReminder()
    }
  }, [showRestReminderPrompt, showQuiz, timeLeft, setShowRestReminderPrompt, resetRestReminder, nextRestBreak])

  // 答题正确时关闭遮罩
  useEffect(() => {
    if (quizResult === 'correct') {
      setTimeout(() => {
        nextRestBreak()
        closeQuizAndRestReminder()
      }, 1000)
    }
  }, [quizResult, closeQuizAndRestReminder, nextRestBreak])

  // 聚焦输入框
  useEffect(() => {
    if (showQuiz && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showQuiz])

  // 休息提醒倒计时未到 0，不显示
  if (!showRestReminderPrompt) return null

  const progress = breakDuration > 0 ? ((breakDuration - timeLeft) / breakDuration) * 100 : 0

  const handleSubmitAnswer = () => {
    if (!answerInput.trim()) return
    checkQuizAnswer(answerInput.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer()
    }
  }

  // 乘法题界面
  if (showQuiz) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl p-10 max-w-sm w-full mx-4 text-center relative">
          {/* 关闭按钮 */}
          <button
            onClick={() => {
              setAnswerInput('')
              useStore.setState({ showQuiz: false, quizResult: null, userAnswer: null })
            }}
            className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 图标 */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">× </span>
            </div>
          </div>

          {/* 题目 */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            请回答
          </h2>
          <div className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-8">
            {quizNum1} × {quizNum2} = ?
          </div>

          {/* 输入框 */}
          <div className="mb-4">
            <input
              ref={inputRef}
              type="number"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={quizResult !== null}
              placeholder="输入答案后按回车提交"
              className="w-full h-14 px-4 text-2xl font-mono text-center rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-[#2c2c2e] focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          {/* 答题结果 */}
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
              <button
                onClick={() => {
                  setAnswerInput('')
                  useStore.setState({ quizResult: null })
                }}
                className="mt-2 px-6 py-3 text-base font-medium rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                重新答题
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 休息提醒主界面（倒计时）
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 text-center">
        {/* 图标 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Coffee className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        {/* 标题 */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {isLongBreak ? '长休息提醒' : '休息提醒'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {isLongBreak ? '已经连续短休多次，本次为长休息' : '你已经工作了一段时间，记得休息一下哦'}
        </p>

        {/* 休息倒计时 */}
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
          <p className="text-xs text-gray-400 dark:text-gray-500">
            倒计时结束后自动关闭
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={generateQuiz}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2c2c2e] hover:bg-gray-200 dark:hover:bg-[#3a3a3c] transition-colors"
          >
            <Armchair className="w-4 h-4" />
            继续工作
          </button>
        </div>
      </div>
    </div>
  )
}

export default RestReminderOverlay
