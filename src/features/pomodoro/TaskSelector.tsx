import { Target } from 'lucide-react'
import { ItemSelector } from '../../components/ItemSelector'
import { useStore } from '../../store/store'

/**
 * 任务选择器组件
 * 显示当前任务，点击可打开选择弹窗
 */
export const TaskSelector = () => {
  const {
    tasks = [],
    currentTaskId,
    setCurrentTask,
  } = useStore()

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
