import { useStore } from '../../store/store'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Droplets, Footprints, Eye, Timer, PersonStanding, StretchHorizontal } from 'lucide-react'
import { SettingRow } from './SettingRow'

// 提醒配置
const RemindersSettings = () => {
  const {
    restReminderEnabled, restReminderInterval,
    shortBreakReminderInterval, longBreakReminderInterval,
    waterReminderEnabled, waterReminderInterval, dailyWaterGoal,
    standReminderEnabled, standReminderInterval,
    stretchReminderEnabled, stretchReminderInterval,
    gazeReminderEnabled, gazeReminderInterval,
    walkReminderEnabled, walkReminderInterval,
    updateSettings
  } = useStore()

  const settings = {
    restReminderEnabled, restReminderInterval,
    shortBreakReminderInterval, longBreakReminderInterval,
    waterReminderEnabled, waterReminderInterval, dailyWaterGoal,
    standReminderEnabled, standReminderInterval,
    stretchReminderEnabled, stretchReminderInterval,
    gazeReminderEnabled, gazeReminderInterval,
    walkReminderEnabled, walkReminderInterval,
  }

  const handleChange = (key: string, value: any) => {
    updateSettings({ [key]: value })
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* 休息提醒 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Timer className="w-4 h-4" />
          休息提醒
        </h3>
        <div className="space-y-4">
          <SettingRow label="启用休息提醒" description="工作一段时间后提醒休息">
            <Switch
              checked={settings.restReminderEnabled}
              onCheckedChange={(checked) => handleChange('restReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {settings.restReminderEnabled && (
            <>
              <SettingRow label="提醒间隔" description="每隔多久提醒一次">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={settings.restReminderInterval}
                    onChange={(e) => handleChange('restReminderInterval', parseInt(e.target.value))}
                    className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
                </div>
              </SettingRow>
              <SettingRow label="短休息提醒间隔" description="短休息时提醒频率">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.shortBreakReminderInterval}
                    onChange={(e) => handleChange('shortBreakReminderInterval', parseInt(e.target.value))}
                    className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
                </div>
              </SettingRow>
              <SettingRow label="长休息提醒间隔" description="长休息时提醒频率">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={settings.longBreakReminderInterval}
                    onChange={(e) => handleChange('longBreakReminderInterval', parseInt(e.target.value))}
                    className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
                </div>
              </SettingRow>
            </>
          )}
        </div>
      </div>

      {/* 喝水提醒 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          喝水提醒
        </h3>
        <div className="space-y-4">
          <SettingRow label="启用喝水提醒" description="定时提醒喝水">
            <Switch
              checked={settings.waterReminderEnabled}
              onCheckedChange={(checked) => handleChange('waterReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {settings.waterReminderEnabled && (
            <>
              <SettingRow label="提醒间隔" description="每隔多久提醒一次">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={settings.waterReminderInterval}
                    onChange={(e) => handleChange('waterReminderInterval', parseInt(e.target.value))}
                    className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
                </div>
              </SettingRow>
              <SettingRow label="每日喝水目标" description="每天喝多少杯水">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={settings.dailyWaterGoal}
                    onChange={(e) => handleChange('dailyWaterGoal', parseInt(e.target.value))}
                    className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8">杯</span>
                </div>
              </SettingRow>
            </>
          )}
        </div>
      </div>

      {/* 站立提醒 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Footprints className="w-4 h-4" />
          站立提醒
        </h3>
        <div className="space-y-4">
          <SettingRow label="启用站立提醒" description="久坐后提醒起身活动">
            <Switch
              checked={settings.standReminderEnabled}
              onCheckedChange={(checked) => handleChange('standReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {settings.standReminderEnabled && (
            <SettingRow label="提醒间隔" description="坐多久后提醒">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={settings.standReminderInterval}
                  onChange={(e) => handleChange('standReminderInterval', parseInt(e.target.value))}
                  className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">分钟</span>
              </div>
            </SettingRow>
          )}
        </div>
      </div>

      {/* 拉伸提醒 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <StretchHorizontal className="w-4 h-4" />
          拉伸提醒
        </h3>
        <div className="space-y-4">
          <SettingRow label="启用拉伸提醒" description="定时提醒伸展身体">
            <Switch
              checked={settings.stretchReminderEnabled}
              onCheckedChange={(checked) => handleChange('stretchReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {settings.stretchReminderEnabled && (
            <SettingRow label="提醒间隔" description="每隔多久提醒一次">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={settings.stretchReminderInterval}
                  onChange={(e) => handleChange('stretchReminderInterval', parseInt(e.target.value))}
                  className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">分钟</span>
              </div>
            </SettingRow>
          )}
        </div>
      </div>

      {/* 远眺提醒 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          远眺提醒
        </h3>
        <div className="space-y-4">
          <SettingRow label="启用远眺提醒" description="定时看向远方，保护视力">
            <Switch
              checked={settings.gazeReminderEnabled}
              onCheckedChange={(checked) => handleChange('gazeReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {settings.gazeReminderEnabled && (
            <SettingRow label="提醒间隔" description="每隔多久提醒一次">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={settings.gazeReminderInterval}
                  onChange={(e) => handleChange('gazeReminderInterval', parseInt(e.target.value))}
                  className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">分钟</span>
              </div>
            </SettingRow>
          )}
        </div>
      </div>

      {/* 走动提醒 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <PersonStanding className="w-4 h-4" />
          走动提醒
        </h3>
        <div className="space-y-4">
          <SettingRow label="启用走动提醒" description="久坐后提醒起身走动">
            <Switch
              checked={settings.walkReminderEnabled}
              onCheckedChange={(checked) => handleChange('walkReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {settings.walkReminderEnabled && (
            <SettingRow label="提醒间隔" description="每隔多久提醒一次">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={settings.walkReminderInterval}
                  onChange={(e) => handleChange('walkReminderInterval', parseInt(e.target.value))}
                  className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">分钟</span>
              </div>
            </SettingRow>
          )}
        </div>
      </div>
    </div>
  )
}

export default RemindersSettings
