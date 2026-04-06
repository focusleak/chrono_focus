import { useEffect, useRef } from 'react'
import { useTimerStore } from '../store/timerStore'

export const usePotatoTimer = () => {
  const { isPotatoRunning, tickPotato } = useTimerStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isPotatoRunning) {
      intervalRef.current = setInterval(() => {
        tickPotato()
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPotatoRunning, tickPotato])
}
