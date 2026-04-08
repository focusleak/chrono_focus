import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 CSS 类名
 * 结合 clsx 和 tailwind-merge，自动处理 Tailwind CSS 类名冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 工具函数重新导出（保持向后兼容，避免修改大量导入语句）
export { sendNotification, requestNotificationPermission, playSound } from '@/utils/notification'
export { formatDuration, formatMinutes, formatDate } from '@/utils/time'
export { getToday, createDefaultDailyStats, updateDailyStats, incrementDailyStat } from '@/utils/stats'

