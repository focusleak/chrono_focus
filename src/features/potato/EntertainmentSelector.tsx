import { Gamepad2 } from 'lucide-react'
import { ItemSelector } from '../../components/common/ItemSelector'
import { useStore } from '../../store/store'

/**
 * 娱乐项目选择器组件
 * 显示当前娱乐项目，点击可打开选择弹窗
 */
export const EntertainmentSelector = () => {
  const {
    tasks = [],
    currentPotatoTaskId,
    setCurrentPotatoTask,
  } = useStore()

  return (
    <ItemSelector
      selectedId={currentPotatoTaskId}
      items={tasks.filter((t: any) => t.type === 'entertainment')}
      onSelect={setCurrentPotatoTask}
      icon={Gamepad2}
      dialogTitle="选择娱乐项目"
      placeholder="选择娱乐项目"
      emptyMessage="暂无可用娱乐项目"
      activeClassName="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
      selectedClassName="text-gray-900 hover:text-gray-700"
      placeholderClassName="text-gray-500 hover:text-gray-400"
      className="mb-6"
    />
  )
}
