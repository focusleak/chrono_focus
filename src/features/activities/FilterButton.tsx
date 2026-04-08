import type { ActivityType } from '@/types'

interface FilterButtonProps {
  label: string
  type: ActivityType | 'all'
  activeType: ActivityType | 'all'
  onClick: (type: ActivityType | 'all') => void
  icon?: React.ComponentType<{ className?: string }>
}

const getActiveClassName = (type: ActivityType | 'all'): string => {
  if (type === 'task') {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
  }
  if (type === 'entertainment') {
    return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm'
  }
  return 'bg-black/10 text-gray-900 dark:bg-white/10 dark:text-gray-100 shadow-sm'
}

const INACTIVE_CLASS = 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e]'
const BASE_CLASS = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-all'

const FilterButton = ({ label, type, activeType, onClick, icon: IconComponent }: FilterButtonProps) => {
  const isActive = activeType === type
  const className = `${BASE_CLASS} ${isActive ? getActiveClassName(type) : INACTIVE_CLASS}`

  return (
    <button onClick={() => onClick(type)} className={className}>
      {IconComponent && <IconComponent className="w-3.5 h-3.5 mr-1.5" />}
      {label}
    </button>
  )
}

export default FilterButton
