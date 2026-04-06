import { useState } from 'react'
import { useTimerStore } from '../../store/timerStore'
import PomodoroDisplay from './PomodoroDisplay'
import PomodoroControls from './PomodoroControls'
import TaskCompleteModal from '@/components/TaskCompleteModal'
import HydrationPrompt from '@/components/HydrationPrompt'

const PomodoroClock = () => {
  const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false)
  const { tasks = [], currentTaskId, completeTask, finishEarly, showHydrationPrompt, setShowHydrationPrompt, acknowledgeHydration } = useTimerStore()
  const currentTask = tasks.find(t => t.id === currentTaskId)

  const handleEarlyFinish = () => {
    finishEarly()
    // 直接进入休息状态
    useTimerStore.getState().setShowBreakPrompt('shortBreak')
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

  return (
    <div className="space-y-8">
      <PomodoroDisplay />
      <PomodoroControls onEarlyFinish={handleEarlyFinish} />

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
