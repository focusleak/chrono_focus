import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PomodoroControls } from './PomodoroControls'
import { TaskSelector } from './TaskSelector'
import { formatDuration } from '@/lib/utils'

const PomodoroClock = () => {
  const pomodoroTimeLeft = useRuntimeStore.use.pomodoroTimeLeft()
  const pomodoroBreakType = useRuntimeStore.use.pomodoroBreakType()
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const pomodoroType = useRuntimeStore.use.pomodoroType()
  const stopPomodoro = useRuntimeStore.use.stopPomodoro()
  const finishEarlyPomodoro = useRuntimeStore.use.finishEarlyPomodoro()
  const showPomodoroPotatoConflict = useRuntimeStore.use.showPomodoroPotatoConflict()
  const resolvePomodoroPotatoConflict = useRuntimeStore.use.resolvePomodoroPotatoConflict()
  const pomodoroShortBreakTime = useSettingsStore.use.pomodoroShortBreakTime()
  const pomodoroLongBreakTime = useSettingsStore.use.pomodoroLongBreakTime()

  const handleEarlyFinish = () => {
    stopPomodoro()
    finishEarlyPomodoro()
  }

  const startBreak = () => {
    const state = useRuntimeStore.getState()
    const { pomodoroBreakType } = state
    if (pomodoroBreakType) {
      const breakTime = pomodoroBreakType === 'shortBreak' ? pomodoroShortBreakTime * 60 : pomodoroLongBreakTime * 60
      useRuntimeStore.setState({
        pomodoroType: pomodoroBreakType,
        pomodoroTimeLeft: breakTime,
        currentPomodoroTime: breakTime,
        pomodoroBreakType: pomodoroBreakType,
        isPomodoroRunning: true,
      })
    }
  }

  const showBreakButton = pomodoroTimeLeft === 0 && pomodoroType === 'pomodoro' && pomodoroBreakType !== null
  const displayTime = pomodoroTimeLeft
  const breakLabel = pomodoroBreakType === 'longBreak' ? '长休息' : '短休息'

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="mb-10">
        {showBreakButton && (
          <div className="text-sm font-medium text-white/60 mb-4">
            {breakLabel} 建议 {pomodoroBreakType === 'longBreak' ? pomodoroLongBreakTime : pomodoroShortBreakTime} 分钟
          </div>
        )}
        <div
          className="text-8xl font-semibold tracking-tight mb-6 font-mono text-white"
          style={{ fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
        >
          {formatDuration(displayTime)}
        </div>
      </div>

      <TaskSelector />

      {showBreakButton && (
        <div className="flex justify-center gap-3 mb-6">
          <button onClick={startBreak} className="px-10 h-11 text-base font-medium rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-200 flex items-center backdrop-blur-sm">
            开始休息
          </button>
        </div>
      )}

      {!isPomodoroRunning && !showBreakButton && <PomodoroControls onEarlyFinish={handleEarlyFinish} />}

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

export default PomodoroClock
