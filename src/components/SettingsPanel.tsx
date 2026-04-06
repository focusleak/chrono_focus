import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom'
import { useTimerStore } from '../store/timerStore'
import { useThemeStore, type ThemeMode } from '../hooks/useThemeStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Sun, Moon, Monitor, ListTodo, Settings2, Bell, Droplets, Footprints, Eye, Timer, PersonStanding } from 'lucide-react'
import { SettingRow } from './SettingRow'
import TaskList from './TaskList'

// 设置侧边栏导航项
const navItems = [
  { id: '', label: '常规设置', icon: Settings2 },
  { id: 'activities', label: '活动管理', icon: ListTodo },
  { id: 'reminders', label: '提醒配置', icon: Bell },
]

const SettingsLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // 获取当前子路由
  const currentPath = location.pathname.replace('/settings', '').replace('/', '') || ''
  
  const handleNav = (id: string) => {
    navigate(`/settings/${id}`)
  }

  return (
    <div className="flex gap-8">
      {/* 左侧子导航 */}
      <div className="w-48 flex-shrink-0">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.id || (item.id === '' && currentPath === '')
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-[#2c2c2e]/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 dark:bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-sm">
          <Routes>
            <Route index element={<GeneralSettings />} />
            <Route path="activities" element={<ActivitiesSettings />} />
            <Route path="reminders" element={<RemindersSettings />} />
            <Route path="*" element={<Navigate to="/settings" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

// 常规设置
const GeneralSettings = () => {
  const { theme, setTheme } = useThemeStore()
  const { 
    pomodoroTime, shortBreakTime, longBreakTime,
    autoStartEnabled, setAutoStartEnabled,
    dailyPotatoLimit, setDailyPotatoLimit,
    updateSettings 
  } = useTimerStore()

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

// 活动管理
const ActivitiesSettings = () => {
  return (
    <div className="p-6">
      <TaskList />
    </div>
  )
}

// 提醒配置
const RemindersSettings = () => {
  const {
    restReminderEnabled, restReminderInterval,
    waterReminderEnabled, waterReminderInterval, dailyWaterGoal,
    standReminderEnabled, standReminderInterval,
    stretchReminderEnabled, stretchReminderInterval,
    gazeReminderEnabled, gazeReminderInterval,
    walkReminderEnabled, walkReminderInterval,
    updateSettings
  } = useTimerStore()

  const settings = {
    restReminderEnabled, restReminderInterval,
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
                <span className="text-sm text-gray-500 dark:text-gray-400">分钟</span>
              </div>
            </SettingRow>
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
                  <span className="text-sm text-gray-500 dark:text-gray-400">分钟</span>
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
                  <span className="text-sm text-gray-500 dark:text-gray-400">杯</span>
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
        <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">拉伸提醒</h3>
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

export default SettingsLayout
