import { useStore } from '../store/store'
import { useInterval } from './useInterval'

export const usePotatoTimer = () => {
  const { isPotatoRunning, tickPotato, showRestReminderPrompt } = useStore()
  // 当休息提醒弹窗显示时暂停
  useInterval(tickPotato, 1000, isPotatoRunning && !showRestReminderPrompt)
}
