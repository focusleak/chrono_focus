import { useStore } from '../../store/store'
import { useThemeStore, type ThemeMode } from '../../hooks/useThemeStore'
import { useSetAutoLaunch } from '../../hooks/useInitAutoLaunch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Sun, Moon, Monitor, Play, Palette, Clock, Coffee, Droplets, Footprints, StretchHorizontal, Eye, PersonStanding } from 'lucide-react'
import { SettingRow } from './SettingRow'

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore()
  const {
    pomodoroTime, shortBreakTime, longBreakTime,
    autoStartEnabled,
    dailyPotatoLimit, setDailyPotatoLimit,
    restReminderEnabled, restReminderInterval, restReminderNotification,
    waterReminderEnabled, waterReminderInterval, dailyWaterGoal,
    standReminderEnabled, standReminderInterval,
    stretchReminderEnabled, stretchReminderInterval,
    gazeReminderEnabled, gazeReminderInterval,
    walkReminderEnabled, walkReminderInterval,
    updateSettings
  } = useStore()
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
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={60}
                value={pomodoroTime}
                onChange={(e) => handleChange('pomodoroTime', parseInt(e.target.value))}
                className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
            </div>
          </SettingRow>
          <SettingRow label="短休息时长" description="短休息时间">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={30}
                value={shortBreakTime}
                onChange={(e) => handleChange('shortBreakTime', parseInt(e.target.value))}
                className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
            </div>
          </SettingRow>
          <SettingRow label="长休息时长" description="长休息时间">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={60}
                value={longBreakTime}
                onChange={(e) => handleChange('longBreakTime', parseInt(e.target.value))}
                className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
            </div>
          </SettingRow>
        </div>
      </div>

      {/* 土豆钟设置 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Coffee className="w-4 h-4" />
          土豆钟
        </h3>
        <SettingRow label="每日娱乐时间限制" description="每天最多可用于娱乐的时间">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={5}
              max={240}
              value={dailyPotatoLimit}
              onChange={(e) => setDailyPotatoLimit(parseInt(e.target.value))}
              className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
          </div>
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
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={restReminderInterval}
                    onChange={(e) => handleChange('restReminderInterval', parseInt(e.target.value))}
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
              checked={waterReminderEnabled}
              onCheckedChange={(checked) => handleChange('waterReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {waterReminderEnabled && (
            <>
              <SettingRow label="提醒间隔" description="每隔多久提醒一次">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={waterReminderInterval}
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
                    value={dailyWaterGoal}
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
              checked={standReminderEnabled}
              onCheckedChange={(checked) => handleChange('standReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {standReminderEnabled && (
            <SettingRow label="提醒间隔" description="坐多久后提醒">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={standReminderInterval}
                  onChange={(e) => handleChange('standReminderInterval', parseInt(e.target.value))}
                  className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
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
              checked={stretchReminderEnabled}
              onCheckedChange={(checked) => handleChange('stretchReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {stretchReminderEnabled && (
            <SettingRow label="提醒间隔" description="每隔多久提醒一次">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={stretchReminderInterval}
                  onChange={(e) => handleChange('stretchReminderInterval', parseInt(e.target.value))}
                  className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
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
              checked={gazeReminderEnabled}
              onCheckedChange={(checked) => handleChange('gazeReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {gazeReminderEnabled && (
            <SettingRow label="提醒间隔" description="每隔多久提醒一次">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={gazeReminderInterval}
                  onChange={(e) => handleChange('gazeReminderInterval', parseInt(e.target.value))}
                  className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
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
              checked={walkReminderEnabled}
              onCheckedChange={(checked) => handleChange('walkReminderEnabled', checked)}
              className="data-[state=checked]:bg-[#34c759]"
            />
          </SettingRow>
          {walkReminderEnabled && (
            <SettingRow label="提醒间隔" description="每隔多久提醒一次">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={walkReminderInterval}
                  onChange={(e) => handleChange('walkReminderInterval', parseInt(e.target.value))}
                  className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 w-8">分钟</span>
              </div>
            </SettingRow>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
