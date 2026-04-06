import { useEffect, useRef } from 'react'
import { sendNotification, playSound } from '../utils/helpers'

/**
 * 通用提醒 Hook
 * @param enabled 是否启用
 * @param intervalMinutes 间隔时间（分钟）
 * @param title 通知标题
 * @param body 通知内容
 * @param condition 额外条件（默认为 true）
 */
export const useReminder = (
  enabled: boolean,
  intervalMinutes: number,
  title: string,
  body: string,
  condition: boolean = true,
) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (enabled && condition) {
      intervalRef.current = setInterval(() => {
        sendNotification(title, body)
        playSound('remind')
      }, intervalMinutes * 60 * 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, intervalMinutes, title, body, condition])
}
