import { useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useRuntimeStore } from '@/store/runtimeStore'
import { TimerButton } from '@/components/common/TimerButton'

interface PomodoroControlsProps {
  onEarlyFinish: () => void
}

export const PomodoroControls = ({ onEarlyFinish }: PomodoroControlsProps) => {
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const pomodoroType = useRuntimeStore.use.pomodoroType()
  const startPomodoro = useRuntimeStore.use.startPomodoro()
  const pausePomodoro = useRuntimeStore.use.pausePomodoro()
  const resetPomodoro = useRuntimeStore.use.resetPomodoro()

  return (
    <div className="flex justify-center gap-3">
      {!isPomodoroRunning ? (
        <TimerButton icon={Play} label="开始" onClick={startPomodoro} />
      ) : (
        <TimerButton icon={Pause} label="暂停" onClick={pausePomodoro} />
      )}

      <button
        onClick={resetPomodoro}
        className="px-8 h-11 text-base font-medium rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-200 flex items-center backdrop-blur-sm"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        重置
      </button>

      {isPomodoroRunning && pomodoroType === 'pomodoro' && (
        <EarlyFinishConfirm onConfirm={onEarlyFinish} />
      )}
    </div>
  )
}

const EarlyFinishConfirm = ({ onConfirm }: { onConfirm: () => void }) => {
  const { showConfirm, setShowConfirm } = useEarlyFinishState()

  return (
    <Popover open={showConfirm} onOpenChange={setShowConfirm}>
      <PopoverTrigger asChild>
        <TimerButton icon={SkipForward} label="提前结束" onClick={() => setShowConfirm(true)} />
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

const useEarlyFinishState = () => {
  const [showConfirm, setShowConfirm] = useState(false)
  return { showConfirm, setShowConfirm }
}
