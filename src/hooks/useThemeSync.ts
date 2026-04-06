import { useEffect } from 'react'
import { useThemeStore } from '@/hooks/useThemeStore'
import { storage } from '../lib/storage'

export const useThemeSync = () => {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.add('light')
    } else {
      // 跟随系统
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.add('light')
      }

      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        if (theme === 'system') {
          if (e.matches) {
            root.classList.add('dark')
          } else {
            root.classList.add('light')
          }
        }
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    storage.set('theme-mode', theme)
  }, [theme])

  return { theme, setTheme }
}

export default useThemeSync
