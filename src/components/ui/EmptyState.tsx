import type { ReactNode } from "react"

export const EmptyState = ({ children }: { children: ReactNode }) => (
  <p className="px-1 py-8 text-sm text-ink-3">{children}</p>
)
