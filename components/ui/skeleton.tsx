import * as React from "react"

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-base-200 dark:bg-base-700", className)}
      {...props}
    />
  )
}

export { Skeleton }
