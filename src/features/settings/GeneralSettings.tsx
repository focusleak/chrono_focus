import { useStore } from '../../store/store'
import { useThemeStore, type ThemeMode } from '../../hooks/useThemeStore'
import { useSetAutoLaunch } from '../../hooks/useInitAutoLaunch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Sun, Moon, Monitor } from 'lucide-react'
import { SettingRow } from './SettingRow'

// 常规设置
const GeneralSettings = () => {
  const { theme, setTheme } = useThemeStore()
  const {
    pomodoroTime, shortBreakTime, longBreakTime,
    autoStartEnabled,
    dailyPotatoLimit, setDailyPotatoLimit,
    updateSettings
  } = useStore()
  const setAutoStartEnabled = useSetAutoLaunch()

  const themeOptions: { label: string; value: ThemeMode; icon: any }[] = [
    { label: '亮色', value: 'light', icon: Sun },
    { label: '暗色', value: 'dark', icon: Moon },
    { label: '跟随系统', value: 'system', icon: Monitor },
  ]

  const handleChange = (key: string, value: any) => {
    updateSettings({ [key]: value })
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* 启动设置 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">启动设置</h3>
        <div className="space-y-4">
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
          {autoStartEnabled && (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2c2c2e] rounded-lg p-3">
              <p className="font-medium mb-1">macOS 系统开机自启动设置</p>
              <p className="mb-2">运行以下命令设置系统级开机自启动：</p>
              <code className="block bg-gray-200 dark:bg-[#3a3a3c] px-2 py-1 rounded text-xs font-mono">
                ./setup-autostart.sh
              </code>
            </div>
          )}
        </div>
      </div>

      {/* 外观设置 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">外观</h3>
        <div className="space-y-4">
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
      </div>

      {/* 番茄钟设置 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">番茄钟</h3>
        <div className="space-y-4">
          <SettingRow
            label="番茄钟时长"
            description="工作时间"
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={60}
                value={pomodoroTime}
                onChange={(e) => handleChange('pomodoroTime', parseInt(e.target.value))}
                className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">分钟</span>
            </div>
          </SettingRow>
          <SettingRow
            label="短休息时长"
            description="短休息时间"
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={30}
                value={shortBreakTime}
                onChange={(e) => handleChange('shortBreakTime', parseInt(e.target.value))}
                className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">分钟</span>
            </div>
          </SettingRow>
          <SettingRow
            label="长休息时长"
            description="长休息时间"
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={60}
                value={longBreakTime}
                onChange={(e) => handleChange('longBreakTime', parseInt(e.target.value))}
                className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">分钟</span>
            </div>
          </SettingRow>
        </div>
      </div>

      {/* 土豆钟设置 */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">土豆钟</h3>
        <SettingRow
          label="每日娱乐时间限制"
          description="每天最多可用于娱乐的时间"
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={5}
              max={240}
              value={dailyPotatoLimit}
              onChange={(e) => setDailyPotatoLimit(parseInt(e.target.value))}
              className="w-20 h-9 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-[#3a3a3c]"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">分钟</span>
          </div>
        </SettingRow>
      </div>
    </div>
  )
}

export default GeneralSettings
