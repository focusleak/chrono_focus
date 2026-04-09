import { sendNotification } from '@/lib/utils'

import { useFullScreenOverlay } from '@/hooks/useFullScreenOverlay'
import { useRuntimeStore } from '@/store/runtimeStore'

import { PomodoroStatus } from '@/types'

const TestPage = () => {
  const { show, onAction } = useFullScreenOverlay()
  const setPomodoroStatus = useRuntimeStore.use.setPomodoroStatus()
  const resetRestReminder = useRuntimeStore.use.resetRestReminder()
  const isPomodoroRunning = useRuntimeStore.use.isPomodoroRunning()
  const isPotatoRunning = useRuntimeStore.use.isPotatoRunning()
  const showRestReminderPrompt = useRuntimeStore.use.showRestReminderPrompt()
  const pomodoroStatus = useRuntimeStore.use.pomodoroStatus()
  const potatoTimeLeft = useRuntimeStore.use.potatoTimeLeft()
  const restReminderTimeLeft = useRuntimeStore.use.restReminderTimeLeft()

  const handleTestFullScreenOverlay = () => {
    show({
      content: `
        <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.95); border-radius: 16px; max-width: 400px;">
          <h1 style="font-size: 24px; margin-bottom: 16px; color: #111827;">测试全屏遮罩</h1>
          <p style="color: #6b7280; margin-bottom: 24px;">这是一个通用的全屏遮罩测试</p>
          <button id="closeBtn" style="padding: 12px 32px; border: none; border-radius: 8px; background: #3b82f6; color: white; cursor: pointer; font-size: 14px;">
            关闭遮罩
          </button>
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
          <button id="skipBtn" style="width: 100%; padding: 12px; border: none; border-radius: 8px; background: #f3f4f6; color: #374151; cursor: pointer;">
            跳过
          </button>
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
          <div style="font-size: 36px; font-weight: bold; font-family: monospace; color: #111827; margin-bottom: 24px;">
            12 × 34 = ?
          </div>
          <input id="answerInput" type="number" style="width: 100%; padding: 12px; font-size: 24px; text-align: center; border: 2px solid #d1d5db; border-radius: 8px; margin-bottom: 16px;" placeholder="输入答案" />
          <div id="resultArea" style="margin-bottom: 16px; min-height: 24px;"></div>
          <button id="submitBtn" style="width: 100%; padding: 12px; border: none; border-radius: 8px; background: #3b82f6; color: white; cursor: pointer;">
            提交答案
          </button>
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
            if (e.key === 'Enter') {
              e.preventDefault()
              submitAnswer()
            }
          })
        </script>
      `,
    })
  }

  // 监听遮罩动作
  onAction((action) => {
    console.log('遮罩动作:', action)
  })

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

  const handleSetPomodoroToBreak = () => {
    setPomodoroStatus(PomodoroStatus.ShortBreak)
  }

  const handleSetPomodoroToPomodoro = () => {
    setPomodoroStatus(PomodoroStatus.Pomodoro)
  }

  const handleResetRestReminder = () => {
    resetRestReminder()
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">测试面板</h1>

      {/* 遮罩测试 */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">全屏遮罩测试</h2>
        <div className="space-y-3">
          <button
            onClick={handleTestFullScreenOverlay}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            通用全屏遮罩
          </button>
          <button
            onClick={handleTestRestOverlay}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            休息提醒遮罩
          </button>
          <button
            onClick={handleTestQuizOverlay}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            答题遮罩
          </button>
        </div>
      </div>

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

      {/* 计时器状态测试 */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">计时器状态测试</h2>
        <div className="space-y-3">
          <button
            onClick={handleSetPomodoroToPomodoro}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            切换到番茄钟状态
          </button>
          <button
            onClick={handleSetPomodoroToBreak}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            切换到短休息状态
          </button>
          <button
            onClick={handleResetRestReminder}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] font-medium transition-colors"
          >
            重置休息提醒
          </button>
        </div>
      </div>

      {/* 状态信息 */}
      <div className="p-4 rounded-xl bg-gray-100 dark:bg-[#2c2c2e] text-sm text-gray-600 dark:text-gray-400">
        <p className="mb-2 font-medium">状态信息：</p>
        <p>electronAPI: {typeof window !== 'undefined' && window.electronAPI ? '可用' : '不可用'}</p>
        <p>通知权限: {typeof Notification !== 'undefined' ? Notification.permission : '不支持'}</p>
        <p>番茄钟状态: {pomodoroStatus}</p>
        <p>番茄钟运行: {isPomodoroRunning ? '是' : '否'}</p>
        <p>土豆钟运行: {isPotatoRunning ? '是' : '否'}</p>
        <p>土豆钟剩余: {potatoTimeLeft}秒</p>
        <p>休息提醒剩余: {restReminderTimeLeft}秒</p>
        <p>休息提醒弹窗: {showRestReminderPrompt ? '显示中' : '未显示'}</p>
      </div>
    </div>
  )
}

export default TestPage
