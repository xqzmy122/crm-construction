import type { ReactNode } from "react"
import { cn } from "../../lib/cn"

export const Banner = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <div
    role="alert"
    className={cn(
      "rounded-control border border-status-rework-fg/20 bg-status-rework-bg px-3 py-2 text-sm text-status-rework-fg",
      className,
    )}
  >
    {children}
  </div>
)
