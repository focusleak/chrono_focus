import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { formatDuration } from '../utils/time'

export const sendNotification = async (title: string, body: string) => {
  try {
    if (window.electronAPI) {
      await window.electronAPI.showNotification(title, body)
    } else {
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
