import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface SettingsState {
  /** 番茄钟时长（分钟） */
  pomodoroTime: number
  /** 番茄钟短休息时长（分钟） */
  pomodoroShortBreakTime: number
  /** 番茄钟长休息时长（分钟） */
  pomodoroLongBreakTime: number
  /** 是否启用休息提醒 */
  restReminderEnabled: boolean
  /** 休息提醒间隔（分钟） */
  restReminderInterval: number
  /** 休息提醒时是否发送通知 */
  restReminderNotification: boolean
  /** 休息时长（分钟） */
  restBreakDuration: number
  /** 跳过休息后再次提醒的间隔（分钟） */
  restReminderSkipInterval: number
  /** 是否启用喝水提醒 */
  waterReminderEnabled: boolean
  /** 喝水提醒间隔（分钟） */
  waterReminderInterval: number
  /** 每日喝水目标（杯） */
  dailyWaterGoal: number
  /** 是否启用站立提醒 */
  standReminderEnabled: boolean
  /** 站立提醒间隔（分钟） */
  standReminderInterval: number
  /** 是否启用拉伸提醒 */
  stretchReminderEnabled: boolean
  /** 拉伸提醒间隔（分钟） */
  stretchReminderInterval: number
  /** 是否启用远眺提醒 */
  gazeReminderEnabled: boolean
  /** 远眺提醒间隔（分钟） */
  gazeReminderInterval: number
  /** 是否启用走动提醒 */
  walkReminderEnabled: boolean
  /** 走动提醒间隔（分钟） */
  walkReminderInterval: number
  /** 每日娱乐时间限制（分钟） */
  dailyPotatoLimit: number
  /** 是否启用开机自启动 */
  autoStartEnabled: boolean
  /** 主题模式 */
  theme: ThemeMode

  /** 批量更新设置 */
  updateSettings: (settings: Partial<SettingsState>) => void
  /** 设置每日娱乐时间限制 */
  setDailyPotatoLimit: (minutes: number) => void
  /** 设置开机自启动状态 */
  setAutoStartEnabled: (enabled: boolean) => void
  /** 设置主题 */
  setTheme: (theme: ThemeMode) => void
}


export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pomodoroTime: 25,
      pomodoroShortBreakTime: 5,
      pomodoroLongBreakTime: 15,
      restReminderEnabled: true,
      restReminderInterval: 30,
      restReminderNotification: true,
      restBreakDuration: 5,
      restReminderSkipInterval: 1,
      waterReminderEnabled: true,
      waterReminderInterval: 60,
      dailyWaterGoal: 8,
      standReminderEnabled: true,
      standReminderInterval: 45,
      stretchReminderEnabled: true,
      stretchReminderInterval: 30,
      gazeReminderEnabled: true,
      gazeReminderInterval: 20,
      walkReminderEnabled: true,
      walkReminderInterval: 60,
      dailyPotatoLimit: 60,
      autoStartEnabled: false,
      theme: 'system',


      updateSettings: (settings: Partial<SettingsState>) => {
        set((state) => ({ ...state, ...settings }))
      },

      setDailyPotatoLimit: (minutes: number) => {
        set({ dailyPotatoLimit: minutes })
      },

      setAutoStartEnabled: (enabled: boolean) => {
        set({ autoStartEnabled: enabled })
      },

      setTheme: (theme: ThemeMode) => {
        set({ theme })
      },
    }),
    {
      name: 'chrono-focus-settings',
    },
  ),
)
