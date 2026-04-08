import { ConfirmDialog } from '@/components/common/ConfirmDialog'

import { formatDuration } from '@/lib/utils'

import { Target, Coffee } from 'lucide-react'
import { ItemSelector } from '@/components/common/ItemSelector'
import { useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useRuntimeStore } from '@/store/runtimeStore'
import { TimerButton } from '@/components/common/TimerButton'
import { PomodoroStatus } from '@/types'


import type { Task } from '@/types'

const PomodoroClock = () => {
  const pomodoroTimeLeft = useRuntimeStore.use.pomodoroTimeLeft()
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()


  const stopPomodoro = useRuntimeStore.use.stopPomodoro()
  const finishEarlyPomodoro = useRuntimeStore.use.finishEarlyPomodoro()
  const showPomodoroPotatoConflict = useRuntimeStore.use.showPomodoroPotatoConflict()
  const resolvePomodoroPotatoConflict = useRuntimeStore.use.resolvePomodoroPotatoConflict()

  const startPomodoro = useRuntimeStore.use.startPomodoro()
  const pausePomodoro = useRuntimeStore.use.pausePomodoro()
  const resetPomodoro = useRuntimeStore.use.resetPomodoro()

  const tasks = useRuntimeStore.use.tasks()
  const currentPomodoroTaskId = useRuntimeStore.use.currentPomodoroTaskId()
  const setCurrentPomodoroTask = useRuntimeStore.use.setCurrentPomodoroTask()

  const isBreak = pomodoroStatus === PomodoroStatus.ShortBreak || pomodoroStatus === PomodoroStatus.LongBreak

  const handleEarlyFinish = () => {
    stopPomodoro()
    finishEarlyPomodoro()
  }



  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      {/* 番茄钟时间 */}
      <div
        className="text-8xl font-semibold tracking-tight mb-6 font-mono text-white"
        style={{ fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
      >
        {formatDuration(pomodoroTimeLeft)}
      </div>

      {/* 中间 */}
      {isBreak ?
        <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
          <Coffee className="w-4 h-4" />
          <span>休息一下</span>
        </div> :
        <ItemSelector
          selectedId={currentPomodoroTaskId}
          items={tasks.filter((t: Task) => t.type === 'task')}
          onSelect={setCurrentPomodoroTask}
          icon={Target}
          dialogTitle="选择任务"
          placeholder="选择任务"
          emptyMessage="暂无可用任务"
          activeClassName="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          selectedClassName="text-white/80 hover:text-white"
          placeholderClassName="text-white/60 hover:text-white/80"
        />}

      {/* 按钮 */}
      <div className='flex justify-center gap-3 mt-10'>
        {!isPomodoroRunning ? (
          <TimerButton icon={Play} label="开始" onClick={startPomodoro} />
        ) : (
          <TimerButton icon={Pause} label="暂停" onClick={pausePomodoro} />
        )}
        <TimerButton icon={RotateCcw} label="重置" onClick={resetPomodoro} />


        {isPomodoroRunning && pomodoroStatus === PomodoroStatus.Pomodoro && (
          <EarlyFinishConfirm onConfirm={handleEarlyFinish} />
        )}
      </div>


      {/* 弹窗 */}
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


const EarlyFinishConfirm = ({ onConfirm }: { onConfirm: () => void }) => {
  const [showConfirm, setShowConfirm] = useState(false)

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


export default PomodoroClock
