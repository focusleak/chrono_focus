import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Segmented } from '@/components/ui/segmented'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { useNotificationStore, type Notification } from '@/store/notificationStore'

import {
  Bell,
  BellOff,
  Check,
  Archive,
  Trash2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Info,
  Target,
  CheckCircle2,
  TrendingUp,
  Settings,
  Moon,
} from 'lucide-react'

const TYPE_CONFIG = {
  task_due: { label: '任务到期', icon: Clock, color: 'bg-blue-500' },
  task_overdue: { label: '任务过期', icon: AlertCircle, color: 'bg-red-500' },
  review_reminder: { label: '复盘提醒', icon: CheckCircle2, color: 'bg-green-500' },
  risk_warning: { label: '风险预警', icon: AlertTriangle, color: 'bg-orange-500' },
  goal_milestone: { label: '目标里程碑', icon: Target, color: 'bg-purple-500' },
  pdca_stage: { label: 'PDCA 阶段', icon: TrendingUp, color: 'bg-cyan-500' },
  resource_alert: { label: '资源预警', icon: AlertTriangle, color: 'bg-yellow-500' },
  system: { label: '系统通知', icon: Info, color: 'bg-gray-500' },
}

const PRIORITY_CONFIG = {
  low: { label: '低', color: 'text-gray-500' },
  medium: { label: '中', color: 'text-blue-500' },
  high: { label: '高', color: 'text-orange-500' },
  urgent: { label: '紧急', color: 'text-red-500' },
}

