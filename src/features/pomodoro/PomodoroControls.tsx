import { useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useStore } from '../../store/store'

interface PomodoroControlsProps {
  onEarlyFinish: () => void
}

/**
 * 番茄钟控制按钮组件
 * 包含开始/暂停、重置、提前结束按钮
 */
export const PomodoroControls = ({ onEarlyFinish }: PomodoroControlsProps) => {
  const {
    isRunning,
    pomodoroType,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
  } = useStore()

  return (
    <div className="flex justify-center gap-3">
      {/* 开始/暂停按钮：根据运行状态切换 */}
      {!isRunning ? (
        <button
          onClick={startPomodoro}
          className="px-10 h-11 text-base font-medium rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-200 flex items-center backdrop-blur-sm"
        >
          <Play className="w-4 h-4 mr-2" />
          开始
        </button>
      ) : (
        <button
          onClick={pausePomodoro}
          className="px-10 h-11 text-base font-medium rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-200 flex items-center backdrop-blur-sm"
        >
          <Pause className="w-4 h-4 mr-2" />
          暂停
        </button>
      )}

      {/* 重置按钮：重置当前番茄钟 */}
      <button
        onClick={resetPomodoro}
        className="px-8 h-11 text-base font-medium rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-200 flex items-center backdrop-blur-sm"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        重置
      </button>

      {/* 提前结束按钮：仅在番茄钟运行中且为专注模式时显示 */}
      {isRunning && pomodoroType === 'pomodoro' && (
        <EarlyFinishConfirm onConfirm={onEarlyFinish} />
      )}
    </div>
  )
}

/**
 * 提前结束确认弹窗组件
 * 使用 Popover 实现，点击提前结束按钮后显示确认提示
 */
const EarlyFinishConfirm = ({ onConfirm }: { onConfirm: () => void }) => {
  const { showConfirm, setShowConfirm } = useEarlyFinishState()

  return (
    <Popover open={showConfirm} onOpenChange={setShowConfirm}>
      <PopoverTrigger asChild>
        <button
          className="px-8 h-11 text-base font-medium rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-200 flex items-center backdrop-blur-sm"
          onClick={() => setShowConfirm(true)}
        >
          <SkipForward className="w-4 h-4 mr-2" />
          提前结束
        </button>
      </PopoverTrigger>
      {/* 提前结束确认弹窗 */}
      <PopoverContent className="w-80 rounded-xl border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="space-y-3">
          <h4 className="font-semibold text-base">提前结束番茄钟</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">确定要提前结束当前的番茄钟吗？</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => {
                setShowConfirm(false)
                onConfirm()
              }}
              className="px-4 py-2 text-sm rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * 提前结束弹窗的状态管理 Hook
 */
const useEarlyFinishState = () => {
  const [showConfirm, setShowConfirm] = useState(false)
  return { showConfirm, setShowConfirm }
}
