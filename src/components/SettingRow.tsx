import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface SettingRowProps {
  label: string
  description?: string
  children: ReactNode
}

export const SettingRow = ({ label, description, children }: SettingRowProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
