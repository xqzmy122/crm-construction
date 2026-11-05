import { cn } from "../../lib/cn"
import { STATUS_CHIP, STATUS_LABEL } from "../../lib/status"
import type { TaskStatus } from "../../lib/types"

export const StatusChip = ({ status }: { status: TaskStatus }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-[6px] px-2 py-0.5 text-[11px] font-medium leading-4",
      STATUS_CHIP[status],
    )}
  >
    {STATUS_LABEL[status]}
  </span>
)
