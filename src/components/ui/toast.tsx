import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

let toasts: Toast[] = []
let listeners: ((toasts: Toast[]) => void)[] = []

const notify = (message: string, type: Toast['type'] = 'info') => {
  const id = Math.random().toString(36).substr(2, 9)
  toasts = [...toasts, { id, message, type }]
  listeners.forEach(fn => fn(toasts))
  
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    listeners.forEach(fn => fn(toasts))
  }, 3000)
}

export const toast = {
  success: (message: string) => notify(message, 'success'),
  error: (message: string) => notify(message, 'error'),
  info: (message: string) => notify(message, 'info'),
  warning: (message: string) => notify(message, 'warning'),
}

export const ToastContainer = () => {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts)

  useEffect(() => {
    listeners.push(setCurrentToasts)
    return () => {
      listeners = listeners.filter(fn => fn !== setCurrentToasts)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "px-4 py-3 rounded-xl shadow-xl text-white min-w-[200px] animate-in fade-in-0 slide-in-from-top-2 backdrop-blur-sm",
            {
              'bg-green-500 dark:bg-green-600': toast.type === 'success',
              'bg-red-500 dark:bg-red-600': toast.type === 'error',
              'bg-blue-500 dark:bg-blue-600': toast.type === 'info',
              'bg-yellow-500 dark:bg-yellow-600 text-black dark:text-white': toast.type === 'warning',
            }
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
