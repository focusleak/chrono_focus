import { create } from 'zustand'
import { storage } from '../lib/storage'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

const getInitialTheme = (): ThemeMode => {
  const saved = storage.get<string>('theme-mode')
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved
  }
  return 'system'
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => set({ theme }),
}))
