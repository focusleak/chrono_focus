import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  icon: LucideIcon
  iconColor: string
  bgColor: string
  value: string | number
  label: string
  secondaryValue?: string | number
  secondaryLabel?: string
}

export const StatCard = ({
  icon: Icon,
  iconColor,
  bgColor,
  value,
  label,
  secondaryValue,
  secondaryLabel,
}: StatCardProps) => {
  return (
    <Card className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-[#2c2c2e]">
      <CardContent className="pt-5 pb-4">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className={cn('w-10 h-10 rounded-full', bgColor, 'flex items-center justify-center')}>
              <Icon className={cn('w-5 h-5', iconColor)} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{label}</div>
          {secondaryValue && (
            <>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{secondaryValue}</div>
              {secondaryLabel && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{secondaryLabel}</div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface StatSectionProps {
  icon: LucideIcon
  iconColor: string
  bgColor: string
  borderColor: string
  title: string
  description: string
  children: React.ReactNode
}

export const StatSection = ({
  icon: Icon,
  iconColor,
  bgColor,
  borderColor,
  title,
  description,
  children,
}: StatSectionProps) => {
  return (
    <div className={cn('rounded-xl p-6 border', bgColor, borderColor)}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('w-10 h-10 rounded-full', bgColor, 'flex items-center justify-center')}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
