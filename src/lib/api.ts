import type { PostgrestError } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import type {
  HistoryWithActor,
  Profile,
  SiteObject,
  TaskStatus,
  TaskWithJoins,
} from "./types"

export type ObjectListItem = SiteObject & { tasks: { id: string }[] }

const TASK_SELECT =
  "*, assignee:profiles!tasks_assignee_id_fkey(*), author:profiles!tasks_author_id_fkey(*), object:objects(*)"

const HISTORY_SELECT =
  "*, actor:profiles!task_status_history_changed_by_fkey(*)"

const throwIfError = (error: PostgrestError | null) => {
  if (error) throw error
}

export const fetchObjects = async () => {
  const { data, error } = await supabase
    .from("objects")
    .select("*, tasks(id)")
    .order("created_at", { ascending: false })
  throwIfError(error)
  return (data ?? []) as ObjectListItem[]
}

export const fetchObject = async (id: string) => {
  const { data, error } = await supabase
    .from("objects")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  throwIfError(error)
  return (data ?? null) as SiteObject | null
}

export const createObject = async (input: {
  name: string
  address: string
  createdBy: string
}) => {
  const { data, error } = await supabase
    .from("objects")
    .insert({
      name: input.name,
      address: input.address,
      created_by: input.createdBy,
    })
    .select("id")
    .single()
  throwIfError(error)
  return data as { id: string }
}

export const updateObject = async (
  id: string,
  input: { name: string; address: string },
) => {
  const { error } = await supabase
    .from("objects")
    .update({ name: input.name, address: input.address })
    .eq("id", id)
  throwIfError(error)
}

export const deleteObject = async (id: string) => {
  const { error } = await supabase.from("objects").delete().eq("id", id)
  throwIfError(error)
}

export const fetchTasksForObject = async (objectId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("object_id", objectId)
    .order("created_at", { ascending: false })
  throwIfError(error)
  return (data ?? []) as TaskWithJoins[]
}

export const fetchMyTasks = async (assigneeId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("assignee_id", assigneeId)
    .order("created_at", { ascending: false })
  throwIfError(error)
  return (data ?? []) as TaskWithJoins[]
}

export const fetchTask = async (id: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("id", id)
    .maybeSingle()
  throwIfError(error)
  return (data ?? null) as TaskWithJoins | null
}

export const fetchTaskHistory = async (taskId: string) => {
  const { data, error } = await supabase
    .from("task_status_history")
    .select(HISTORY_SELECT)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true })
  throwIfError(error)
  return (data ?? []) as HistoryWithActor[]
}

export const fetchExecutors = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "executor")
    .order("full_name", { ascending: true })
  throwIfError(error)
  return (data ?? []) as Profile[]
}

export const createTask = async (input: {
  title: string
  description: string
  objectId: string
  assigneeId: string
  authorId: string
}) => {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description,
      object_id: input.objectId,
      assignee_id: input.assigneeId,
      author_id: input.authorId,
      status: "new",
    })
    .select("id")
    .single()
  throwIfError(error)
  return data as { id: string }
}

export const updateTask = async (
  id: string,
  input: { title: string; description: string; assigneeId: string },
) => {
  const { error } = await supabase
    .from("tasks")
    .update({
      title: input.title,
      description: input.description,
      assignee_id: input.assigneeId,
    })
    .eq("id", id)
  throwIfError(error)
}

export const transitionTask = async (
  taskId: string,
  newStatus: TaskStatus,
  comment?: string,
) => {
  const { error } = await supabase.rpc("transition_task", {
    p_task_id: taskId,
    p_new_status: newStatus,
    p_comment: comment ?? null,
  })
  throwIfError(error)
}
