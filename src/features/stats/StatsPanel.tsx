import { useState } from 'react'
import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { Flame, Clock, CheckSquare, Eye, Footprints, Droplets, Target, TrendingUp, Plus, Minus, PersonStanding, Gamepad2, Timer } from 'lucide-react'
import DailyStatsGrid from './DailyStatsGrid'
import { Button } from '@/components/ui/button'
import { StatCard, StatSection } from './StatCard'

type StatsCategory = 'overview' | 'focus' | 'potato' | 'water' | 'stand' | 'gaze' | 'walk'

const StatsPanel = () => {
  const completedPomodoros = useRuntimeStore.use.completedPomodoros()
  const totalFocusTime = useRuntimeStore.use.totalFocusTime()
  const waterCount = useRuntimeStore.use.waterCount()
  const gazeReminderCount = useRuntimeStore.use.gazeReminderCount()
  const walkReminderCount = useRuntimeStore.use.walkReminderCount()
  const standReminderCount = useRuntimeStore.use.standReminderCount()
  const potatoActivities = useRuntimeStore.use.potatoActivities()
  const tasks = useRuntimeStore.use.tasks()
  const dailyWaterGoal = useSettingsStore.use.dailyWaterGoal()
  const standReminderInterval = useSettingsStore.use.standReminderInterval()
  const dailyPotatoLimit = useSettingsStore.use.dailyPotatoLimit()

  const [selectedCategory, setSelectedCategory] = useState<StatsCategory>('overview')

  const completedTasks = tasks.filter((t: any) => t.isCompleted).length
  const totalTasks = tasks.length

  const categories = [
    { id: 'overview' as StatsCategory, label: '总览', icon: TrendingUp, color: 'text-gray-600 dark:text-gray-400' },
    { id: 'focus' as StatsCategory, label: '专注', icon: Target, color: 'text-red-500' },
    { id: 'potato' as StatsCategory, label: '娱乐', icon: Gamepad2, color: 'text-orange-500' },
    { id: 'water' as StatsCategory, label: '喝水', icon: Droplets, color: 'text-cyan-500' },
    { id: 'stand' as StatsCategory, label: '站立', icon: Footprints, color: 'text-blue-500' },
    { id: 'gaze' as StatsCategory, label: '远眺', icon: Eye, color: 'text-green-500' },
    { id: 'walk' as StatsCategory, label: '走动', icon: PersonStanding, color: 'text-purple-500' },
  ]

  const incrementWater = () => {
    const { incrementWater: storeIncrementWater } = useRuntimeStore.getState()
    storeIncrementWater()
  }

  const decrementWater = () => {
    const state = useRuntimeStore.getState()
    if (state.waterCount > 0) {
      useRuntimeStore.setState({ waterCount: state.waterCount - 1 })
    }
  }

  const renderContent = () => {
    switch (selectedCategory) {
      case 'focus':
        return (
          <StatSection
            icon={Flame}
            iconColor="text-red-500"
            bgColor="bg-red-50 dark:bg-red-900/10"
            borderColor="border-red-100 dark:border-red-900/30"
            title="专注时间统计"
            description="番茄钟工作模式数据"
          >
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Flame}
                iconColor="text-red-500"
                bgColor="bg-red-100 dark:bg-red-900/30"
                value={completedPomodoros}
                label="完成的番茄钟"
              />
              <StatCard
                icon={Clock}
                iconColor="text-red-500"
                bgColor="bg-red-100 dark:bg-red-900/30"
                value={totalFocusTime}
                label="专注时间（分钟）"
              />
              <StatCard
                icon={Target}
                iconColor="text-red-500"
                bgColor="bg-red-100 dark:bg-red-900/30"
                value={Math.round(totalFocusTime / 25)}
                label="等效番茄钟数"
              />
              <StatCard
                icon={Clock}
                iconColor="text-red-500"
                bgColor="bg-red-100 dark:bg-red-900/30"
                value={(totalFocusTime / 60).toFixed(1)}
                label="专注时间（小时）"
              />
            </div>
          </StatSection>
        )
      case 'potato':
        return (
          <StatSection
            icon={Gamepad2}
            iconColor="text-orange-500"
            bgColor="bg-orange-50 dark:bg-orange-900/10"
            borderColor="border-orange-100 dark:border-orange-900/30"
            title="娱乐时间统计"
            description="土豆钟休闲模式数据"
          >
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Timer}
                iconColor="text-orange-500"
                bgColor="bg-orange-100 dark:bg-orange-900/30"
                value={potatoActivities.reduce((sum: number, a: any) => sum + a.duration, 0)}
                label="已用时间（分钟）"
              />
              <StatCard
                icon={Timer}
                iconColor="text-orange-500"
                bgColor="bg-orange-100 dark:bg-orange-900/30"
                value={dailyPotatoLimit}
                label="每日限制（分钟）"
              />
              <StatCard
                icon={Timer}
                iconColor="text-orange-500"
                bgColor="bg-orange-100 dark:bg-orange-900/30"
                value={Math.max(0, dailyPotatoLimit - potatoActivities.reduce((sum: number, a: any) => sum + a.duration, 0))}
                label="剩余时间（分钟）"
              />
              <StatCard
                icon={Gamepad2}
                iconColor="text-orange-500"
                bgColor="bg-orange-100 dark:bg-orange-900/30"
                value={potatoActivities.length}
                label="娱乐活动数"
              />
            </div>
          </StatSection>
        )
      case 'water':
        return (
          <StatSection
            icon={Droplets}
            iconColor="text-cyan-500"
            bgColor="bg-cyan-50 dark:bg-cyan-900/10"
            borderColor="border-cyan-100 dark:border-cyan-900/30"
            title="喝水情况统计"
            description="每日饮水记录"
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard
                icon={Droplets}
                iconColor="text-cyan-500"
                bgColor="bg-cyan-100 dark:bg-cyan-900/30"
                value={`${waterCount}/${dailyWaterGoal}`}
                label="今日喝水（杯）"
              />
              <StatCard
                icon={Droplets}
                iconColor="text-cyan-500"
                bgColor="bg-cyan-100 dark:bg-cyan-900/30"
                value={`${Math.round((waterCount / dailyWaterGoal) * 100)}%`}
                label="完成进度"
              />
              <StatCard
                icon={Droplets}
                iconColor="text-cyan-500"
                bgColor="bg-cyan-100 dark:bg-cyan-900/30"
                value={dailyWaterGoal - waterCount}
                label="还需喝（杯）"
              />
              <StatCard
                icon={Droplets}
                iconColor="text-cyan-500"
                bgColor="bg-cyan-100 dark:bg-cyan-900/30"
                value={dailyWaterGoal * 250}
                label="每日目标（ml）"
              />
            </div>
            {/* 快速记录喝水 */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={decrementWater}
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 border-gray-300 dark:border-gray-600"
                disabled={waterCount <= 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 w-12 text-center">{waterCount}</span>
              <Button
                onClick={incrementWater}
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400">杯</span>
            </div>
          </StatSection>
        )
      case 'stand':
        return (
          <StatSection
            icon={Footprints}
            iconColor="text-blue-500"
            bgColor="bg-blue-50 dark:bg-blue-900/10"
            borderColor="border-blue-100 dark:border-blue-900/30"
            title="站立提醒统计"
            description="久坐起身提醒记录"
          >
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Footprints}
                iconColor="text-blue-500"
                bgColor="bg-blue-100 dark:bg-blue-900/30"
                value={standReminderCount}
                label="今日站立次数"
              />
              <StatCard
                icon={Footprints}
                iconColor="text-blue-500"
                bgColor="bg-blue-100 dark:bg-blue-900/30"
                value={standReminderInterval}
                label="提醒间隔（分钟）"
              />
            </div>
          </StatSection>
        )
      case 'gaze':
        return (
          <StatSection
            icon={Eye}
            iconColor="text-green-500"
            bgColor="bg-green-50 dark:bg-green-900/10"
            borderColor="border-green-100 dark:border-green-900/30"
            title="远眺提醒统计"
            description="保护视力提醒记录"
          >
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Eye}
                iconColor="text-green-500"
                bgColor="bg-green-100 dark:bg-green-900/30"
                value={gazeReminderCount}
                label="今日远眺次数"
              />
              <StatCard
                icon={Eye}
                iconColor="text-green-500"
                bgColor="bg-green-100 dark:bg-green-900/30"
                value="20-20-20"
                label="护眼法则"
              />
            </div>
          </StatSection>
        )
      case 'walk':
        return (
          <StatSection
            icon={PersonStanding}
            iconColor="text-purple-500"
            bgColor="bg-purple-50 dark:bg-purple-900/10"
            borderColor="border-purple-100 dark:border-purple-900/30"
            title="走动提醒统计"
            description="起身活动提醒记录"
          >
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={PersonStanding}
                iconColor="text-purple-500"
                bgColor="bg-purple-100 dark:bg-purple-900/30"
                value={walkReminderCount}
                label="今日走动次数"
              />
              <StatCard
                icon={PersonStanding}
                iconColor="text-purple-500"
                bgColor="bg-purple-100 dark:bg-purple-900/30"
                value="~500"
                label="建议步数/次"
              />
            </div>
          </StatSection>
        )
      default:
        return (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={Flame}
                iconColor="text-red-500"
                bgColor="bg-red-100 dark:bg-red-900/30"
                value={completedPomodoros}
                label="完成的番茄钟"
              />

              <StatCard
                icon={Clock}
                iconColor="text-blue-500"
                bgColor="bg-blue-100 dark:bg-blue-900/30"
                value={totalFocusTime}
                label="专注时间（分钟）"
              />

              <StatCard
                icon={Droplets}
                iconColor="text-cyan-500"
                bgColor="bg-cyan-100 dark:bg-cyan-900/30"
                value={`${waterCount}/${dailyWaterGoal}`}
                label="喝水进度（杯）"
              />

              <StatCard
                icon={CheckSquare}
                iconColor="text-green-500"
                bgColor="bg-green-100 dark:bg-green-900/30"
                value={`${completedTasks}/${totalTasks}`}
                label="任务进度"
              />

              {/* 娱乐 */}
              <StatCard
                icon={Timer}
                iconColor="text-orange-500"
                bgColor="bg-orange-100 dark:bg-orange-900/30"
                value={potatoActivities.reduce((sum: number, a: any) => sum + a.duration, 0)}
                label="娱乐时间（分钟）"
              />

              {/* 站立 */}
              <StatCard
                icon={Footprints}
                iconColor="text-blue-500"
                bgColor="bg-blue-100 dark:bg-blue-900/30"
                value={standReminderCount}
                label="站立次数"
              />

              {/* 远眺 */}
              <StatCard
                icon={Eye}
                iconColor="text-green-500"
                bgColor="bg-green-100 dark:bg-green-900/30"
                value={gazeReminderCount}
                label="远眺次数"
              />

              {/* 走动 */}
              <StatCard
                icon={PersonStanding}
                iconColor="text-purple-500"
                bgColor="bg-purple-100 dark:bg-purple-900/30"
                value={walkReminderCount}
                label="走动次数"
              />
            </div>

            <DailyStatsGrid title="每日统计" />
          </>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* 分类选择 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c2c2e]'
              }`}
            >
              <Icon className={`w-4 h-4 ${cat.color}`} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {renderContent()}
    </div>
  )
}

export default StatsPanel
