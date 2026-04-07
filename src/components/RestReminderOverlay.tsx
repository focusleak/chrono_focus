import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/store'
import { Coffee, Armchair } from 'lucide-react'
import { formatDuration } from '../lib/utils'
import { QuizDialog } from './QuizDialog'

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
    shortBreakTime,
    longBreakTime,
    restBreakCount,
    setShowRestReminderPrompt,
    resetRestReminder,
    generateQuiz,
    closeQuizAndRestReminder,
    nextRestBreak,
  } = useStore()

  // 判断本次是短休息还是长休息
  const isLongBreak = restBreakCount >= 3
  const breakDuration = (isLongBreak ? longBreakTime : shortBreakTime) * 60

  const [timeLeft, setTimeLeft] = useState(breakDuration)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const initializedRef = useRef(false)

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

  // 休息提醒倒计时未到 0，不显示
  if (!showRestReminderPrompt) return null

  const progress = breakDuration > 0 ? ((breakDuration - timeLeft) / breakDuration) * 100 : 0

  // 乘法题界面
  if (showQuiz) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <QuizDialog onClose={closeQuizAndRestReminder} />
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
            {formatDuration(timeLeft)}
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
