import { useRuntimeStore } from '../store/runtimeStore'
import { useInterval } from './useInterval'

export const usePotatoTimer = () => {
  const isPotatoRunning = useRuntimeStore.use.isPotatoRunning()
  const tickPotato = useRuntimeStore.use.tickPotato()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()
  // 当休息提醒弹窗显示时暂停
  useInterval(tickPotato, 1000, isPotatoRunning && !showRestReminderPrompt)
}
