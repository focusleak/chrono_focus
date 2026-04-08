import { useRuntimeStore } from '@/store/runtimeStore'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatDuration } from '@/lib/utils'
import { EntertainmentSelector } from './EntertainmentSelector'
import { PotatoControls } from './PotatoControls'

const PotatoClock = () => {
  const potatoTimeLeft = useRuntimeStore.use.potatoTimeLeft()
  const showPomodoroPotatoConflict = useRuntimeStore.use.showPomodoroPotatoConflict()
  const resolvePomodoroPotatoConflict = useRuntimeStore.use.resolvePomodoroPotatoConflict()
  const isOvertime = potatoTimeLeft < 0

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="mb-10">
        <div className={`text-8xl font-mono font-semibold mb-6 ${isOvertime ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatDuration(potatoTimeLeft)}
        </div>
        <EntertainmentSelector />
      </div>

      <PotatoControls />

      <ConfirmDialog
        open={showPomodoroPotatoConflict === 'potato'}
        onClose={() => resolvePomodoroPotatoConflict('pomodoro')}
        title="番茄钟正在运行"
        message="当前番茄钟（专注时间）正在进行中，确定要停止它并开始娱乐时间吗？"
        confirmLabel="停止并开始"
        cancelLabel="取消"
        onConfirm={() => resolvePomodoroPotatoConflict('potato')}
        confirmClassName="bg-[#FADFA1] text-gray-900 hover:bg-[#e5cc8a] font-medium"
      />
    </div>
  )
}

export default PotatoClock
