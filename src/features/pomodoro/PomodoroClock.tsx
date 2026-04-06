import { useState } from 'react'
import { useStore } from '../../store/store'
import { ChevronRight, Repeat, Target, Coffee, Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { ItemSelectorDialog } from '../../components/ItemSelectorDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import TaskCompleteModal from './TaskCompleteModal'
import HydrationPrompt from './HydrationPrompt'

const PomodoroClock = () => {
  const {
    timeLeft,
    tasks = [],
    currentTaskId,
    setCurrentTask,
    setPomodoroType,
    showBreakPrompt,
    setShowBreakPrompt,
    shortBreakTime,
    longBreakTime,
    isRunning,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    stopPomodoro,
    pomodoroType,
    finishEarlyPomodoro,
    completeTask,
    showHydrationPrompt,
    setShowHydrationPrompt,
    acknowledgeHydration,
    showPomodoroPotatoConflict,
    resolvePomodoroPotatoConflict,
  } = useStore()

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(Math.abs(seconds) / 60)
    const secs = Math.abs(seconds) % 60
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    return seconds < 0 ? `+${timeStr}` : timeStr
  }

  const currentTask = tasks.find(t => t.id === currentTaskId)
  const activeTasks = tasks.filter(t => !t.isCompleted && t.type === 'task')

  const handleTaskSwitch = (taskId: string) => {
    setCurrentTask(taskId === currentTaskId ? null : taskId)
    setShowTaskModal(false)
  }

  const handleStartBreak = (type: 'shortBreak' | 'longBreak') => {
    setPomodoroType(type)
    setShowBreakPrompt(null)
  }

  const handleEarlyFinish = () => {
    stopPomodoro()
    finishEarlyPomodoro()
    setShowBreakPrompt('shortBreak')
  }

  const handleTaskComplete = () => {
    if (currentTaskId) {
      completeTask(currentTaskId)
    }
    setShowTaskCompleteModal(false)
  }

  const handleTaskNotComplete = () => {
    setShowTaskCompleteModal(false)
  }

  const handleHydrationYes = () => {
    acknowledgeHydration()
  }

  const handleHydrationNo = () => {
    setShowHydrationPrompt(false)
  }

  const taskItems = activeTasks.map(task => ({
    id: task.id,
    label: task.title,
    badges: [
      task.isRecurring && (
        <span key="recurring" className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5">
          <Repeat className="w-3 h-3" />
          循环
        </span>
      ),
    ].filter(Boolean),
  }))

  return (
    <div className="space-y-8">
      {/* 计时器显示 */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="pb-8">
          <div
            className="text-8xl font-semibold tracking-tight mb-4 font-mono text-white"
            style={{
              fontVariantNumeric: 'tabular-nums',
              textShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            {formatTime(timeLeft)}
          </div>

          {currentTask && (
            <div className="relative">
              <div
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white cursor-pointer transition-colors text-sm font-medium"
                onClick={() => setShowTaskModal(true)}
              >
                <Target className="w-4 h-4" />
                <span>{currentTask.title}</span>
                <ChevronRight className="w-4 h-4" />
              </div>

              <ItemSelectorDialog
                open={showTaskModal}
                onOpenChange={setShowTaskModal}
                title="选择任务"
                items={taskItems}
                selectedId={currentTaskId}
                onSelect={handleTaskSwitch}
                emptyMessage="暂无可用任务"
                activeClassName="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              />
            </div>
          )}
        </div>

        {/* 休息提示弹窗 */}
        {showBreakPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
                <Coffee className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
                番茄钟完成！
              </h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                是时候休息一下了，选择休息时长：
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleStartBreak('shortBreak')}
                  className="flex-1 h-11 rounded-xl bg-[#38858a] hover:bg-[#2f7478] text-white font-medium"
                >
                  短休息 ({shortBreakTime}分钟)
                </Button>
                <Button
                  onClick={() => handleStartBreak('longBreak')}
                  className="flex-1 h-11 rounded-xl bg-[#2f6a95] hover:bg-[#285d82] text-white font-medium"
                >
                  长休息 ({longBreakTime}分钟)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center gap-3">
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

        <button
          onClick={resetPomodoro}
          className="px-8 h-11 text-base font-medium rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-200 flex items-center backdrop-blur-sm"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </button>

        {isRunning && pomodoroType === 'pomodoro' && (
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

      {/* 弹窗 */}
      <TaskCompleteModal
        open={showTaskCompleteModal}
        onTaskComplete={handleTaskComplete}
        onTaskNotComplete={handleTaskNotComplete}
        taskTitle={currentTask?.title || ''}
      />

      <HydrationPrompt
        open={showHydrationPrompt}
        onYes={handleHydrationYes}
        onNo={handleHydrationNo}
      />
    </div>
  )
}

export default PomodoroClock
