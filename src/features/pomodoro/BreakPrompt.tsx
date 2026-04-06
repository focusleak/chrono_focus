import { Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '../../store/store'

interface BreakPromptProps {
  onBreakSelect: (type: 'shortBreak' | 'longBreak') => void
}

/**
 * 休息提示弹窗组件
 * 番茄钟完成后显示，提供短休息和长休息选项
 */
export const BreakPrompt = ({ onBreakSelect }: BreakPromptProps) => {
  const { showBreakPrompt, shortBreakTime, longBreakTime } = useStore()

  if (!showBreakPrompt) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        {/* 咖啡杯图标 */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
          <Coffee className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        {/* 标题和提示文字 */}
        <h3 className="text-lg font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
          番茄钟完成！
        </h3>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
          是时候休息一下了，选择休息时长：
        </p>
        {/* 休息时长选择按钮 */}
        <div className="flex gap-3">
          <Button
            onClick={() => onBreakSelect('shortBreak')}
            className="flex-1 h-11 rounded-xl bg-[#38858a] hover:bg-[#2f7478] text-white font-medium"
          >
            短休息 ({shortBreakTime}分钟)
          </Button>
          <Button
            onClick={() => onBreakSelect('longBreak')}
            className="flex-1 h-11 rounded-xl bg-[#2f6a95] hover:bg-[#285d82] text-white font-medium"
          >
            长休息 ({longBreakTime}分钟)
          </Button>
        </div>
      </div>
    </div>
  )
}
