import { Target, Coffee } from 'lucide-react'
import { ItemSelector } from '../../components/common/ItemSelector'
import { useStore } from '../../store/store'

export const TaskSelector = () => {
  const { tasks = [], currentTaskId, setCurrentTask, pomodoroType } = useStore()
  const isBreak = pomodoroType === 'shortBreak' || pomodoroType === 'longBreak'

  if (isBreak) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white/70 text-sm">
        <Coffee className="w-4 h-4" />
        <span>休息中</span>
      </div>
    )
  }

  return (
    <ItemSelector
      selectedId={currentTaskId}
      items={tasks.filter(t => t.type === 'task')}
      onSelect={setCurrentTask}
      icon={Target}
      dialogTitle="选择任务"
      placeholder="选择任务"
      emptyMessage="暂无可用任务"
      activeClassName="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
      selectedClassName="text-white/80 hover:text-white"
      placeholderClassName="text-white/60 hover:text-white/80"
    />
  )
}
