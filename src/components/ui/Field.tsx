import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"
import { cn } from "../../lib/cn"

const controlClass =
  "w-full rounded-control border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-4"

export const Field = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <label className="block space-y-1">
    <span className="text-sm text-ink-2">{label}</span>
    {children}
  </label>
)

export const Input = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(controlClass, className)} {...props} />
)

export const Textarea = ({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(controlClass, "min-h-28 resize-y", className)}
    {...props}
  />
)

export const Select = ({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn(controlClass, className)} {...props} />
)
