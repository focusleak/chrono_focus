import { cn } from "@/lib/utils"

interface SegmentedOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

interface SegmentedProps {
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

const Segmented = ({ options, value, onChange, className }: SegmentedProps) => {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {options.map((option) => {
        const Icon = option.icon
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              value === option.value && "bg-background text-foreground shadow-sm"
            )}
          >
            {Icon && <Icon className="w-4 h-4 mr-1.5" />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export { Segmented }
