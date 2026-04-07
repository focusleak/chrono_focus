import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/store'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface QuizDialogProps {
  onClose: () => void
}

/**
 * 乘法答题弹窗组件
 * 用户必须答对才能继续
 */
export const QuizDialog = ({ onClose }: QuizDialogProps) => {
  const {
    quizNum1,
    quizNum2,
    quizResult,
    checkQuizAnswer,
  } = useStore()

  const [answerInput, setAnswerInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // 答题正确时自动关闭
  useEffect(() => {
    if (quizResult === 'correct') {
      const timer = setTimeout(onClose, 1000)
      return () => clearTimeout(timer)
    }
  }, [quizResult, onClose])

  const handleSubmit = () => {
    if (!answerInput.trim()) return
    checkQuizAnswer(answerInput.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl p-10 max-w-sm w-full mx-4 text-center relative">
      {/* 关闭按钮 */}
      <button
        onClick={() => {
          setAnswerInput('')
          useStore.setState({ quizResult: null, userAnswer: null })
          onClose()
        }}
        className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* 图标 */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">×</span>
        </div>
      </div>

      {/* 题目 */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">请回答</h2>
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
  )
}
