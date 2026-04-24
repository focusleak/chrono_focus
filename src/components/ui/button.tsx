import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-sm",
        destructive: "bg-[#ff3b30] text-white hover:bg-[#ff453a] shadow-sm",
        outline: "border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c2c2e] hover:bg-gray-100 dark:hover:bg-[#3a3a3c] dark:text-gray-100",
        secondary: "bg-[#f5f5f7] dark:bg-[#2c2c2e] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#3a3a3c]",
        ghost: "hover:bg-gray-100 dark:hover:bg-[#2c2c2e] dark:text-gray-100",
        link: "text-[#0071e3] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 rounded-xl px-4",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconPlacement?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon: Icon, iconPlacement = 'left', children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {Icon && iconPlacement === 'left' && (
          <Icon className="w-4 h-4 mr-2" />
        )}
        {children}
        {Icon && iconPlacement === 'right' && (
          <Icon className="w-4 h-4 ml-2" />
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
