import { useState, useEffect } from 'react'
import { sendNotification } from '@/lib/utils'
import { useFullScreenOverlay } from '@/hooks/useFullScreenOverlay'
import { useRuntimeStore } from '@/store/runtimeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { PomodoroStatus } from '@/types'

const TestPage = () => {
  const { show, onAction } = useFullScreenOverlay()

  // ========== Runtime Store ==========
  const setPomodoroStatus = useRuntimeStore.use.setPomodoroStatus()
  const resetRestReminder = useRuntimeStore.use.resetRestReminder()
  const resetPomodoro = useRuntimeStore.use.resetPomodoro()
  const resetPotato = useRuntimeStore.use.resetPotato()
  const resetDailyStats = useRuntimeStore.use.resetDailyStats()
  const setShowRestReminderPrompt = useRuntimeStore.use.setShowRestReminderPrompt()
  const incrementWater = useRuntimeStore.use.incrementWater()
  const skipRestReminder = useRuntimeStore.use.skipRestReminder()
  const nextRestBreak = useRuntimeStore.use.nextRestBreak()
  const toggleRestReminderPause = useRuntimeStore.use.toggleRestReminderPause()
  const resumeTimersAfterOverlay = useRuntimeStore.use.resumeTimersAfterOverlay()

  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const isPotatoRunning = useRuntimeStore.use.isPotatoRunning()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()
  const pomodoroTimeLeft = useRuntimeStore.use.pomodoroTimeLeft()
  const currentPomodoroTime = useRuntimeStore.use.currentPomodoroTime()
  const potatoTimeLeft = useRuntimeStore.use.potatoTimeLeft()
  const restReminderTimeLeft = useRuntimeStore.use.restReminderTimeLeft()
  const restBreakCount = useRuntimeStore.use.restBreakCount()
  const restReminderSkipCount = useRuntimeStore.use.restReminderSkipCount()
  const waterCount = useRuntimeStore.use.waterCount()
  const standReminderCount = useRuntimeStore.use.standReminderCount()
  const gazeReminderCount = useRuntimeStore.use.gazeReminderCount()
  const walkReminderCount = useRuntimeStore.use.walkReminderCount()
  const totalFocusTime = useRuntimeStore.use.totalFocusTime()
  const currentPomodoroTaskId = useRuntimeStore.use.currentPomodoroTaskId()
  const currentPotatoTaskId = useRuntimeStore.use.currentPotatoTaskId()
  const showPomodoroPotatoConflict = useRuntimeStore.use.showPomodoroPotatoConflict()
  const tasks = useRuntimeStore.use.tasks()
  const potatoActivities = useRuntimeStore.use.potatoActivities()

  // ========== Settings Store ==========
  const theme = useSettingsStore.use.theme()
  const pomodoroTime = useSettingsStore.use.pomodoroTime()
  const pomodoroShortBreakTime = useSettingsStore.use.pomodoroShortBreakTime()
  const pomodoroLongBreakTime = useSettingsStore.use.pomodoroLongBreakTime()
  const dailyWaterGoal = useSettingsStore.use.dailyWaterGoal()
  const restReminderEnabled = useSettingsStore.use.restReminderEnabled()
  const waterReminderEnabled = useSettingsStore.use.waterReminderEnabled()
  const standReminderEnabled = useSettingsStore.use.standReminderEnabled()
  const stretchReminderEnabled = useSettingsStore.use.stretchReminderEnabled()
  const gazeReminderEnabled = useSettingsStore.use.gazeReminderEnabled()
  const walkReminderEnabled = useSettingsStore.use.walkReminderEnabled()

  // ========== 系统信息 ==========
  const [electronAPI, setElectronAPI] = useState<string>('检测中...')
  const [notificationPermission, setNotificationPermission] = useState<string>('检测中...')

  useEffect(() => {
    setElectronAPI(window.electronAPI ? '可用' : '不可用（浏览器模式）')
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission)
    } else {
      setNotificationPermission('不支持')
    }
  }, [])

  onAction((action) => {
    console.log('遮罩动作:', action)
  })

  // ========== 工具函数 ==========
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h}小时${m}分钟`
    return `${m}分钟`
  }

  const getStatusText = (status: PomodoroStatus) => {
    switch (status) {
      case PomodoroStatus.Pomodoro: return '🍅 番茄钟'
      case PomodoroStatus.ShortBreak: return '☕ 短休息'
      case PomodoroStatus.LongBreak: return '🌴 长休息'
      default: return '❓ 未知'
    }
  }

  const getCurrentTaskName = (taskId: string | null) => {
    if (!taskId) return '无'
    const task = tasks.find(t => t.id === taskId)
    return task ? task.title : '已删除'
  }

  // ========== 测试处理函数 ==========
  const handleTestFullScreenOverlay = () => {
    show({
      content: `
        <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.95); border-radius: 16px; max-width: 400px;">
          <h1 style="font-size: 24px; margin-bottom: 16px; color: #111827;">测试全屏遮罩</h1>
          <p style="color: #6b7280; margin-bottom: 24px;">这是一个通用的全屏遮罩测试</p>
          <button id="closeBtn" style="padding: 12px 32px; border: none; border-radius: 8px; background: #3b82f6; color: white; cursor: pointer; font-size: 14px;">关闭遮罩</button>
        </div>
        <script>
          document.getElementById('closeBtn').addEventListener('click', () => {
            window.overlayAPI?.close()
            window.overlayAPI?.notify('closed')
          })
        </script>
      `,
    })
  }

  const handleTestRestOverlay = () => {
    show({
      content: `
        <div style="text-align: center; max-width: 448px; padding: 40px; background: rgba(255,255,255,0.95); border-radius: 16px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px;">休息提醒测试</h2>
          <p style="color: #6b7280; margin-bottom: 24px;">你已经工作了一段时间，记得休息一下哦</p>
          <button id="skipBtn" style="width: 100%; padding: 12px; border: none; border-radius: 8px; background: #f3f4f6; color: #374151; cursor: pointer;">跳过</button>
        </div>
        <script>
          document.getElementById('skipBtn').addEventListener('click', () => {
            window.overlayAPI?.close()
            window.overlayAPI?.notify('skip')
          })
        </script>
      `,
    })
  }

  const handleTestQuizOverlay = () => {
    show({
      content: `
        <div style="text-align: center; max-width: 384px; padding: 40px; background: rgba(255,255,255,0.95); border-radius: 16px;">
          <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 24px;">答题测试</h2>
          <div style="font-size: 36px; font-weight: bold; font-family: monospace; color: #111827; margin-bottom: 24px;">12 × 34 = ?</div>
          <input id="answerInput" type="number" style="width: 100%; padding: 12px; font-size: 24px; text-align: center; border: 2px solid #d1d5db; border-radius: 8px; margin-bottom: 16px;" placeholder="输入答案" />
          <div id="resultArea" style="margin-bottom: 16px; min-height: 24px;"></div>
          <button id="submitBtn" style="width: 100%; padding: 12px; border: none; border-radius: 8px; background: #3b82f6; color: white; cursor: pointer;">提交答案</button>
        </div>
        <script>
          const correctAnswer = 408
          const inputEl = document.getElementById('answerInput')
          const submitBtn = document.getElementById('submitBtn')
          const resultArea = document.getElementById('resultArea')
          inputEl.focus()
          function submitAnswer() {
            const val = inputEl.value.trim()
            if (!val) return
            const userAnswer = parseInt(val, 10)
            const isCorrect = userAnswer === correctAnswer
            inputEl.disabled = true
            submitBtn.disabled = true
            if (isCorrect) {
              resultArea.innerHTML = '<div style="color: #16a34a;">✓ 回答正确！</div>'
              setTimeout(() => window.overlayAPI?.notify('quizCorrect'), 1000)
            } else {
              resultArea.innerHTML = '<div style="color: #dc2626;">✗ 回答错误</div>'
              inputEl.disabled = false
              inputEl.value = ''
              inputEl.focus()
              submitBtn.disabled = false
            }
          }
          submitBtn.addEventListener('click', submitAnswer)
          inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); submitAnswer() }
          })
        </script>
      `,
    })
  }

  const handleTestNotification = () => {
    sendNotification('测试通知', '这是一条测试通知，如果你看到它说明通知功能正常！')
  }

  const handleTestElectronNotification = () => {
    if (window.electronAPI && window.electronAPI.showNotification) {
      window.electronAPI.showNotification('Electron 原生通知', '通过 Electron API 发送的通知')
    } else {
      alert('electronAPI 不可用，当前运行在浏览器模式')
    }
  }

  const handleTestBrowserNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('浏览器通知', { body: '通过浏览器 Notification API 发送' })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') new Notification('浏览器通知', { body: '权限获取成功' })
      })
    } else {
      alert('通知权限被拒绝，请在浏览器设置中允许通知')
    }
  }

  const handleTestConflict = () => {
    // 模拟番茄钟和土豆钟冲突
    if (!isPomodoroRunning) {
      setPomodoroStatus(PomodoroStatus.Pomodoro)
    }
    // 这里需要触发冲突逻辑
    alert('冲突测试：请先启动番茄钟或土豆钟，然后尝试启动另一个')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">测试面板</h1>

      {/* 系统信息 */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1c1c1e] space-y-2 text-sm">
        <p className="font-medium text-gray-900 dark:text-gray-100">系统信息</p>
        <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
          <p>Electron API: {electronAPI}</p>
          <p>通知权限: {notificationPermission}</p>
          <p>主题: {theme}</p>
        </div>
      </div>

      {/* ========== 已有功能列表 ========== */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">已有功能</h2>
        <div className="grid gap-3">
          {/* 番茄钟 */}
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
            <h3 className="font-medium text-red-900 dark:text-red-200 mb-2">🍅 番茄钟</h3>
            <div className="space-y-1 text-sm text-red-800 dark:text-red-300">
              <p>• 状态: {getStatusText(pomodoroStatus)} | 剩余: {formatTime(pomodoroTimeLeft)}</p>
              <p>• 运行中: {isPomodoroRunning ? '是' : '否'}</p>
              <p>• 当前任务: {getCurrentTaskName(currentPomodoroTaskId)}</p>
              <p>• 连续短休息: {restBreakCount} 次</p>
              <p>• 时长设置: 番茄 {pomodoroTime}min / 短休息 {pomodoroShortBreakTime}min / 长休息 {pomodoroLongBreakTime}min</p>
            </div>
          </div>

          {/* 土豆钟 */}
          <div className="p-4 rounded-xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20">
            <h3 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">🥔 土豆钟</h3>
            <div className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
              <p>• 剩余时间: {formatTime(potatoTimeLeft)}</p>
              <p>• 运行中: {isPotatoRunning ? '是' : '否'}</p>
              <p>• 当前活动: {getCurrentTaskName(currentPotatoTaskId)}</p>
              <p>• 活动记录: {potatoActivities.length} 条</p>
            </div>
          </div>

          {/* 休息提醒 */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">⏰ 休息提醒</h3>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <p>• 启用: {restReminderEnabled ? '是' : '否'}</p>
              <p>• 倒计时: {formatTime(restReminderTimeLeft)}</p>
              <p>• 弹窗显示: {showRestReminderPrompt ? '是' : '否'}</p>
              <p>• 跳过次数: {restReminderSkipCount}</p>
            </div>
          </div>

          {/* 喝水提醒 */}
          <div className="p-4 rounded-xl border border-cyan-200 dark:border-cyan-900 bg-cyan-50 dark:bg-cyan-950/20">
            <h3 className="font-medium text-cyan-900 dark:text-cyan-200 mb-2">💧 喝水提醒</h3>
            <div className="space-y-1 text-sm text-cyan-800 dark:text-cyan-300">
              <p>• 启用: {waterReminderEnabled ? '是' : '否'}</p>
              <p>• 今日喝水: {waterCount} / {dailyWaterGoal} ml</p>
              <p>• 进度: {dailyWaterGoal > 0 ? Math.round((waterCount / dailyWaterGoal) * 100) : 0}%</p>
            </div>
          </div>

          {/* 站立/远眺/走动提醒 */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
            <h3 className="font-medium text-emerald-900 dark:text-emerald-200 mb-2">🧘 健康提醒</h3>
            <div className="space-y-1 text-sm text-emerald-800 dark:text-emerald-300">
              <p>• 站立: {standReminderEnabled ? '启用' : '禁用'} | 次数: {standReminderCount}</p>
              <p>• 远眺: {gazeReminderEnabled ? '启用' : '禁用'} | 次数: {gazeReminderCount}</p>
              <p>• 走动: {walkReminderEnabled ? '启用' : '禁用'} | 次数: {walkReminderCount}</p>
              <p>• 拉伸: {stretchReminderEnabled ? '启用' : '禁用'}</p>
            </div>
          </div>

          {/* 活动管理 */}
          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20">
            <h3 className="font-medium text-purple-900 dark:text-purple-200 mb-2">📋 活动管理</h3>
            <div className="space-y-1 text-sm text-purple-800 dark:text-purple-300">
              <p>• 任务数: {tasks.filter(t => t.type === 'task').length}</p>
              <p>• 娱乐数: {tasks.filter(t => t.type === 'entertainment').length}</p>
              <p>• 拖拽排序 / 筛选 / 子任务</p>
            </div>
          </div>

          {/* 统计 */}
          <div className="p-4 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
            <h3 className="font-medium text-green-900 dark:text-green-200 mb-2">📊 数据统计</h3>
            <div className="space-y-1 text-sm text-green-800 dark:text-green-300">
              <p>• 总专注时间: {formatDuration(totalFocusTime)}</p>
              <p>• 番茄钟/娱乐/喝水统计</p>
            </div>
          </div>

          {/* 设置 */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/20">
            <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-2">⚙️ 系统设置</h3>
            <div className="space-y-1 text-sm text-gray-800 dark:text-gray-300">
              <p>• 主题切换 / 开机自启</p>
              <p>• 番茄钟/土豆钟时长配置</p>
              <p>• 各类提醒开关与间隔</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 全屏遮罩测试 ========== */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">全屏遮罩测试</h2>
        <div className="space-y-3">
          <button onClick={handleTestFullScreenOverlay} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            通用全屏遮罩
          </button>
          <button onClick={handleTestRestOverlay} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            休息提醒遮罩
          </button>
          <button onClick={handleTestQuizOverlay} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            答题遮罩
          </button>
        </div>
      </div>

      {/* ========== 通知测试 ========== */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">通知测试</h2>
        <div className="space-y-3">
          <button onClick={handleTestNotification} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            通用通知（自动选择 API）
          </button>
          <button onClick={handleTestElectronNotification} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            Electron 原生通知
          </button>
          <button onClick={handleTestBrowserNotification} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            浏览器通知
          </button>
        </div>
      </div>

      {/* ========== 番茄钟控制测试 ========== */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">番茄钟控制测试</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setPomodoroStatus(PomodoroStatus.Pomodoro)} className="px-4 py-3 rounded-xl border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium transition-colors">
            切换番茄钟
          </button>
          <button onClick={() => setPomodoroStatus(PomodoroStatus.ShortBreak)} className="px-4 py-3 rounded-xl border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/20 font-medium transition-colors">
            切换短休息
          </button>
          <button onClick={() => setPomodoroStatus(PomodoroStatus.LongBreak)} className="px-4 py-3 rounded-xl border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-medium transition-colors">
            切换长休息
          </button>
          <button onClick={resetPomodoro} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            重置番茄钟
          </button>
        </div>
      </div>

      {/* ========== 土豆钟控制测试 ========== */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">土豆钟控制测试</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={resetPotato} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            重置土豆钟
          </button>
          <button onClick={handleTestConflict} className="px-4 py-3 rounded-xl border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 font-medium transition-colors">
            冲突测试
          </button>
        </div>
      </div>

      {/* ========== 休息提醒控制测试 ========== */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">休息提醒控制测试</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={resetRestReminder} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            重置休息提醒
          </button>
          <button onClick={() => setShowRestReminderPrompt(true)} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            显示休息弹窗
          </button>
          <button onClick={() => setShowRestReminderPrompt(false)} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            隐藏休息弹窗
          </button>
          <button onClick={skipRestReminder} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            跳过休息提醒
          </button>
          <button onClick={nextRestBreak} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            下次休息 Break
          </button>
          <button onClick={toggleRestReminderPause} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            暂停/恢复提醒
          </button>
          <button onClick={resumeTimersAfterOverlay} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors col-span-2">
            遮罩关闭后恢复计时
          </button>
        </div>
      </div>

      {/* ========== 喝水/健康提醒测试 ========== */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">喝水/健康提醒测试</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={incrementWater} className="px-4 py-3 rounded-xl border border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 font-medium transition-colors">
            +1 喝水
          </button>
          <button onClick={resetDailyStats} className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors">
            重置每日统计
          </button>
        </div>
      </div>

      {/* ========== 状态信息 ========== */}
      <div className="p-4 rounded-xl bg-gray-100 dark:bg-[#2c2c2e] text-sm text-gray-600 dark:text-gray-400">
        <p className="mb-2 font-medium text-gray-900 dark:text-gray-100">实时状态信息</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <p>番茄钟: {getStatusText(pomodoroStatus)}</p>
          <p>番茄运行: {isPomodoroRunning ? '是' : '否'}</p>
          <p>番茄剩余: {formatTime(pomodoroTimeLeft)}</p>
          <p>番茄总时: {formatTime(currentPomodoroTime)}</p>
          <p>土豆运行: {isPotatoRunning ? '是' : '否'}</p>
          <p>土豆剩余: {formatTime(potatoTimeLeft)}</p>
          <p>休息提醒: {formatTime(restReminderTimeLeft)}</p>
          <p>休息弹窗: {showRestReminderPrompt ? '显示' : '隐藏'}</p>
          <p>连续短休: {restBreakCount} 次</p>
          <p>跳过次数: {restReminderSkipCount}</p>
          <p>喝水: {waterCount} / {dailyWaterGoal} ml</p>
          <p>总专注: {formatDuration(totalFocusTime)}</p>
          <p>站立: {standReminderCount} 次</p>
          <p>远眺: {gazeReminderCount} 次</p>
          <p>走动: {walkReminderCount} 次</p>
          <p>冲突: {showPomodoroPotatoConflict || '无'}</p>
        </div>
      </div>

      {/* ========== 建议增加的测试功能 ========== */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <h3 className="font-medium text-amber-900 dark:text-amber-200 mb-3">💡 建议增加的测试功能</h3>
        <div className="space-y-2 text-sm text-amber-800 dark:text-amber-300">
          <p>• <strong>macOS 专注模式检测</strong> - 检测勿扰/睡眠专注状态（需主进程）</p>
          <p>• <strong>系统托盘测试</strong> - 测试托盘菜单/点击/同步</p>
          <p>• <strong>持久化测试</strong> - 验证 Zustand persist 存储与恢复</p>
          <p>• <strong>主题切换测试</strong> - 快速切换浅色/深色/跟随系统</p>
          <p>• <strong>冲突解决测试</strong> - 模拟番茄钟/土豆钟冲突与解决</p>
          <p>• <strong>快捷键测试</strong> - 测试全局快捷键注册与响应</p>
          <p>• <strong>窗口管理测试</strong> - 最小化/最大化/关闭窗口</p>
          <p>• <strong>性能监控</strong> - CPU/内存使用率显示</p>
          <p>• <strong>日志查看</strong> - 实时查看应用日志</p>
          <p>• <strong>数据导出/导入</strong> - 测试统计数据的备份恢复</p>
        </div>
      </div>
    </div>
  )
}

export default TestPage
