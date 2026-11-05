import type { ReactNode } from "react"

export const ScreenMessage = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-dvh items-center justify-center bg-bg px-4 text-sm text-ink-3">
    {children}
  </div>
)
