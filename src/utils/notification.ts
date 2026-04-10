/**
 * 通知工具函数
 * 使用策略模式自动适配 Electron 和浏览器环境
 */

import { createNotificationStrategy } from './platform-strategies'

let audioContext: AudioContext | null = null

const getAudioContext = (): AudioContext => {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

/**
 * 发送通知（自动选择 Electron 或浏览器原生通知）
 */
export const sendNotification = async (title: string, body: string) => {
  try {
    const strategy = createNotificationStrategy()
    await strategy.show(title, body)
    playSound('remind')
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}

/**
 * 请求通知权限（自动选择 Electron 或浏览器原生 API）
 */
export const requestNotificationPermission = async () => {
  try {
    const strategy = createNotificationStrategy()
    return await strategy.requestPermission()
  } catch (error) {
    console.error('Failed to request notification permission:', error)
    return false
  }
}

/**
 * 播放提示音
 */
export const playSound = (type: 'complete' | 'remind' = 'complete') => {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    if (type === 'complete') {
      oscillator.frequency.value = 800
      gainNode.gain.value = 0.3
    } else {
      oscillator.frequency.value = 600
      gainNode.gain.value = 0.2
    }

    oscillator.start()
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5)
    oscillator.stop(ctx.currentTime + 0.5)
  } catch (error) {
    console.error('Failed to play sound:', error)
  }
}
