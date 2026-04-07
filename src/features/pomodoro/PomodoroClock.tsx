import { useState } from 'react'
import { useStore } from '../../store/store'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import TaskCompleteModal from './TaskCompleteModal'
import HydrationPrompt from './HydrationPrompt'
import { PomodoroControls } from './PomodoroControls'
import { TaskSelector } from './TaskSelector'
import { format } from 'date-fns'

const PomodoroClock = () => {
  const {
    timeLeft,
    tasks = [],
    currentTaskId,
    stopPomodoro,
    finishEarlyPomodoro,
    completeTask,
    showHydrationPrompt,
    setShowHydrationPrompt,
    acknowledgeHydration,
    showPomodoroPotatoConflict,
    resolvePomodoroPotatoConflict,
  } = useStore()

  const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false)

  /**
   * 将秒数格式化为 MM:SS 格式
   * @param seconds - 秒数（可以是负数，负数时显示 + 前缀）
   * @returns 格式化后的时间字符串，如 "25:00" 或 "+03:15"
   */
  const formatTime = (seconds: number): string => {
    const isNegative = seconds < 0
    const absSeconds = Math.abs(seconds)
    const mins = Math.floor(absSeconds / 60)
    const secs = absSeconds % 60
    const timeStr = format(new Date(0, 0, 0, 0, mins, secs), 'mm:ss')
    return isNegative ? `+${timeStr}` : timeStr
  }

  /**
   * 获取当前选中的任务
   */
  const currentTask = tasks.find(t => t.id === currentTaskId)

  /**
   * 处理提前结束番茄钟
   * 停止当前番茄钟，标记为提前完成，并显示短休息提示
   */
  const handleEarlyFinish = () => {
    stopPomodoro()
    finishEarlyPomodoro()
  }

  /**
   * 处理任务完成
   * 如果当前有关联任务，则标记任务为完成状态，并关闭弹窗
   */
  const handleTaskComplete = () => {
    if (currentTaskId) {
      completeTask(currentTaskId)
    }
    setShowTaskCompleteModal(false)
  }

  /**
   * 处理任务未完成
   * 关闭任务完成弹窗，继续下一个番茄钟
   */
  const handleTaskNotComplete = () => {
    setShowTaskCompleteModal(false)
  }

  /**
   * 处理喝水提示 - 选择"喝一杯水"
   * 确认喝水并记录
   */
  const handleHydrationYes = () => {
    acknowledgeHydration()
  }

  /**
   * 处理喝水提示 - 选择"不需要"
   * 关闭喝水提示弹窗
   */
  const handleHydrationNo = () => {
    setShowHydrationPrompt(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      {/* 时间和任务选择器 */}
      <div className="mb-10">
        <div
          className="text-8xl font-semibold tracking-tight mb-6 font-mono text-white"
          style={{
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          {formatTime(timeLeft)}
        </div>

        <TaskSelector />
      </div>

      {/* 控制按钮区域 */}
      <PomodoroControls onEarlyFinish={handleEarlyFinish} />


      {/* 冲突提示弹窗：当土豆钟正在运行时，尝试启动番茄钟会显示此确认弹窗 */}
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

      {/* 任务完成弹窗：番茄钟结束后询问关联任务是否完成 */}
      <TaskCompleteModal
        open={showTaskCompleteModal}
        onTaskComplete={handleTaskComplete}
        onTaskNotComplete={handleTaskNotComplete}
        taskTitle={currentTask?.title || ''}
      />

      {/* 喝水提示弹窗：定期提醒用户喝水 */}
      <HydrationPrompt
        open={showHydrationPrompt}
        onYes={handleHydrationYes}
        onNo={handleHydrationNo}
      />
    </div>
  )
}

export default PomodoroClock
