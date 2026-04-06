import { useState } from 'react'
import { useTimerStore } from '../../store/timerStore'
import { formatTime } from '../../utils/helpers'
import { ChevronRight, Repeat, Zap, Target, Coffee } from 'lucide-react'
import { ItemSelectorDialog } from '@/components/ItemSelectorDialog'
import { Button } from '@/components/ui/button'

const PomodoroDisplay = () => {
  const { timeLeft, tasks = [], currentTaskId, setCurrentTask, setTimerType, showBreakPrompt, setShowBreakPrompt, shortBreakTime, longBreakTime } = useTimerStore()
  const [showTaskModal, setShowTaskModal] = useState(false)

  const currentTask = tasks.find(t => t.id === currentTaskId)
  const activeTasks = tasks.filter(t => !t.isCompleted && t.type === 'task')

  const handleTaskSwitch = (taskId: string) => {
    setCurrentTask(taskId === currentTaskId ? null : taskId)
    setShowTaskModal(false)
  }

  const handleStartBreak = (type: 'shortBreak' | 'longBreak') => {
    setTimerType(type)
    setShowBreakPrompt(null)
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
      task.isSimple && (
        <span key="simple" className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5">
          <Zap className="w-3 h-3" />
          免分解
        </span>
      ),
    ].filter(Boolean),
  }))

  return (
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
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
  )
}

export default PomodoroDisplay
