import { useInterval } from './useInterval'

import { sendNotification } from '@/lib/utils'

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
  useInterval(
    () => {
      sendNotification(title, body)
      // playSound('remind')
    },
    intervalMinutes * 60 * 1000,
    enabled && condition,
  )
}
