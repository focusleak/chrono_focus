import { Play, Pause, Timer, Gamepad2, Droplets, Clock } from 'lucide-react'

import { cn, formatDuration } from '@/lib/utils'

import { PomodoroStatus } from '@/types'

import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'

/**
 * 底部状态栏组件
 * 显示当前计时情况和系统状态
 */
const StatusBar = () => {
  const pomodoroTimeLeft = useRuntimeStore.use.pomodoroTimeLeft()
  const currentPomodoroTime = useRuntimeStore.use.currentPomodoroTime()
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()
  const currentPomodoroTaskId = useRuntimeStore.use.currentPomodoroTaskId()
  const tasks = useRuntimeStore.use.tasks()
  const patataElapsedTime = useRuntimeStore.use.patataElapsedTime()
  const isPatataRunning = useRuntimeStore.use.isPatataRunning()
  const waterCount = useRuntimeStore.use.waterCount()
  const restReminderTimeLeft = useRuntimeStore.use.restReminderTimeLeft()
  const restReminderTotalTime = useRuntimeStore.use.restReminderTotalTime()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()
  const restReminderPaused = useRuntimeStore.use.restReminderPaused()
  const toggleRestReminderPause = useRuntimeStore.use.toggleRestReminderPause()
  const totalFocusTime = useRuntimeStore.use.totalFocusTime()
  const restBreakCount = useRuntimeStore.use.restBreakCount()
  const restReminderSkipCount = useRuntimeStore.use.restReminderSkipCount()
  const dailyPatataLimit = useSettingsStore.use.dailyPatataLimit()
  const dailyWaterGoal = useSettingsStore.use.dailyWaterGoal()
  const restReminderEnabled = useSettingsStore.use.restReminderEnabled()

  const currentTask = tasks.find((t) => t.id === currentPomodoroTaskId)

  /** 切换暂停/运行 */
  const togglePause = () => {
    toggleRestReminderPause()
  }

  /** 获取计时类型标签 */
  const getActiveLabel = () => {
    if (showRestReminderPrompt) return '休息提醒'
    if (isPatataRunning) return '娱乐'
    if (isPomodoroRunning) {
      switch (pomodoroStatus) {
        case PomodoroStatus.Pomodoro:
          return '专注'
        case PomodoroStatus.ShortBreak:
          return '短休息'
        case PomodoroStatus.LongBreak:
          return '长休息'
      }
    }
    if (restReminderEnabled) return '休息提醒'
    if (!restReminderEnabled && !isPomodoroRunning && !isPatataRunning) return '休息提醒已关闭'
    return ''
  }

  /** 获取状态点颜色 */
  const getDotColor = () => {
    if (showRestReminderPrompt) return 'bg-orange-500'
    if (isPatataRunning) return 'bg-yellow-500'
    if (isPomodoroRunning) {
      switch (pomodoroStatus) {
        case PomodoroStatus.Pomodoro:
          return 'bg-green-500'
        case PomodoroStatus.ShortBreak:
          return 'bg-teal-500'
        case PomodoroStatus.LongBreak:
          return 'bg-blue-500'
      }
    }
    if (restReminderEnabled) return 'bg-blue-400'
    return 'bg-gray-400'
  }

  /** 判断是否正在运行 */
  const isActive =
    isPomodoroRunning ||
    isPatataRunning ||
    (restReminderEnabled && !showRestReminderPrompt && !restReminderPaused)

  /** 获取当前计时的已用时间和总时间 */
  const getTimerInfo = () => {
    if (showRestReminderPrompt) {
      return {
        elapsed: restReminderTotalTime - restReminderTimeLeft,
        total: restReminderTotalTime,
      }
    }
    if (isPatataRunning) {
      return { elapsed: patataElapsedTime, total: dailyPatataLimit * 60 }
    }
    if (isPomodoroRunning) {
      return {
        elapsed: Math.max(0, currentPomodoroTime - pomodoroTimeLeft),
        total: currentPomodoroTime,
      }
    }
    if (restReminderEnabled) {
      return {
        elapsed: restReminderTotalTime - restReminderTimeLeft,
        total: restReminderTotalTime,
      }
    }
    return { elapsed: 0, total: 0 }
  }

  const { elapsed, total } = getTimerInfo()

  return (
    <div className="flex h-8 select-none items-center bg-black px-4 text-sm text-white">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {/* 计时类型 */}
        {getActiveLabel() && (
          <div className="flex shrink-0 items-center gap-1.5">
            <Clock className="h-4 w-4 text-white" />
            <span
              className={cn(
                'inline-block h-1.5 w-1.5 rounded-full',
                getDotColor(),
                isActive && 'animate-pulse'
              )}
            />
            <span className="font-medium text-white/90">{getActiveLabel()}</span>
          </div>
        )}

        {/* 已用时间 */}
        {total > 0 && (
          <div className="flex shrink-0 items-center gap-1.5">
            <Timer className="h-4 w-4 text-white" />
            <span className="font-mono tabular-nums text-white">{formatDuration(elapsed)}</span>
            <span className="text-white/40">/</span>
            <span className="font-mono tabular-nums text-white/60">{formatDuration(total)}</span>
            {/* 休息提醒运行时显示百分数 */}
            {!isPomodoroRunning &&
              !isPatataRunning &&
              restReminderEnabled &&
              !showRestReminderPrompt &&
              total > 0 && (
                <span className="font-mono tabular-nums text-white/80">
                  ({Math.round((elapsed / total) * 100)}%)
                </span>
              )}
            {/* 暂停/继续按钮 */}
            <button
              type="button"
              className="flex cursor-pointer items-center transition-opacity hover:opacity-80 bg-transparent border-none p-0"
              onClick={togglePause}
              title={restReminderPaused ? '继续' : '暂停'}
            >
              {restReminderPaused ? (
                <Play className="h-4 w-4 text-white" />
              ) : (
                <Pause className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        )}

        {/* 当前任务 */}
        {currentTask && isPomodoroRunning && pomodoroStatus === PomodoroStatus.Pomodoro && (
          <div className="flex min-w-0 items-center gap-1.5 truncate">
            <span className="shrink-0 text-white/40">|</span>
            <span className="truncate text-white/80">{currentTask.title}</span>
          </div>
        )}
      </div>

      {/* 右侧信息 */}
      <div className="flex shrink-0 items-center gap-4">
        {/* 休息次数 / 跳过次数 */}
        <div className="flex items-center gap-3">
          <span className="text-white">休息 {restBreakCount}次</span>
          <span className="text-white">跳过 {restReminderSkipCount}次</span>
        </div>
        {/* 专注分钟 */}
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-white/60" />
          <span className="text-white/80">专注 {Math.round(totalFocusTime)}分钟</span>
        </div>
        {/* 土豆钟已用 */}
        {!isPatataRunning && patataElapsedTime > 0 && (
          <div className="flex items-center gap-1.5">
            <Gamepad2 className="h-3.5 w-3.5 text-white/60" />
            <span className="text-white/80">
              娱乐 {Math.floor(patataElapsedTime / 60)}分钟
            </span>
          </div>
        )}

        {/* 喝水 */}
        <div className="flex items-center gap-1.5">
          <Droplets className="h-3.5 w-3.5 text-white/60" />
          <span className="text-white/80">
            {waterCount}/{dailyWaterGoal}
          </span>
        </div>
      </div>
    </div>
  )
}

export default StatusBar
