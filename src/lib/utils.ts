import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { sendNotification, requestNotificationPermission, playSound } from '@/utils/notification'
import { formatDuration } from '@/utils/time'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 重新导出以便现有代码不需要修改
export { sendNotification, requestNotificationPermission, playSound, formatDuration }
