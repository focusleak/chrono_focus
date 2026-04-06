import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ReactNode } from 'react'

interface ItemSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  items: {
    id: string
    label: string
    badges?: ReactNode[]
  }[]
  selectedId: string | null
  onSelect: (id: string) => void
  emptyMessage?: string
  activeClassName?: string
  inactiveClassName?: string
}

export const ItemSelectorDialog = ({
  open,
  onOpenChange,
  title,
  items,
  selectedId,
  onSelect,
  emptyMessage = '暂无可用项目',
  activeClassName = 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  inactiveClassName = 'hover:bg-gray-100 dark:hover:bg-[#3a3a3c] text-gray-900 dark:text-gray-100',
}: ItemSelectorDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {emptyMessage}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    item.id === selectedId ? activeClassName : inactiveClassName
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{item.label}</span>
                    {item.badges?.map((badge, idx) => (
                      <span key={idx}>{badge}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
