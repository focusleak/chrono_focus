import { format } from 'date-fns'

import type { DailyStats } from '@/types'

/**
 * 获取今天的日期字符串 (yyyy-MM-dd)
 */
export const getToday = (): string => {
  return format(new Date(), "yyyy-MM-dd")
}

/**
 * 创建默认的 DailyStats 对象
 */
export const createDefaultDailyStats = (date: string): DailyStats => {
  return {
    date,
    pomodoros: 0,
    focusTime: 0,
    waterCount: 0,
    tasksCompleted: 0,
    potatoTime: 0
  }
}

/**
 * 更新每日统计数据
 * 如果今天已有记录则更新，否则创建新记录
 */
export const updateDailyStats = (
  dailyStats: DailyStats[],
  updates: Partial<DailyStats>
): DailyStats[] => {
  const today = getToday()
  const todayStats = dailyStats.find(s => s.date === today)

  if (todayStats) {
    return dailyStats.map(s =>
      s.date === today ? { ...s, ...updates } : s
    )
  }

  return [...dailyStats, { ...createDefaultDailyStats(today), ...updates }]
}

/**
 * 增加每日统计值
 */
export const incrementDailyStat = <K extends keyof DailyStats>(
  dailyStats: DailyStats[],
  key: K,
  increment: number = 1
): DailyStats[] => {
  const today = getToday()
  const todayStats = dailyStats.find(s => s.date === today)

  if (todayStats) {
    return dailyStats.map(s =>
      s.date === today
        ? { ...s, [key]: (s[key] as number) + increment }
        : s
    )
  }

  return [...dailyStats, { ...createDefaultDailyStats(today), [key]: increment }]
}
