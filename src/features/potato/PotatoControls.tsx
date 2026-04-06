import { useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { useStore } from '../../store/store'
import { ConfirmDialog } from '@/components/ConfirmDialog'

/**
 * 土豆钟控制按钮组件
 * 包含开始/暂停按钮，以及超时警告弹窗
 */
export const PotatoControls = () => {
  const {
    potatoTimeLeft,
    isPotatoRunning,
    pausePotato,
  } = useStore()

  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false)

  /**
   * 处理开始土豆钟
   * 如果已超时，则显示警告弹窗；否则直接开始
   */
  const handleStartPotato = () => {
    if (potatoTimeLeft < 0) {
      setShowOvertimeWarning(true)
    } else {
      const { startPotato } = useStore.getState()
      startPotato()
    }
  }

  /**
   * 确认超时后继续娱乐
   * 用户确认娱乐时间已超出后，仍然开始土豆钟
   */
  const confirmOvertimeStart = () => {
    useStore.getState().startPotato()
    setShowOvertimeWarning(false)
  }

  return (
    <div className="flex justify-center gap-3">
      {/* 开始/暂停按钮：根据运行状态切换 */}
      {!isPotatoRunning ? (
        <button
          onClick={handleStartPotato}
          className="px-10 h-11 text-base font-medium rounded-xl border border-gray-900/30 text-gray-900 hover:bg-gray-900/10 transition-all duration-200 flex items-center backdrop-blur-sm"
        >
          <Play className="w-4 h-4 mr-2" />
          开始
        </button>
      ) : (
        <button
          onClick={pausePotato}
          className="px-10 h-11 text-base font-medium rounded-xl border border-gray-900/30 text-gray-900 hover:bg-gray-900/10 transition-all duration-200 flex items-center backdrop-blur-sm"
        >
          <Pause className="w-4 h-4 mr-2" />
          暂停
        </button>
      )}

      {/* 超时提示弹窗：娱乐时间超出后再次开始时显示警告 */}
      <ConfirmDialog
        open={showOvertimeWarning}
        onClose={() => setShowOvertimeWarning(false)}
        title="娱乐时间已超出"
        message="您的娱乐时间已超过限制。确定要继续娱乐吗？建议回去专注工作！"
        confirmLabel="继续娱乐"
        cancelLabel="取消"
        onConfirm={confirmOvertimeStart}
        confirmClassName="bg-[#FADFA1] text-gray-900 hover:bg-[#e5cc8a] font-medium"
      />
    </div>
  )
}
