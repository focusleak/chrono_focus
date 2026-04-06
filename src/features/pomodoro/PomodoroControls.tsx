import { useState } from 'react'
import { useTimerStore } from '../../store/timerStore'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface PomodoroControlsProps {
  onEarlyFinish: () => void
}

const PomodoroControls = ({ onEarlyFinish }: PomodoroControlsProps) => {
  const {
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    stopTimer,
    timerType,
    showPomodoroPotatoConflict,
    resolvePomodoroPotatoConflict,
  } = useTimerStore()

  const [showConfirm, setShowConfirm] = useState(false)

  const handleStart = () => {
    startTimer()
  }

  const handleEarlyFinish = () => {
    stopTimer()
    onEarlyFinish()
  }

  return (
    <div className="flex justify-center gap-3">
      {!isRunning ? (
        <button
          onClick={handleStart}
          className="px-10 h-11 text-base font-medium rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-200 flex items-center backdrop-blur-sm"
        >
          <Play className="w-4 h-4 mr-2" />
          开始
        </button>
      ) : (
        <button
          onClick={pauseTimer}
          className="px-10 h-11 text-base font-medium rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-200 flex items-center backdrop-blur-sm"
        >
          <Pause className="w-4 h-4 mr-2" />
          暂停
        </button>
      )}

      <button
        onClick={resetTimer}
        className="px-8 h-11 text-base font-medium rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-200 flex items-center backdrop-blur-sm"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        重置
      </button>

      {isRunning && timerType === 'pomodoro' && (
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
                    handleEarlyFinish()
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* 冲突提示：土豆钟正在运行 */}
      <ConfirmDialog
        open={showPomodoroPotatoConflict === 'pomodoro'}
        onClose={() => resolvePomodoroPotatoConflict('potato')}
        title="土豆钟正在运行"
        message="当前土豆钟（娱乐时间）正在进行中，确定要停止它并开始番茄钟吗？"
        confirmLabel="停止并开始"
        cancelLabel="取消"
        onConfirm={() => resolvePomodoroPotatoConflict('pomodoro')}
        confirmClassName="bg-[#ba4949] text-white hover:bg-[#a83d3d] font-medium"
      />
    </div>
  )
}

export default PomodoroControls
