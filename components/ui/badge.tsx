import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-base-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-base-600 text-white hover:bg-base-700",
        secondary:
          "border-transparent bg-base-100 text-base-900 dark:bg-base-800 dark:text-base-100",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: "text-base-700 dark:text-base-300 border-base-300 dark:border-base-700",
        success:
          "border-transparent bg-emerald-500 text-white",
        warning:
          "border-transparent bg-amber-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
