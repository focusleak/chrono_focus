import { useState } from 'react'

import { Input } from '@/components/ui/input'

interface NumberInputProps {
  value: number
  min?: number
  max?: number
  step?: number
  onSave: (value: number) => void
  className?: string
  showSeconds?: boolean
}

const formatMinutesToSeconds = (minutes: number): string => {
  const totalSeconds = Math.round(minutes * 60)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  if (mins === 0) return `${secs}秒`
  if (secs === 0) return `${mins}分钟`
  return `${mins}分${secs}秒`
}

export const NumberInput = ({
  value,
  min = 1,
  max = 999,
  step = 0.1,
  onSave,
  className,
  showSeconds = false
}: NumberInputProps) => {
  const [inputValue, setInputValue] = useState(String(value))

  const handleBlur = () => {
    const num = parseFloat(inputValue)
    if (isNaN(num) || inputValue.trim() === '') {
      setInputValue(String(value))
      return
    }
    const clamped = Math.min(max, Math.max(min, num))
    const rounded = Math.round(clamped * 10) / 10
    setInputValue(String(rounded))
    onSave(rounded)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {showSeconds && (
        <span className="text-xs text-gray-400 dark:text-gray-500 w-16 shrink-0">
          ({formatMinutesToSeconds(value)})
        </span>
      )}
    </div>
  )
}
