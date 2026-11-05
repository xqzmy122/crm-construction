import type { TaskStatus, UserRole } from "./types"

export const STATUS_LABEL: Record<TaskStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  review: "На проверке",
  accepted: "Принята",
  rework: "На доработке",
}

export const STATUS_CHIP: Record<TaskStatus, string> = {
  new: "bg-status-new-bg text-status-new-fg",
  in_progress: "bg-status-progress-bg text-status-progress-fg",
  review: "bg-status-review-bg text-status-review-fg",
  accepted: "bg-status-accepted-bg text-status-accepted-fg",
  rework: "bg-status-rework-bg text-status-rework-fg",
}

export type TaskAction = {
  to: TaskStatus
  label: string
  tone: "primary" | "danger" | "ghost"
  needsComment: boolean
}

export const allowedActions = (
  status: TaskStatus,
  role: UserRole,
  isAssignee: boolean
): TaskAction[] => {
  if (role === "executor" && isAssignee) {
    if (status === "new") {
      return [{ to: "in_progress", label: "Взять в работу", tone: "primary", needsComment: false }]
    }
    if (status === "in_progress") {
      return [{ to: "review", label: "Отправить на проверку", tone: "primary", needsComment: false }]
    }
    if (status === "rework") {
      return [{ to: "in_progress", label: "Вернуть в работу", tone: "primary", needsComment: false }]
    }
  }

  if (role === "manager" && status === "review") {
    return [
      { to: "accepted", label: "Принять", tone: "primary", needsComment: false },
      { to: "rework", label: "На доработку", tone: "danger", needsComment: true },
    ]
  }

  return []
}
