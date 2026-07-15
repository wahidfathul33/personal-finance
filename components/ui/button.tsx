import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-base-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-base-600 text-white shadow-sm hover:bg-base-700 hover:shadow-md",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-md",
        outline:
          "border border-base-300 bg-transparent text-base-700 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-900",
        secondary:
          "bg-base-100 text-base-900 dark:bg-base-800 dark:text-base-100 hover:bg-base-200 dark:hover:bg-base-700",
        ghost: "hover:bg-base-100 dark:hover:bg-base-800 text-base-700 dark:text-base-300",
        link: "text-base-600 underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-base-600 to-base-500 text-white shadow-md hover:shadow-lg hover:from-base-700 hover:to-base-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md text-xs",
        lg: "h-12 px-6 rounded-md text-base",
        icon: "h-10 w-10",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
