import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Droplets } from 'lucide-react'
import { useTimerStore } from '../store/timerStore'

interface HydrationPromptProps {
  open: boolean
  onYes: () => void
  onNo: () => void
}

const HydrationPrompt = ({ open, onYes, onNo }: HydrationPromptProps) => {
  const { timerType } = useTimerStore()
  const isPomodoroEnd = timerType === 'shortBreak' || timerType === 'longBreak'

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Droplets className="w-5 h-5" />
            {isPomodoroEnd ? '休息一下吧' : '准备好继续了吗？'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">
                {isPomodoroEnd ? '该喝水了！' : '开始前喝杯水吧'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isPomodoroEnd 
                  ? '番茄钟完成了，休息一下喝杯水，然后继续下一个番茄钟' 
                  : '休息结束了，喝杯水补充水分，准备开始新的专注时间'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onNo} className="flex-1 rounded-xl">
              不需要
            </Button>
            <Button onClick={onYes} className="flex-1 rounded-xl bg-[#0071e3] hover:bg-[#0077ed]">
              <Droplets className="w-4 h-4 mr-2" />
              喝一杯水
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default HydrationPrompt
