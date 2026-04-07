import { useStore } from '../../store/store'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { PomodoroControls } from './PomodoroControls'
import { TaskSelector } from './TaskSelector'
import { formatDuration } from '../../lib/utils'

const PomodoroClock = () => {
  const {
    timeLeft,
    breakTimeLeft,
    breakType,
    isRunning,
    pomodoroType,
    stopPomodoro,
    finishEarlyPomodoro,
    showPomodoroPotatoConflict,
    resolvePomodoroPotatoConflict,
    setPomodoroType,
    startPomodoro,
    shortBreakTime,
    longBreakTime,
  } = useStore()

  const handleEarlyFinish = () => {
    stopPomodoro()
    finishEarlyPomodoro()
  }

  const startBreak = () => {
    const state = useStore.getState()
    const { breakType: storedBreakType, shortBreakTime, longBreakTime } = state
    if (storedBreakType) {
      const breakTime = storedBreakType === 'shortBreak' ? shortBreakTime * 60 : longBreakTime * 60
      setPomodoroType(storedBreakType)
      useStore.setState({ breakTimeLeft: breakTime })
      startPomodoro()
    }
  }

  const showBreakButton = timeLeft === 0 && pomodoroType === 'pomodoro' && breakType !== null
  const isBreakRunning = isRunning && (pomodoroType === 'shortBreak' || pomodoroType === 'longBreak')
  const displayTime = isBreakRunning ? breakTimeLeft : timeLeft
  const breakLabel = breakType === 'longBreak' ? '长休息' : '短休息'

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="mb-10">
        {showBreakButton && (
          <div className="text-sm font-medium text-white/60 mb-4">
            {breakLabel} 建议 {breakType === 'longBreak' ? longBreakTime : shortBreakTime} 分钟
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

      {!isRunning && !showBreakButton && <PomodoroControls onEarlyFinish={handleEarlyFinish} />}

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
