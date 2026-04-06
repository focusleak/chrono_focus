import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  icon?: ReactNode
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  confirmClassName?: string
}

export const ConfirmDialog = ({
  open,
  onClose,
  icon,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  confirmClassName = 'bg-[#0071e3] hover:bg-[#0077ed] text-white',
}: ConfirmDialogProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          {icon || <AlertTriangle className="w-6 h-6" />}
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
