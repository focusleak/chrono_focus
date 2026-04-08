import { useOverlay } from '@/hooks/useOverlay'
import { useRuntimeStore } from '@/store/runtimeStore'
import { sendNotification } from '@/lib/utils'

const TestPage = () => {
  const { isOpen, error, show, hide } = useOverlay()
  const triggerPomodoroComplete = useRuntimeStore.use.triggerPomodoroComplete()
  const triggerPotatoComplete = useRuntimeStore.use.triggerPotatoComplete()
  const triggerRestReminder = useRuntimeStore.use.triggerRestReminder()
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const isPotatoRunning = useRuntimeStore.use.isPotatoRunning()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()

  const handleTestNotification = () => {
    sendNotification('测试通知', '这是一条测试通知，如果你看到它说明通知功能正常！')
  }

  const handleTestWithElectronAPI = () => {
    if (window.electronAPI) {
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
        if (perm === 'granted') {
          new Notification('浏览器通知', { body: '权限获取成功' })
        }
      })
    } else {
      alert('通知权限被拒绝，请在浏览器设置中允许通知')
    }
  }

  const handleShowOverlay = async () => {
    await show()
  }

  const handleCloseOverlay = async () => {
    await hide()
  }

  const handleTriggerPomodoroComplete = () => {
    triggerPomodoroComplete()
  }

  const handleTriggerPotatoComplete = () => {
    triggerPotatoComplete()
  }

  const handleTriggerRestReminder = () => {
    triggerRestReminder()
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">测试面板</h1>

      {/* 通知测试 */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">通知测试</h2>
        <div className="space-y-3">
          <button
            onClick={handleTestNotification}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            通用通知（自动选择 API）
          </button>
          <button
            onClick={handleTestWithElectronAPI}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            Electron 原生通知
          </button>
          <button
            onClick={handleTestBrowserNotification}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            浏览器通知
          </button>
        </div>
      </div>

      {/* 遮罩测试 */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">遮罩测试</h2>
        <div className="space-y-3">
          <button
            onClick={handleShowOverlay}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            默认全屏遮罩{isOpen ? '（已打开）' : ''}
          </button>
          {isOpen && (
            <button
              onClick={handleCloseOverlay}
              className="w-full px-4 py-3 rounded-xl border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
            >
              关闭遮罩
            </button>
          )}
        </div>
      </div>

      {/* 计时器结束测试 */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">计时器结束测试</h2>
        <div className="space-y-3">
          <button
            onClick={handleTriggerPomodoroComplete}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            触发番茄钟结束逻辑
          </button>
          <button
            onClick={handleTriggerPotatoComplete}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            触发土豆钟结束逻辑
          </button>
          <button
            onClick={handleTriggerRestReminder}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            触发休息提醒弹窗
          </button>
        </div>
      </div>

      {/* 状态信息 */}
      <div className="p-4 rounded-xl bg-gray-100 dark:bg-[#2c2c2e] text-sm text-gray-600 dark:text-gray-400">
        <p className="mb-2 font-medium">状态信息：</p>
        <p>electronAPI: {typeof window !== 'undefined' && window.electronAPI ? '可用' : '不可用'}</p>
        <p>通知权限: {typeof Notification !== 'undefined' ? Notification.permission : '不支持'}</p>
        <p>番茄钟运行: {isPomodoroRunning ? '是' : '否'} ({pomodoroStatus})</p>
        <p>土豆钟运行: {isPotatoRunning ? '是' : '否'}</p>
        <p>休息提醒弹窗: {showRestReminderPrompt ? '显示中' : '未显示'}</p>
        {error && (
          <p className="mt-2 text-red-500">
            错误: {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default TestPage
