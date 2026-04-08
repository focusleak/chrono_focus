import { useRuntimeStore } from '@/store/runtimeStore'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatDuration } from '@/lib/utils'


import { Gamepad2 } from 'lucide-react'
import { ItemSelector } from '@/components/common/ItemSelector'
import { useState } from 'react'
import { Play, Pause } from 'lucide-react'

import { TimerButton } from '@/components/common/TimerButton'
import type { Task } from '@/types'
const PotatoClock = () => {
  const potatoTimeLeft = useRuntimeStore.use.potatoTimeLeft()
  const showPomodoroPotatoConflict = useRuntimeStore.use.showPomodoroPotatoConflict()
  const resolvePomodoroPotatoConflict = useRuntimeStore.use.resolvePomodoroPotatoConflict()
  const isOvertime = potatoTimeLeft < 0
  const tasks = useRuntimeStore.use.tasks()
  const currentPotatoTaskId = useRuntimeStore.use.currentPotatoTaskId()
  const setCurrentPotatoTask = useRuntimeStore.use.setCurrentPotatoTask()

  const isPotatoRunning = useRuntimeStore.use.isPotatoRunning()
  const pausePotato = useRuntimeStore.use.pausePotato()
  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false)

  const handleStartPotato = () => {
    if (potatoTimeLeft < 0) {
      setShowOvertimeWarning(true)
    } else {
      const { startPotato } = useRuntimeStore.getState()
      startPotato()
    }
  }

  const confirmOvertimeStart = () => {
    useRuntimeStore.getState().startPotato()
    setShowOvertimeWarning(false)
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">

      {/* 土豆钟时间 */}
      <div
        className={`text-8xl font-mono font-semibold mb-6 ${isOvertime ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}
        style={{ fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }} >
        {formatDuration(potatoTimeLeft)}
      </div>

      {/* 中间 */}
      <ItemSelector
        selectedId={currentPotatoTaskId}
        items={tasks.filter((t: Task) => t.type === 'entertainment')}
        onSelect={setCurrentPotatoTask}
        icon={Gamepad2}
        dialogTitle="选择娱乐项目"
        placeholder="选择娱乐项目"
        emptyMessage="暂无可用娱乐项目"
        activeClassName="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
        selectedClassName="text-gray-900 hover:text-gray-700"
        placeholderClassName="text-gray-500 hover:text-gray-400"

      />

      {/* 按钮 */}
      <div className="flex justify-center gap-3 mt-10">
        {!isPotatoRunning ? (
          <TimerButton
            icon={Play}
            label="开始"
            onClick={handleStartPotato}
            variant="dark"
          />
        ) : (
          <TimerButton
            icon={Pause}
            label="暂停"
            onClick={pausePotato}
            variant="dark"
          />
        )}

      </div>
      {/* 弹窗 */}
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
    </div>
  )
}

export default PotatoClock
