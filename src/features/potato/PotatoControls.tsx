import { useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { useRuntimeStore } from '../../store/runtimeStore'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { TimerButton } from '../../components/common/TimerButton'

export const PotatoControls = () => {
  const potatoTimeLeft = useRuntimeStore.use.potatoTimeLeft()
  const isPotatoRunning = useRuntimeStore.use.isPotatoRunning()
  const pausePotato = useRuntimeStore.use.pausePotato()
  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false)

  const handleStartPotato = () => {
    if (potatoTimeLeft < 0) {
      setShowOvertimeWarning(true)
    } else {
      const { startPotato } = useRuntimeStore.getState()
      startPotato()
    }
  }

  const confirmOvertimeStart = () => {
    useRuntimeStore.getState().startPotato()
    setShowOvertimeWarning(false)
  }

  return (
    <div className="flex justify-center gap-3">
      {!isPotatoRunning ? (
        <TimerButton
          icon={Play}
          label="开始"
          onClick={handleStartPotato}
          variant="dark"
        />
      ) : (
        <TimerButton
          icon={Pause}
          label="暂停"
          onClick={pausePotato}
          variant="dark"
        />
      )}

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
