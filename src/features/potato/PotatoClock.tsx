import { useState } from 'react'
import { useStore } from '../../store/store'
import { Play, Pause, ChevronRight, Repeat, Gamepad2 } from 'lucide-react'
import { ItemSelectorDialog } from '@/components/ItemSelectorDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'

const PotatoClock = () => {
  const {
    potatoTimeLeft,
    isPotatoRunning,
    pausePotato,
    tasks = [],
    currentEntertainmentId,
    setCurrentEntertainment,
    showPomodoroPotatoConflict,
    resolvePomodoroPotatoConflict,
  } = useStore()

  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false)
  const [showEntertainmentModal, setShowEntertainmentModal] = useState(false)

  const formatTime = (seconds: number): string => {
    const isOvertime = seconds < 0
    const absSeconds = Math.abs(seconds)
    const mins = Math.floor(absSeconds / 60)
    const secs = absSeconds % 60
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    return isOvertime ? `+${timeStr}` : timeStr
  }

  const currentEntertainment = tasks.find(t => t.id === currentEntertainmentId && t.type === 'entertainment')
  const entertainmentTasks = tasks.filter(t => !t.isCompleted && t.type === 'entertainment')

  const handleEntertainmentSwitch = (taskId: string) => {
    setCurrentEntertainment(taskId === currentEntertainmentId ? null : taskId)
    setShowEntertainmentModal(false)
  }

  const handleStartPotato = () => {
    if (potatoTimeLeft < 0) {
      setShowOvertimeWarning(true)
    } else {
      const { startPotato } = useStore.getState()
      startPotato()
    }
  }

  const confirmOvertimeStart = () => {
    useStore.getState().startPotato()
    setShowOvertimeWarning(false)
  }

  const isOvertime = potatoTimeLeft < 0

  const entertainmentItems = entertainmentTasks.map(task => ({
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <div className="pb-8">
        <div className={`text-8xl font-mono font-bold mb-4 ${isOvertime ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(potatoTimeLeft)}
        </div>

        <div className="mb-6 relative">
          {currentEntertainment ? (
            <div
              className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer transition-colors text-sm font-medium"
              onClick={() => setShowEntertainmentModal(true)}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>{currentEntertainment.title}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          ) : (
            <button
              className="inline-flex items-center gap-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors text-sm font-medium"
              onClick={() => setShowEntertainmentModal(true)}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>选择娱乐项目</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <ItemSelectorDialog
            open={showEntertainmentModal}
            onOpenChange={setShowEntertainmentModal}
            title="选择娱乐项目"
            items={entertainmentItems}
            selectedId={currentEntertainmentId}
            onSelect={handleEntertainmentSwitch}
            emptyMessage="暂无可用娱乐项目"
            activeClassName="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
          />
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center gap-3">
          {!isPotatoRunning ? (
            <button
              onClick={handleStartPotato}
              className="px-10 h-11 text-base font-medium rounded-xl border border-gray-900/30 text-gray-900 hover:bg-gray-900/10 transition-all duration-200 flex items-center backdrop-blur-sm"
            >
              <Play className="w-4 h-4 mr-2" />
              开始
            </button>
          ) : (
            <button
              onClick={pausePotato}
              className="px-10 h-11 text-base font-medium rounded-xl border border-gray-900/30 text-gray-900 hover:bg-gray-900/10 transition-all duration-200 flex items-center backdrop-blur-sm"
            >
              <Pause className="w-4 h-4 mr-2" />
              暂停
            </button>
          )}
        </div>
      </div>

      {/* 冲突提示：番茄钟正在运行 */}
      <ConfirmDialog
        open={showPomodoroPotatoConflict === 'potato'}
        onClose={() => resolvePomodoroPotatoConflict('pomodoro')}
        title="番茄钟正在运行"
        message="当前番茄钟（专注时间）正在进行中，确定要停止它并开始娱乐时间吗？"
        confirmLabel="停止并开始"
        cancelLabel="取消"
        onConfirm={() => resolvePomodoroPotatoConflict('potato')}
        confirmClassName="bg-[#FADFA1] text-gray-900 hover:bg-[#e5cc8a] font-medium"
      />

      {/* 超时提示：再次开始时提醒 */}
      <ConfirmDialog
        open={showOvertimeWarning}
        onClose={() => setShowOvertimeWarning(false)}
        title="娱乐时间已超出"
        message="您的娱乐时间已超过限制。确定要继续娱乐吗？建议回去专注工作！"
        confirmLabel="继续娱乐"
        cancelLabel="取消"
        onConfirm={confirmOvertimeStart}
        confirmClassName="bg-[#FADFA1] text-gray-900 hover:bg-[#e5cc8a] font-medium"
      />
    </div>
  )
}

export default PotatoClock
