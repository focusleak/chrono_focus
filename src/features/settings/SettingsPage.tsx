import { useSettingsStore } from '@/store/settingsStore'
import type { ThemeMode } from '@/store/settingsStore'
import { useSetAutoLaunch } from '@/hooks/useInitAutoLaunch'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Sun, Moon, Monitor, Play, Palette, Clock, Gamepad2, Droplets, Footprints, StretchHorizontal, Eye, PersonStanding } from 'lucide-react'
import { SettingRow } from '@/components/common/SettingRow'
import { NumberInput } from '@/components/common/NumberInput'
import { ReminderSettings } from '@/components/common/ReminderSettings'

const SettingsPage = () => {
  const { theme, setTheme,
    pomodoroTime, pomodoroShortBreakTime, pomodoroLongBreakTime,
    autoStartEnabled,
    dailyPotatoLimit, setDailyPotatoLimit,
    restReminderEnabled, restReminderInterval, restReminderNotification, restBreakDuration, restReminderSkipInterval,
    waterReminderEnabled, waterReminderInterval, dailyWaterGoal,
    standReminderEnabled, standReminderInterval,
    stretchReminderEnabled, stretchReminderInterval,
    gazeReminderEnabled, gazeReminderInterval,
    walkReminderEnabled, walkReminderInterval,
    updateSettings
  } = useSettingsStore()
  const setAutoStartEnabled = useSetAutoLaunch()

  const themeOptions: { label: string; value: ThemeMode; icon: any }[] = [
    { label: '浅色', value: 'light', icon: Sun },
    { label: '深色', value: 'dark', icon: Moon },
    { label: '跟随系统', value: 'system', icon: Monitor },
  ]

  const handleChange = (key: string, value: any) => {
    updateSettings({ [key]: value })
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* 启动设置 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Play className="w-4 h-4" />
          启动设置
        </h3>
        <SettingRow
          label="开机自启动"
          description="打开应用后自动开始休息提醒计时"
        >
          <Switch
            checked={autoStartEnabled}
            onCheckedChange={setAutoStartEnabled}
            className="data-[state=checked]:bg-[#34c759]"
          />
        </SettingRow>
      </div>

      {/* 外观设置 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          外观
        </h3>
        <SettingRow label="主题模式" description="选择应用的颜色主题">
          <div className="flex gap-2 bg-white dark:bg-[#3a3a3c] rounded-lg p-1 shadow-sm">
            {themeOptions.map((option) => {
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={theme === option.value ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 px-3 text-xs rounded-md transition-all ${
                    theme === option.value
                      ? 'bg-black/10 text-gray-900 dark:bg-white/10 dark:text-gray-100 shadow-sm hover:bg-black/15 dark:hover:bg-white/15'
                      : 'hover:bg-gray-100 dark:hover:bg-[#404042] text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setTheme(option.value)}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  {option.label}
                </Button>
              )
            })}
          </div>
        </SettingRow>
      </div>

      {/* 番茄钟设置 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          番茄钟
        </h3>
        <div className="space-y-4">
          <SettingRow label="番茄钟时长" description="工作时间">
            <NumberInput
              value={pomodoroTime}
              min={0.1}
              max={60}
              showSeconds
              onSave={(v) => handleChange('pomodoroTime', v)}
              className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
            />
          </SettingRow>
          <SettingRow label="短休息时长" description="短休息时间">
            <NumberInput
              value={pomodoroShortBreakTime}
              min={0.1}
              max={30}
              showSeconds
              onSave={(v) => handleChange('pomodoroShortBreakTime', v)}
              className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
            />
          </SettingRow>
          <SettingRow label="长休息时长" description="长休息时间">
            <NumberInput
              value={pomodoroLongBreakTime}
              min={0.1}
              max={60}
              showSeconds
              onSave={(v) => handleChange('pomodoroLongBreakTime', v)}
              className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
            />
          </SettingRow>
        </div>
      </div>

      {/* 土豆钟设置 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Gamepad2 className="w-4 h-4" />
          土豆钟
        </h3>
        <SettingRow label="每日娱乐时间限制" description="每天最多可用于娱乐的时间">
          <NumberInput
            value={dailyPotatoLimit}
            min={0.1}
            max={240}
            showSeconds
            onSave={setDailyPotatoLimit}
            className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
          />
        </SettingRow>
      </div>

      {/* 休息提醒 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          休息提醒
        </h3>
        <div className="space-y-4">
          <SettingRow label="启用休息提醒" description="工作一段时间后提醒休息">
            <Switch
              checked={restReminderEnabled}
              onCheckedChange={(checked) => handleChange('restReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {restReminderEnabled && (
            <>
              <SettingRow label="提醒前发送通知" description="倒计时结束时发送系统通知">
                <Switch
                  checked={restReminderNotification}
                  onCheckedChange={(checked) => handleChange('restReminderNotification', checked)}
                  className="data-[state=checked]:bg-[#34c759]"
                />
              </SettingRow>
              <SettingRow label="提醒间隔" description="每隔多久提醒一次">
                <NumberInput
                  value={restReminderInterval}
                  min={0.1}
                  max={120}
                  showSeconds
                  onSave={(v) => handleChange('restReminderInterval', v)}
                  className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                />
              </SettingRow>
              <SettingRow label="休息时长" description="每次休息的时长">
                <NumberInput
                  value={restBreakDuration}
                  min={0.1}
                  max={60}
                  showSeconds
                  onSave={(v) => handleChange('restBreakDuration', v)}
                  className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                />
              </SettingRow>
              <SettingRow label="跳过后再提醒" description="跳过休息后多久再次提醒">
                <NumberInput
                  value={restReminderSkipInterval}
                  min={0.1}
                  max={60}
                  showSeconds
                  onSave={(v) => handleChange('restReminderSkipInterval', v)}
                  className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                />
              </SettingRow>
            </>
          )}
        </div>
      </div>

      {/* 喝水提醒 */}
      <ReminderSettings
        icon={Droplets}
        title="喝水提醒"
        description="定时提醒喝水"
        enabled={waterReminderEnabled}
        interval={waterReminderInterval}
        goal={dailyWaterGoal}
        onEnabledChange={(checked) => handleChange('waterReminderEnabled', checked)}
        onIntervalChange={(v) => handleChange('waterReminderInterval', v)}
        onGoalChange={(v) => handleChange('dailyWaterGoal', v)}
      />

      {/* 站立提醒 */}
      <ReminderSettings
        icon={Footprints}
        title="站立提醒"
        description="久坐后提醒起身活动"
        enabled={standReminderEnabled}
        interval={standReminderInterval}
        onEnabledChange={(checked) => handleChange('standReminderEnabled', checked)}
        onIntervalChange={(v) => handleChange('standReminderInterval', v)}
      />

      {/* 拉伸提醒 */}
      <ReminderSettings
        icon={StretchHorizontal}
        title="拉伸提醒"
        description="定时提醒伸展身体"
        enabled={stretchReminderEnabled}
        interval={stretchReminderInterval}
        onEnabledChange={(checked) => handleChange('stretchReminderEnabled', checked)}
        onIntervalChange={(v) => handleChange('stretchReminderInterval', v)}
      />

      {/* 远眺提醒 */}
      <ReminderSettings
        icon={Eye}
        title="远眺提醒"
        description="定时看向远方，保护视力"
        enabled={gazeReminderEnabled}
        interval={gazeReminderInterval}
        onEnabledChange={(checked) => handleChange('gazeReminderEnabled', checked)}
        onIntervalChange={(v) => handleChange('gazeReminderInterval', v)}
      />

      {/* 走动提醒 */}
      <ReminderSettings
        icon={PersonStanding}
        title="走动提醒"
        description="久坐后提醒起身走动"
        enabled={walkReminderEnabled}
        interval={walkReminderInterval}
        onEnabledChange={(checked) => handleChange('walkReminderEnabled', checked)}
        onIntervalChange={(v) => handleChange('walkReminderInterval', v)}
      />
    </div>
  )
}

export default SettingsPage
