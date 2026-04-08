import { useRuntimeStore } from '../store/runtimeStore'
import { useSettingsStore } from '../store/settingsStore'
import { Play, Pause, Timer, Gamepad2, Droplets, Clock } from 'lucide-react'
import { formatDuration } from '../lib/utils'

/**
 * 底部状态栏组件
 * 显示当前计时情况和系统状态
 */
const StatusBar = () => {
  const {
    pomodoroTimeLeft,
    currentPomodoroTime,
    isPomodoroRunning,
    pomodoroType,
    currentPomodoroTaskId,
    tasks = [],
    potatoTimeLeft,
    isPotatoRunning,
    waterCount,
    restReminderTimeLeft,
    restReminderTotalTime,
    showRestReminderPrompt,
    restReminderPaused,
    toggleRestReminderPause,
    totalFocusTime,
  } = useRuntimeStore()
  const {
    dailyPotatoLimit,
    dailyWaterGoal,
    restReminderEnabled,
  } = useSettingsStore()

  const currentTask = tasks.find((t: any) => t.id === currentPomodoroTaskId)

  /** 切换暂停/运行 */
  const togglePause = () => {
    toggleRestReminderPause()
  }

  /** 获取计时类型标签 */
  const getActiveLabel = () => {
    if (showRestReminderPrompt) return '休息提醒'
    if (isPotatoRunning) return '娱乐'
    if (isPomodoroRunning) {
      switch (pomodoroType) {
        case 'pomodoro': return '专注'
        case 'shortBreak': return '短休息'
        case 'longBreak': return '长休息'
      }
    }
    if (restReminderEnabled) return '休息提醒'
    if (!restReminderEnabled && !isPomodoroRunning && !isPotatoRunning) return '休息提醒已关闭'
    return ''
  }

  /** 获取状态点颜色 */
  const getDotColor = () => {
    if (showRestReminderPrompt) return 'bg-orange-500'
    if (isPotatoRunning) return 'bg-yellow-500'
    if (isPomodoroRunning) {
      switch (pomodoroType) {
        case 'pomodoro': return 'bg-green-500'
        case 'shortBreak': return 'bg-teal-500'
        case 'longBreak': return 'bg-blue-500'
      }
    }
    if (restReminderEnabled) return 'bg-blue-400'
    return 'bg-gray-400'
  }

  /** 判断是否正在运行 */
  const isActive = isPomodoroRunning || isPotatoRunning || (restReminderEnabled && !showRestReminderPrompt && !restReminderPaused)

  /** 获取当前计时的已用时间和总时间 */
  const getTimerInfo = () => {
    if (showRestReminderPrompt) {
      return { elapsed: restReminderTotalTime - restReminderTimeLeft, total: restReminderTotalTime }
    }
    if (isPotatoRunning) {
      const elapsed = Math.max(0, dailyPotatoLimit * 60 - potatoTimeLeft)
      return { elapsed, total: dailyPotatoLimit * 60 }
    }
    if (isPomodoroRunning) {
      return { elapsed: Math.max(0, currentPomodoroTime - pomodoroTimeLeft), total: currentPomodoroTime }
    }
    if (restReminderEnabled) {
      return { elapsed: restReminderTotalTime - restReminderTimeLeft, total: restReminderTotalTime }
    }
    return { elapsed: 0, total: 0 }
  }

  const { elapsed, total } = getTimerInfo()

  return (
    <div className="h-8 bg-black/30 dark:bg-black/60 border-t border-black/10 dark:border-white/10 flex items-center px-4 text-xs text-white/90 select-none">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* 计时类型 */}
        {getActiveLabel() && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-white/60" />
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${getDotColor()} ${isActive ? 'animate-pulse' : ''}`} />
            <span className="text-white/90 font-medium">{getActiveLabel()}</span>
          </div>
        )}

        {/* 已用时间 */}
        {total > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Timer className="w-3.5 h-3.5 text-white/60" />
            <span className="font-mono text-white tabular-nums">
              {formatDuration(elapsed)}
            </span>
            <span className="text-white/40">/</span>
            <span className="font-mono text-white/60 tabular-nums">
              {formatDuration(total)}
            </span>
            {/* 休息提醒运行时显示百分数 */}
            {!isPomodoroRunning && !isPotatoRunning && restReminderEnabled && !showRestReminderPrompt && total > 0 && (
              <span className="font-mono text-white/80 tabular-nums">
                ({Math.round((elapsed / total) * 100)}%)
              </span>
            )}
            {/* 暂停/继续按钮 */}
            <div
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={togglePause}
              title={restReminderPaused ? '继续' : '暂停'}
            >
              {restReminderPaused ? (
                <Play className="w-3 h-3 text-white" />
              ) : (
                <Pause className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
        )}

        {/* 当前任务 */}
        {currentTask && isPomodoroRunning && pomodoroType === 'pomodoro' && (
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="text-white/40 shrink-0">|</span>
            <span className="text-white/80 truncate">{currentTask.title}</span>
          </div>
        )}
      </div>

      {/* 右侧信息 */}
      <div className="flex items-center gap-4 shrink-0">
        {/* 专注分钟 */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-white/60" />
          <span className="text-white/80">
            专注 {Math.round(totalFocusTime)}分钟
          </span>
        </div>

        {/* 土豆钟已用 */}
        {!isPotatoRunning && dailyPotatoLimit > 0 && (
          <div className="flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-white/60" />
            <span className="text-white/80">
              娱乐 {Math.max(0, Math.floor((dailyPotatoLimit * 60 - potatoTimeLeft) / 60))}分钟
            </span>
          </div>
        )}

        {/* 喝水 */}
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-white/60" />
          <span className="text-white/80">
            {waterCount}/{dailyWaterGoal}
          </span>
        </div>
      </div>
    </div>
  )
}

export default StatusBar
