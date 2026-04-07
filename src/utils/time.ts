/**
 * 时间格式化工具
 */

/**
 * 将秒数格式化为 mm:ss 或 HH:mm:ss 格式
 */
export const formatDuration = (seconds: number): string => {
  const absSeconds = Math.abs(seconds)
  const sign = seconds < 0 ? '-' : ''
  
  if (absSeconds >= 3600) {
    const hours = Math.floor(absSeconds / 3600)
    const minutes = Math.floor((absSeconds % 3600) / 60)
    const secs = absSeconds % 60
    return `${sign}${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  
  const minutes = Math.floor(absSeconds / 60)
  const secs = absSeconds % 60
  return `${sign}${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 将分钟数格式化为人性化描述
 */
export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}小时`
  return `${hours}小时${mins}分钟`
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
