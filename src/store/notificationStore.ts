import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createSelectors } from '@/store/createSelectors'

/**
 * 通知类型
 */
export type NotificationType =
  | 'task_due' // 任务到期
  | 'task_overdue' // 任务过期
  | 'review_reminder' // 复盘提醒
  | 'risk_warning' // 风险预警
  | 'goal_milestone' // 目标里程碑
  | 'pdca_stage' // PDCA 阶段提醒
  | 'resource_alert' // 资源预警
  | 'system' // 系统通知

/**
 * 通知优先级
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * 通知状态
 */
export type NotificationStatus = 'unread' | 'read' | 'archived'

/**
 * 通知
 */
export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  actionUrl?: string // 点击跳转链接
  actionLabel?: string // 操作按钮文案
  status: NotificationStatus
  createdAt: string
  readAt?: string
  archivedAt?: string
  // 关联数据
  relatedId?: string // 关联的目标/任务/复盘 ID
  relatedType?: 'goal' | 'task' | 'review' | 'pdca' | 'risk'
}

/**
 * 提醒规则
 */
export interface ReminderRule {
  id: string
  enabled: boolean
  type: NotificationType
  advanceTime: number // 提前时间（分钟）
  channels: NotificationChannel[]
}

/**
 * 通知渠道
 */
export type NotificationChannel = 'in_app' | 'email' | 'desktop'

/**
 * 通知设置
 */
export interface NotificationSettings {
  // 全局设置
  enabled: boolean
  dndMode: {
    enabled: boolean
    startTime: string // HH:mm
    endTime: string // HH:mm
  }
  // 频率限制
  maxPerHour: number
  maxPerDay: number
  // 渠道设置
  channels: {
    inApp: boolean
    desktop: boolean
    email: boolean
  }
  // 各类提醒的设置
  reminders: {
    taskDue: { enabled: boolean; advanceMinutes: number[] } // [60, 1440, 4320] = 1h, 1d, 3d
    taskOverdue: { enabled: boolean; frequency: 'once' | 'daily' }
    reviewReminder: { enabled: boolean; dayOfWeek?: number } // 0=Sunday
    riskWarning: { enabled: boolean; realTime: boolean }
    goalMilestone: { enabled: boolean }
    pdcaStage: { enabled: boolean }
    resourceAlert: { enabled: boolean; threshold: number } // 使用率阈值
  }
}

/**
 * 通知统计
 */
export interface NotificationStats {
  total: number
  unread: number
  read: number
  archived: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
}

/**
 * 提醒与通知状态
 */
export interface NotificationState {
  // ========== 状态 ==========
  notifications: Notification[]
  settings: NotificationSettings
  sentCount: { hour: number; day: number; lastReset: string }

