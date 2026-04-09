import { useEffect } from 'react'

import { useSettingsStore } from '@/store/settingsStore'

/**
 * 主题同步 Hook
 * 
 * 根据设置同步应用主题（浅色/深色/跟随系统）
 * 当选择跟随系统时，自动监听系统主题变化
 * 
 * @returns {{ theme: ThemeMode, setTheme: (theme: ThemeMode) => void }} 当前主题和设置函数
 * 
 * @example
 * ```tsx
 * function App() {
 *   const { theme, setTheme } = useThemeSync()
 *   // ... 组件逻辑
 * }
 * ```
 */
export const useThemeSync = () => {
  const theme = useSettingsStore.use.theme()
  const setTheme = useSettingsStore.use.setTheme()

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
  }, [theme, setTheme])

  return { theme, setTheme }
}

export default useThemeSync
