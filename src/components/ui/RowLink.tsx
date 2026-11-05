import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { cn } from "../../lib/cn"

export const RowLink = ({
  to,
  children,
  className,
}: {
  to: string
  children: ReactNode
  className?: string
}) => (
  <Link
    to={to}
    className={cn(
      "block cursor-pointer border-b border-line text-inherit last:border-0 hover:bg-bg hover:no-underline",
      className,
    )}
  >
    {children}
  </Link>
)
