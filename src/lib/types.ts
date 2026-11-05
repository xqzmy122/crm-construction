export type UserRole = "manager" | "executor"

export type TaskStatus =
  | "new"
  | "in_progress"
  | "review"
  | "accepted"
  | "rework"

export type Profile = {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export type SiteObject = {
  id: string
  name: string
  address: string
  created_by: string
  created_at: string
}

export type Task = {
  id: string
  title: string
  description: string
  object_id: string
  assignee_id: string
  author_id: string
  status: TaskStatus
  created_at: string
}

export type TaskHistoryEntry = {
  id: string
  task_id: string
  from_status: TaskStatus | null
  to_status: TaskStatus
  changed_by: string
  comment: string | null
  created_at: string
}

export type TaskWithJoins = Task & {
  assignee: Profile | null
  author: Profile | null
  object: SiteObject | null
}

export type HistoryWithActor = TaskHistoryEntry & {
  actor: Profile | null
}
