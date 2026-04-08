import { useMemo, useState } from 'react'
import { useRuntimeStore } from '../../store/runtimeStore'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/segmented'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  format,
  addMonths,
  addYears,
  subMonths,
  subYears,
  isToday,
  isAfter,
  isSameDay,
} from 'date-fns'

interface DailyStatsGridProps {
  title?: string
}

type ViewMode = 'month' | 'year'

const DailyStatsGrid = ({ title = '每日统计' }: DailyStatsGridProps) => {
  const dailyStats = useRuntimeStore.use.dailyStats()
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDateRange = useMemo(() => {
    if (viewMode === 'month') {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      return { start, end, label: format(currentDate, 'yyyy年MM月') }
    } else {
      const start = startOfYear(currentDate)
      const end = endOfYear(currentDate)
      return { start, end, label: format(currentDate, 'yyyy年') }
    }
  }, [viewMode, currentDate])

  const stats = useMemo(() => {
    return dailyStats.filter((s: any) => {
      const date = new Date(s.date)
      return (isAfter(date, getDateRange.start) || isSameDay(date, getDateRange.start)) &&
             (isAfter(getDateRange.end, date) || isSameDay(date, getDateRange.end))
    })
  }, [dailyStats, getDateRange])

  const dateList = useMemo(() => {
    return eachDayOfInterval({ start: getDateRange.start, end: getDateRange.end }).map(date =>
      format(date, 'yyyy-MM-dd')
    )
  }, [getDateRange])

  const weeks = useMemo(() => {
    const weeks: string[][] = []
    let currentWeek: string[] = []

    const firstDay = new Date(dateList[0])
    const firstDayOfWeek = firstDay.getDay()

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push('')
    }

    for (const date of dateList) {
      const dayOfWeek = new Date(date).getDay()

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      currentWeek.push(date)
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return weeks
  }, [dateList])

  const getDayStats = (date: string) => {
    return stats.find((s: any) => s.date === date)
  }

  const getColorIntensity = (pomodoros: number) => {
    if (pomodoros === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (pomodoros <= 2) return 'bg-red-200 dark:bg-red-900/40'
    if (pomodoros <= 4) return 'bg-red-300 dark:bg-red-800/50'
    if (pomodoros <= 6) return 'bg-red-400 dark:bg-red-700/60'
    if (pomodoros <= 8) return 'bg-red-500 dark:bg-red-600/70'
    return 'bg-red-600 dark:bg-red-500/80'
  }

  const cellSize = viewMode === 'month' ? 'w-5 h-5' : 'w-3 h-3'

  const totalPomodoros = stats.reduce((sum: number, s: any) => sum + s.pomodoros, 0)
  const totalFocusMinutes = stats.reduce((sum: number, s: any) => sum + s.focusTime, 0)
  const totalWater = stats.reduce((sum: number, s: any) => sum + s.waterCount, 0)
  const totalTasks = stats.reduce((sum: number, s: any) => sum + s.tasksCompleted, 0)
  const totalPotatoTime = stats.reduce((sum: number, s: any) => sum + (s.potatoTime || 0), 0)
  const activeDays = stats.filter((s: any) => s.pomodoros > 0).length

  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(subYears(currentDate, 1))
    }
  }

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addYears(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title}</h3>

        <Segmented
          options={[
            { label: '按月', value: 'month' },
            { label: '按年', value: 'year' }
          ]}
          value={viewMode}
          onChange={(value) => setViewMode(value as ViewMode)}
        />
      </div>

      <div className="flex items-center justify-between bg-gray-50 dark:bg-[#2c2c2e] p-3 rounded-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="text-center">
          <div className="font-medium">{getDateRange.label}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            活跃 {activeDays} 天
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={viewMode === 'month'
            ? (isAfter(currentDate, addMonths(new Date(), 0)) || isSameDay(currentDate, startOfMonth(new Date())))
            : (isAfter(currentDate, addYears(new Date(), 0)) || isSameDay(currentDate, startOfYear(new Date())))
          }
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="link"
          size="sm"
          onClick={goToToday}
          className="ml-2"
        >
          今天
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalPomodoros}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">番茄钟</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round(totalFocusMinutes / 60)}h</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">专注时间</div>
        </div>
        <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{totalWater}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">喝水杯数</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalTasks}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">完成任务</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalPotatoTime}m</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">娱乐时间</div>
        </div>
      </div>

      <TooltipProvider>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1 min-w-fit">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <div key={`empty-${dayIndex}`} className="w-3 h-3" />
                  }

                  const dayStats = getDayStats(date)
                  const pomodoros = dayStats?.pomodoros || 0
                  const colorClass = getColorIntensity(pomodoros)
                  const isCurrentDay = isToday(new Date(date))

                  return (
                    <Tooltip key={date}>
                      <TooltipTrigger asChild>
                        <div
                          className={`${cellSize} rounded-sm ${colorClass} cursor-pointer hover:ring-2 hover:ring-gray-400 transition-all ${
                            isCurrentDay ? 'ring-2 ring-blue-500' : ''
                          }`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div className="font-medium mb-1">{date}</div>
                          <div>{pomodoros} 个番茄钟</div>
                          <div>{dayStats?.focusTime || 0} 分钟</div>
                          <div>{dayStats?.waterCount || 0} 杯水</div>
                          <div>{dayStats?.tasksCompleted || 0} 个任务</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
            <span>少</span>
            <div className={`${cellSize} bg-gray-100 dark:bg-gray-800 rounded-sm`} />
            <div className={`${cellSize} bg-red-200 dark:bg-red-900/40 rounded-sm`} />
            <div className={`${cellSize} bg-red-300 dark:bg-red-800/50 rounded-sm`} />
            <div className={`${cellSize} bg-red-400 dark:bg-red-700/60 rounded-sm`} />
            <div className={`${cellSize} bg-red-500 dark:bg-red-600/70 rounded-sm`} />
            <div className={`${cellSize} bg-red-600 dark:bg-red-500/80 rounded-sm`} />
            <span>多</span>
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}

export default DailyStatsGrid
