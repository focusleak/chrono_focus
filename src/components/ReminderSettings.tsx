import type { LucideIcon } from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import { SettingRow } from './SettingRow'
import { NumberInput } from './NumberInput'

interface ReminderSettingsProps {
  icon: LucideIcon
  title: string
  description: string
  enabled: boolean
  interval?: number
  goal?: number
  onEnabledChange: (enabled: boolean) => void
  onIntervalChange?: (interval: number) => void
  onGoalChange?: (goal: number) => void
  intervalDescription?: string
  goalDescription?: string
  intervalMin?: number
  intervalMax?: number
  goalMin?: number
  goalMax?: number
}

export const ReminderSettings = ({
  icon: Icon,
  title,
  description,
  enabled,
  interval,
  goal,
  onEnabledChange,
  onIntervalChange,
  onGoalChange,
  intervalDescription = '每隔多久提醒一次',
  goalDescription = '每日目标',
  intervalMin = 0.1,
  intervalMax = 120,
  goalMin = 1,
  goalMax = 100,
}: ReminderSettingsProps) => {
  return (
    <div className="p-6">
      <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {title}
      </h3>
      <div className="space-y-4">
        <SettingRow label={`启用${title}`} description={description}>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            className="data-[state=checked]:bg-[#34c759]"
          />
        </SettingRow>
        {enabled && interval !== undefined && onIntervalChange && (
          <SettingRow label="提醒间隔" description={intervalDescription}>
            <NumberInput
              value={interval}
              min={intervalMin}
              max={intervalMax}
              showSeconds
              onSave={onIntervalChange}
              className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
            />
          </SettingRow>
        )}
        {enabled && goal !== undefined && onGoalChange && (
          <SettingRow label="每日目标" description={goalDescription}>
            <NumberInput
              value={goal}
              min={goalMin}
              max={goalMax}
              onSave={onGoalChange}
              className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
            />
          </SettingRow>
        )}
      </div>
    </div>
  )
}
