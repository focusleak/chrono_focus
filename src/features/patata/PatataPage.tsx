import { useState } from 'react'
import { Gamepad2, Play, Pause, RotateCcw } from 'lucide-react'

import { cn, formatDuration } from '@/lib/utils'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ItemSelector } from '@/components/ItemSelector'
import { TimerButton } from '@/components/TimerButton'

import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'

const PatataPage = () => {
  const patataElapsedTime = useRuntimeStore.use.patataElapsedTime()
  const showPomodoroPatataConflict = useRuntimeStore.use.showPomodoroPatataConflict()
  const resolvePomodoroPatataConflict = useRuntimeStore.use.resolvePomodoroPatataConflict()
  const dailyPatataLimit = useSettingsStore.use.dailyPatataLimit()
  const isOvertime = patataElapsedTime > dailyPatataLimit * 60
  const tasks = useRuntimeStore.use.tasks()
  const currentPatataTaskId = useRuntimeStore.use.currentPatataTaskId()
  const setCurrentPatataTask = useRuntimeStore.use.setCurrentPatataTask()

  const isPatataRunning = useRuntimeStore.use.isPatataRunning()
  const startPatata = useRuntimeStore.use.startPatata()
  const pausePatata = useRuntimeStore.use.pausePatata()
  const resetPatata = useRuntimeStore.use.resetPatata()
  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false)

  const handleStartPatata = () => {
    if (isOvertime) {
      setShowOvertimeWarning(true)
    } else {
      startPatata()
    }
  }

  const confirmOvertimeStart = () => {
    startPatata()
    setShowOvertimeWarning(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">

      {/* 土豆钟时间 - 正计时显示 */}
      <div
        className={cn(
          'text-8xl font-mono font-semibold mb-6 transition-colors duration-300',
          isOvertime
            ? 'text-red-500 dark:text-red-400'
            : 'text-gray-900 dark:text-gray-100'
        )}
        style={{ fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
      >
        {formatDuration(patataElapsedTime)}
      </div>

      {/* 中间 */}
      <ItemSelector
        selectedId={currentPatataTaskId}
        items={tasks.filter((t) => t.type === 'entertainment')}
        onSelect={setCurrentPatataTask}
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
        {!isPatataRunning ? (
          <TimerButton
            icon={Play}
            label="开始"
            onClick={handleStartPatata}
            variant="dark"
          />
        ) : (
          <TimerButton
            icon={Pause}
            label="暂停"
            onClick={pausePatata}
            variant="dark"
          />
        )}
        {patataElapsedTime > 0 && (
          <TimerButton
            icon={RotateCcw}
            label="重置"
            onClick={resetPatata}
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
        open={showPomodoroPatataConflict === 'patata'}
        onClose={() => resolvePomodoroPatataConflict('pomodoro')}
        title="番茄钟正在运行"
        message="当前番茄钟（专注时间）正在进行中，确定要停止它并开始娱乐时间吗？"
        confirmLabel="停止并开始"
        cancelLabel="取消"
        onConfirm={() => resolvePomodoroPatataConflict('patata')}
        confirmClassName="bg-[#FADFA1] text-gray-900 hover:bg-[#e5cc8a] font-medium"
      />
    </div>
  )
}

export default PatataPage
