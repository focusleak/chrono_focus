import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, X, Clock } from 'lucide-react'

interface TaskCompleteModalProps {
  open: boolean
  onTaskComplete: () => void
  onTaskNotComplete: () => void
  taskTitle: string
}

const TaskCompleteModal = ({ 
  open, 
  onTaskComplete, 
  onTaskNotComplete, 
  taskTitle 
}: TaskCompleteModalProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">番茄钟结束</DialogTitle>
        </DialogHeader>

        <div className="text-center py-4">
          <div className="mb-6">
            <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">番茄钟已完成！</h3>
            {taskTitle && (
              <p className="text-gray-600 dark:text-gray-400">
                任务：<span className="font-medium">{taskTitle}</span>
              </p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              你为这个任务投入了一个番茄钟的时间
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              这个任务是否已经完成？
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={onTaskNotComplete}
              className="px-6 rounded-xl border-gray-300 dark:border-gray-600"
            >
              <X className="w-4 h-4 mr-2" />
              还没有
            </Button>
            <Button
              size="lg"
              onClick={onTaskComplete}
              className="px-6 rounded-xl bg-[#34c759] hover:bg-[#30b350]"
            >
              <Check className="w-4 h-4 mr-2" />
              已完成
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            选择"还没有"可以继续下一个番茄钟
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskCompleteModal
