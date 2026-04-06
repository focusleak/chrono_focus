import { format, intervalToDuration, isSameDay, parseISO } from 'date-fns'

// 格式化时间为 MM:SS (使用 date-fns)
export const formatTime = (seconds: number): string => {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 })
  const mins = duration.minutes || 0
  const secs = duration.seconds || 0
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化时间为更易读的形式
export const formatTimeReadable = (seconds: number): string => {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 })
  const mins = duration.minutes || 0
  const secs = duration.seconds || 0
  if (mins === 0) return `${secs}秒`
  if (secs === 0) return `${mins}分钟`
  return `${mins}分${secs}秒`
}

// 获取今天的日期字符串 (YYYY-MM-DD)
export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd')
}

// 检查两个日期是否是同一天
export const isSameDayCheck = (date1: string, date2: string): boolean => {
  return isSameDay(parseISO(date1), parseISO(date2))
}

// 格式化日期为本地显示格式
export const formatDateDisplay = (dateStr: string): string => {
  return format(parseISO(dateStr), 'yyyy-MM-dd')
}

// 发送系统通知
export const sendNotification = async (title: string, body: string) => {
  try {
    if (window.electronAPI) {
      await window.electronAPI.showNotification(title, body)
    } else {
      // 浏览器环境使用 Web Notification API
      if (Notification.permission === 'granted') {
        new Notification(title, { body })
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification(title, { body })
        }
      }
    }
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}

// 请求通知权限
export const requestNotificationPermission = async () => {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.requestNotificationPermission()
    } else {
      if (Notification.permission === 'granted') return true
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      }
      return false
    }
  } catch (error) {
    console.error('Failed to request notification permission:', error)
    return false
  }
}

// 播放提示音
export const playSound = (type: 'complete' | 'remind' = 'complete') => {
  // 使用 Web Audio API 创建简单的提示音
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  if (type === 'complete') {
    oscillator.frequency.value = 800
    gainNode.gain.value = 0.3
  } else {
    oscillator.frequency.value = 600
    gainNode.gain.value = 0.2
  }

  oscillator.start()
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5)
  oscillator.stop(audioContext.currentTime + 0.5)
}