  // ========== 通知管理 ==========
  addNotification: (notification: Omit<Notification, 'id' | 'status' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  archiveNotification: (id: string) => void
  archiveAllNotifications: () => void
  deleteNotification: (id: string) => void
  clearAllNotifications: () => void

  // ========== 设置 ==========
  updateSettings: (settings: Partial<NotificationSettings>) => void
  toggleDndMode: (enabled: boolean) => void
  toggleReminder: (type: keyof NotificationSettings['reminders'], enabled: boolean) => void

  // ========== 智能提醒 ==========
  checkAndGenerateReminders: () => void
  isInDndPeriod: () => boolean
  canSendNotification: () => boolean

  // ========== 查询 ==========
  getUnreadNotifications: () => Notification[]
  getNotifications: () => Notification[]
  getStats: () => NotificationStats
  getSettings: () => NotificationSettings
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  dndMode: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
  maxPerHour: 10,
  maxPerDay: 50,
  channels: {
    inApp: true,
    desktop: true,
    email: false,
  },
  reminders: {
    taskDue: { enabled: true, advanceMinutes: [60, 1440, 4320] }, // 1h, 1d, 3d
    taskOverdue: { enabled: true, frequency: 'daily' },
    reviewReminder: { enabled: true, dayOfWeek: 0 }, // Sunday
    riskWarning: { enabled: true, realTime: true },
    goalMilestone: { enabled: true },
    pdcaStage: { enabled: true },
    resourceAlert: { enabled: true, threshold: 90 },
  },
}

export const useNotificationStore = createSelectors(create<NotificationState>()(
  immer(persist(
    (set, get) => ({
      // ========== 初始状态 ==========
      notifications: [],
      settings: DEFAULT_SETTINGS,
      sentCount: { hour: 0, day: 0, lastReset: new Date().toISOString() },

      // ========== 通知管理 ==========
      addNotification: (notification) => {
        const { canSendNotification, isInDndPeriod } = get()

        // 检查是否在免打扰时段
        if (isInDndPeriod()) return

        // 检查频率限制
        if (!canSendNotification()) return

        set((state) => {
          state.notifications.unshift({
            ...notification,
            id: crypto.randomUUID(),
            status: 'unread',
            createdAt: new Date().toISOString(),
          })
        })

        // 更新发送计数
        set((state) => {
          state.sentCount.hour += 1
          state.sentCount.day += 1
        })

        // 发送桌面通知（如果启用）
        const settings = get().getSettings()
        if (settings.channels.desktop && typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icon.png',
            })
          }
        }
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (notification && notification.status === 'unread') {
            notification.status = 'read'
            notification.readAt = new Date().toISOString()
          }
        })
      },

      markAllAsRead: () => {
        set((state) => {
          state.notifications.forEach(n => {
            if (n.status === 'unread') {
              n.status = 'read'
              n.readAt = new Date().toISOString()
            }
          })
        })
      },

      archiveNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (notification) {
            notification.status = 'archived'
            notification.archivedAt = new Date().toISOString()
          }
        })
      },

      archiveAllNotifications: () => {
        set((state) => {
          state.notifications.forEach(n => {
            if (n.status !== 'archived') {
              n.status = 'archived'
              n.archivedAt = new Date().toISOString()
            }
          })
        })
      },

      deleteNotification: (id) => {
        set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id)
        })
      },

      clearAllNotifications: () => {
        set({ notifications: [] })
      },

      // ========== 设置 ==========
      updateSettings: (settings) => {
        set((state) => {
          state.settings = { ...state.settings, ...settings }
        })
      },

      toggleDndMode: (enabled) => {
        set((state) => {
          state.settings.dndMode.enabled = enabled
        })
      },

      toggleReminder: (type, enabled) => {
        set((state) => {
          state.settings.reminders[type] = {
            ...state.settings.reminders[type],
            enabled,
          } as any
        })
      },

      // ========== 智能提醒 ==========
      checkAndGenerateReminders: () => {
        const settings = get().getSettings()

        if (!settings.enabled) return

        // 这里可以集成其他模块的数据检查
        // 例如：检查即将到期的任务、需要复盘的周期等
        // 由于是前端实现，这里提供框架，实际触发由定时器调用
      },

      isInDndPeriod: () => {
        const { settings } = get()
        if (!settings.dndMode.enabled) return false

        const now = new Date()
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        const { startTime, endTime } = settings.dndMode

        if (startTime <= endTime) {
          return currentTime >= startTime && currentTime <= endTime
        } else {
          // 跨天的情况（如 22:00 - 08:00）
          return currentTime >= startTime || currentTime <= endTime
        }
      },

      canSendNotification: () => {
        const { sentCount, settings } = get()
        return sentCount.hour < settings.maxPerHour && sentCount.day < settings.maxPerDay
      },

      // ========== 查询 ==========
      getUnreadNotifications: () => {
        const { notifications } = get()
        return notifications.filter(n => n.status === 'unread')
      },

      getNotifications: () => {
        const { notifications } = get()
        return notifications.filter(n => n.status !== 'archived')
      },

      getStats: () => {
        const { notifications } = get()
        const active = notifications.filter(n => n.status !== 'archived')

        return {
          total: active.length,
          unread: active.filter(n => n.status === 'unread').length,
          read: active.filter(n => n.status === 'read').length,
          archived: notifications.filter(n => n.status === 'archived').length,
          byType: {
            task_due: active.filter(n => n.type === 'task_due').length,
            task_overdue: active.filter(n => n.type === 'task_overdue').length,
            review_reminder: active.filter(n => n.type === 'review_reminder').length,
            risk_warning: active.filter(n => n.type === 'risk_warning').length,
            goal_milestone: active.filter(n => n.type === 'goal_milestone').length,
            pdca_stage: active.filter(n => n.type === 'pdca_stage').length,
            resource_alert: active.filter(n => n.type === 'resource_alert').length,
            system: active.filter(n => n.type === 'system').length,
          },
          byPriority: {
            low: active.filter(n => n.priority === 'low').length,
            medium: active.filter(n => n.priority === 'medium').length,
            high: active.filter(n => n.priority === 'high').length,
            urgent: active.filter(n => n.priority === 'urgent').length,
          },
        }
      },

      getSettings: () => {
        return get().settings
      },
    }),
    {
      name: 'chrono-focus-notifications',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 100), // 只保留最近 100 条
        settings: state.settings,
      }),
    },
  )),
))
