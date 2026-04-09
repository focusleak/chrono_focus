import { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface TimerButtonProps {
  icon: LucideIcon
  label: string
  onClick: () => void
  variant?: 'light' | 'dark'
}

const variantStyles = {
  light: 'border-white/30 text-white hover:bg-white/10',
  dark: 'border-gray-900/30 text-gray-900 hover:bg-gray-900/10',
}

export const TimerButton = forwardRef<HTMLButtonElement, TimerButtonProps>(
  ({ icon: Icon, label, onClick, variant = 'light' }, ref) => {
    const baseStyle = 'px-10 h-11 text-base font-medium rounded-xl border backdrop-blur-sm transition-all duration-200 flex items-center'
    const variantStyle = variantStyles[variant]

    return (
      <button ref={ref} onClick={onClick} className={cn(baseStyle, variantStyle)}>
        <Icon className="w-4 h-4 mr-2" />
        {label}
      </button>
    )
  }
)

TimerButton.displayName = 'TimerButton'
