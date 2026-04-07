import { useStore } from '../store/store'
import { useInterval } from './useInterval'

export const usePotatoTimer = () => {
  const { isPotatoRunning, tickPotato } = useStore()
  useInterval(tickPotato, 1000, isPotatoRunning)
}
