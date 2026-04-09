import { Sun, Moon, Monitor, Play, Palette, Clock, Gamepad2, Droplets, Footprints, StretchHorizontal, Eye, PersonStanding, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SettingRow } from '@/components/SettingRow'
import { NumberInput } from '@/components/NumberInput'
import { ReminderSettings } from '@/components/ReminderSettings'

import { useSettingsStore } from '@/store/settingsStore'
import { useRuntimeStore } from '@/store/runtimeStore'
import type { ThemeMode, SettingsState } from '@/store/settingsStore'
import { useSetAutoLaunch } from '@/hooks/common/useInitAutoLaunch'

const SettingsPage = () => {
  const theme = useSettingsStore.use.theme()
  const setTheme = useSettingsStore.use.setTheme()
  const pomodoroTime = useSettingsStore.use.pomodoroTime()
  const pomodoroShortBreakTime = useSettingsStore.use.pomodoroShortBreakTime()
  const pomodoroLongBreakTime = useSettingsStore.use.pomodoroLongBreakTime()
  const autoStartEnabled = useSettingsStore.use.autoStartEnabled()
  const dailyPatataLimit = useSettingsStore.use.dailyPatataLimit()
  const updateSettings = useSettingsStore.use.updateSettings()
  const restReminderEnabled = useSettingsStore.use.restReminderEnabled()
  const restReminderInterval = useSettingsStore.use.restReminderInterval()
  const restReminderNotification = useSettingsStore.use.restReminderNotification()
  const restBreakDuration = useSettingsStore.use.restBreakDuration()
  const restReminderSkipInterval = useSettingsStore.use.restReminderSkipInterval()
  const waterReminderEnabled = useSettingsStore.use.waterReminderEnabled()
  const waterReminderInterval = useSettingsStore.use.waterReminderInterval()
  const dailyWaterGoal = useSettingsStore.use.dailyWaterGoal()
  const standReminderEnabled = useSettingsStore.use.standReminderEnabled()
  const standReminderInterval = useSettingsStore.use.standReminderInterval()
  const stretchReminderEnabled = useSettingsStore.use.stretchReminderEnabled()
  const stretchReminderInterval = useSettingsStore.use.stretchReminderInterval()
  const gazeReminderEnabled = useSettingsStore.use.gazeReminderEnabled()
  const gazeReminderInterval = useSettingsStore.use.gazeReminderInterval()
  const walkReminderEnabled = useSettingsStore.use.walkReminderEnabled()
  const walkReminderInterval = useSettingsStore.use.walkReminderInterval()
  const setAutoStartEnabled = useSetAutoLaunch()
  const resetPatata = useRuntimeStore.use.resetPatata()
  const resetRestReminder = useRuntimeStore.use.resetRestReminder()
  const isPatataRunning = useRuntimeStore.use.isPatataRunning()
  const restReminderTimeLeft = useRuntimeStore.use.restReminderTimeLeft()

  const themeOptions: { label: string; value: ThemeMode; icon: any }[] = [
    { label: '浅色', value: 'light', icon: Sun },
    { label: '深色', value: 'dark', icon: Moon },
    { label: '跟随系统', value: 'system', icon: Monitor },
  ]

  const handleChange = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    updateSettings({ [key]: value })
  }

  const handleResetPatata = () => {
    resetPatata()
  }

  const handleResetRestReminder = () => {
    resetRestReminder()
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
        <div className="space-y-4">
          <SettingRow label="每日娱乐时间限制" description="每天最多可用于娱乐的时间">
            <NumberInput
              value={dailyPatataLimit}
              min={0.1}
              max={240}
              showSeconds
              onSave={(value) => updateSettings({ dailyPatataLimit: value })}
              className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
            />
          </SettingRow>
          <SettingRow label="重置土豆钟" description="将土豆钟计时器重置为初始状态">
            <Button
              onClick={handleResetPatata}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              重置
              {isPatataRunning && <span className="ml-1 text-xs opacity-60">(运行中)</span>}
            </Button>
          </SettingRow>
        </div>
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
              <SettingRow label="重置休息提醒" description="将休息提醒倒计时重置为初始状态">
                <Button
                  onClick={handleResetRestReminder}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                  {restReminderTimeLeft > 0 && <span className="ml-1 text-xs opacity-60">(倒计时中)</span>}
                </Button>
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
