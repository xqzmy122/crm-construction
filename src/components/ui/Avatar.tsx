import { cn } from "../../lib/cn"
import { avatarTone, initials } from "../../lib/format"

export const Avatar = ({
  name,
  id,
  size = "sm",
}: {
  name: string
  id: string
  size?: "sm" | "md"
}) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center justify-center rounded-full font-medium",
      avatarTone(id),
      size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs",
    )}
    aria-hidden="true"
  >
    {initials(name)}
  </span>
)
