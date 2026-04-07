import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 发送系统通知
export const sendNotification = async (title: string, body: string) => {
  try {
    console.log('[sendNotification] Attempting:', title, body)
    console.log('[sendNotification] electronAPI available:', !!window.electronAPI)
    if (window.electronAPI) {
      console.log('[sendNotification] Using Electron native notification')
      await window.electronAPI.showNotification(title, body)
    } else {
      console.log('[sendNotification] Using browser Notification, permission:', Notification.permission)
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

// 格式化秒数为 MM:SS 格式
export const formatDuration = (seconds: number): string => {
  const absSeconds = Math.abs(seconds)
  const mins = Math.floor(absSeconds / 60)
  const secs = absSeconds % 60
  const minsStr = String(mins).padStart(2, '0')
  const secsStr = String(secs).padStart(2, '0')
  return seconds < 0 ? `+${minsStr}:${secsStr}` : `${minsStr}:${secsStr}`
}
