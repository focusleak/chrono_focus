import { useStore } from '../../store/store'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { format } from 'date-fns'
import { EntertainmentSelector } from './EntertainmentSelector'
import { PotatoControls } from './PotatoControls'

const PotatoClock = () => {
  const {
    potatoTimeLeft,
    showPomodoroPotatoConflict,
    resolvePomodoroPotatoConflict,
  } = useStore()

  /**
   * 将秒数格式化为 MM:SS 格式
   * @param seconds - 秒数（可以是负数，负数时表示超时，显示 + 前缀）
   * @returns 格式化后的时间字符串，如 "45:30" 或 "+05:15"
   */
  const formatTime = (seconds: number): string => {
    const isOvertime = seconds < 0
    const absSeconds = Math.abs(seconds)
    const mins = Math.floor(absSeconds / 60)
    const secs = absSeconds % 60
    const timeStr = format(new Date(0, 0, 0, 0, mins, secs), 'mm:ss')
    return isOvertime ? `+${timeStr}` : timeStr
  }

  /**
   * 判断是否已超时（剩余时间为负数）
   */
  const isOvertime = potatoTimeLeft < 0

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <div className="pb-8">

        <div className={`text-8xl font-mono font-semibold mb-4 ${isOvertime ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(potatoTimeLeft)}
        </div>

        {/* 当前娱乐项目显示：点击可打开选择弹窗 */}
        <EntertainmentSelector />

        {/* 控制按钮区域：开始/暂停 */}
        <PotatoControls />
      </div>

      {/* 冲突提示弹窗：当番茄钟正在运行时，尝试启动土豆钟会显示此确认弹窗 */}
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
