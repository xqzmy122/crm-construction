import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "../../lib/cn"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "ghost" | "danger"
  children: ReactNode
}

export const Button = ({
  tone = "primary",
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-control px-3 py-2 text-sm font-medium transition-colors",
      tone === "primary" && "bg-brand text-white hover:bg-brand-hover",
      tone === "ghost" && "border border-line bg-transparent text-ink hover:bg-bg",
      tone === "danger" &&
        "bg-status-rework-bg text-status-rework-fg hover:opacity-90",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </button>
)