function NotificationItem({ notification }: { notification: Notification }) {
  const markAsRead = useNotificationStore.use.markAsRead()
  const archiveNotification = useNotificationStore.use.archiveNotification()
  const deleteNotification = useNotificationStore.use.deleteNotification()

  const typeConfig = TYPE_CONFIG[notification.type]
  const priorityConfig = PRIORITY_CONFIG[notification.priority]
  const TypeIcon = typeConfig.icon

  const timeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
    return `${Math.floor(diff / 86400)} 天前`
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${notification.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${typeConfig.color} flex items-center justify-center shrink-0`}>
            <TypeIcon className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-sm font-medium ${notification.status === 'unread' ? '' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </h3>
                  <span className={`text-xs ${priorityConfig.color}`}>
                    {priorityConfig.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</p>
              </div>

              <div className="flex gap-1 shrink-0">
                {notification.status === 'unread' && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 text-muted-foreground hover:text-green-500"
                    title="标记已读"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => archiveNotification(notification.id)}
                  className="p-1 text-muted-foreground hover:text-blue-500"
                  title="归档"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-1 text-muted-foreground hover:text-red-500"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NotificationsPage() {
  const [viewMode, setViewMode] = useState<'all' | 'unread' | 'archived'>('all')
  const [showSettings, setShowSettings] = useState(false)

  const notifications = useNotificationStore.use.notifications()
  const markAllAsRead = useNotificationStore.use.markAllAsRead()
  const archiveAllNotifications = useNotificationStore.use.archiveAllNotifications()
  const clearAllNotifications = useNotificationStore.use.clearAllNotifications()
  const updateSettings = useNotificationStore.use.updateSettings()
  const toggleDndMode = useNotificationStore.use.toggleDndMode()

  // 直接调用 store 方法
  const store = useNotificationStore.getState()
  const unreadNotifications = store.getUnreadNotifications()
  const stats = store.getStats()
  const settings = store.getSettings()

  const filteredNotifications = viewMode === 'all'
    ? notifications.filter(n => n.status !== 'archived')
    : viewMode === 'unread'
    ? unreadNotifications
    : notifications.filter(n => n.status === 'archived')

  return (
    <div className="max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            通知中心
          </h1>
          <p className="text-muted-foreground mt-1">
            管理所有提醒和通知
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)} icon={Settings}>
            设置
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">总通知</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-blue-500">{stats.unread}</div>
            <p className="text-xs text-muted-foreground">未读</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-green-500">{stats.read}</div>
            <p className="text-xs text-muted-foreground">已读</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-gray-500">{stats.archived}</div>
            <p className="text-xs text-muted-foreground">已归档</p>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <Segmented
          value={viewMode}
          onChange={(value) => setViewMode(value as 'all' | 'unread' | 'archived')}
          options={[
            { label: '全部', value: 'all' },
            { label: '未读', value: 'unread' },
            { label: '已归档', value: 'archived' },
          ]}
        />

        <div className="flex gap-2">
          {stats.unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} icon={Check}>
              全部已读
            </Button>
          )}
          {filteredNotifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={viewMode === 'archived' ? clearAllNotifications : archiveAllNotifications} icon={Archive}>
              {viewMode === 'archived' ? '清空' : '全部归档'}
            </Button>
          )}
        </div>
      </div>

      {/* 通知设置面板 */}
      {showSettings && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              通知设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 全局开关 */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">启用通知</Label>
                  <p className="text-sm text-muted-foreground">开启后接收各类提醒</p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                />
              </div>

              {/* 免打扰模式 */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    免打扰模式
                  </Label>
                  <p className="text-sm text-muted-foreground">在指定时间段内静音通知</p>
                </div>
                <Switch
                  checked={settings.dndMode.enabled}
                  onCheckedChange={toggleDndMode}
                />
              </div>

              {settings.dndMode.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label>开始时间</Label>
                    <Input
                      type="time"
                      value={settings.dndMode.startTime}
                      onChange={(e) =>
                        updateSettings({
                          dndMode: { ...settings.dndMode, startTime: e.target.value },
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>结束时间</Label>
                    <Input
                      type="time"
                      value={settings.dndMode.endTime}
                      onChange={(e) =>
                        updateSettings({
                          dndMode: { ...settings.dndMode, endTime: e.target.value },
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {/* 通知渠道 */}
              <div>
                <Label className="text-base mb-3 block">通知渠道</Label>
                <div className="space-y-3 ml-6">
                  <div className="flex items-center justify-between">
                    <Label>应用内通知</Label>
                    <Switch
                      checked={settings.channels.inApp}
                      onCheckedChange={(checked) =>
                        updateSettings({ channels: { ...settings.channels, inApp: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>桌面通知</Label>
                    <Switch
                      checked={settings.channels.desktop}
                      onCheckedChange={(checked) =>
                        updateSettings({ channels: { ...settings.channels, desktop: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>邮件通知</Label>
                    <Switch
                      checked={settings.channels.email}
                      onCheckedChange={(checked) =>
                        updateSettings({ channels: { ...settings.channels, email: checked } })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 提醒类型 */}
              <div>
                <Label className="text-base mb-3 block">提醒类型</Label>
                <div className="space-y-3 ml-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>任务到期提醒</Label>
                      <p className="text-xs text-muted-foreground">截止前 1h/1d/3d 提醒</p>
                    </div>
                    <Switch
                      checked={settings.reminders.taskDue.enabled}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          reminders: { ...settings.reminders, taskDue: { ...settings.reminders.taskDue, enabled: checked } },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>任务过期提醒</Label>
                      <p className="text-xs text-muted-foreground">每日提醒直到处理</p>
                    </div>
                    <Switch
                      checked={settings.reminders.taskOverdue.enabled}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          reminders: { ...settings.reminders, taskOverdue: { ...settings.reminders.taskOverdue, enabled: checked } },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>复盘提醒</Label>
                      <p className="text-xs text-muted-foreground">周期结束时提醒</p>
                    </div>
                    <Switch
                      checked={settings.reminders.reviewReminder.enabled}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          reminders: { ...settings.reminders, reviewReminder: { ...settings.reminders.reviewReminder, enabled: checked } },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>风险预警</Label>
                      <p className="text-xs text-muted-foreground">高风险实时提醒</p>
                    </div>
                    <Switch
                      checked={settings.reminders.riskWarning.enabled}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          reminders: { ...settings.reminders, riskWarning: { ...settings.reminders.riskWarning, enabled: checked } },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 频率限制 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>每小时最多通知</Label>
                  <Input
                    type="number"
                    value={settings.maxPerHour}
                    onChange={(e) => updateSettings({ maxPerHour: Number(e.target.value) })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>每天最多通知</Label>
                  <Input
                    type="number"
                    value={settings.maxPerDay}
                    onChange={(e) => updateSettings({ maxPerDay: Number(e.target.value) })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 通知列表 */}
      <div className="space-y-3">
        {filteredNotifications.map((notification: Notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              {viewMode === 'unread' ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">全部已读</h3>
                  <p className="text-muted-foreground">没有未读通知</p>
                </>
              ) : (
                <>
                  <BellOff className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">暂无通知</h3>
                  <p className="text-muted-foreground">当有提醒时会显示在这里</p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
