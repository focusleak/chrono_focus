import { useInterval } from './common/useInterval'

import { useRuntimeStore } from '@/store/runtimeStore'

/**
 * 土豆钟计时 Hook
 * 
 * 管理娱乐时间（土豆钟）的倒计时逻辑
 * 当休息提醒弹窗显示时自动暂停计时
 * 与番茄钟互斥运行，避免同时计时
 * 
 * @returns void
 * 
 * @example
 * ```tsx
 * function PotatoPage() {
 *   usePotatoTimer()
 *   // ... 组件逻辑
 * }
 * ```
 */
export const usePotatoTimer = () => {
  const isPotatoRunning = useRuntimeStore.use.isPotatoRunning()
  const tickPotato = useRuntimeStore.use.tickPotato()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()
  
  // 每秒执行一次倒计时
  // 当休息提醒弹窗显示时暂停计时
  useInterval(tickPotato, 1000, isPotatoRunning && !showRestReminderPrompt)
}
