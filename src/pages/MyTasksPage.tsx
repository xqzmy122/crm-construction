import { useMemo, useState } from "react"
import { useAuth } from "../auth/useAuth"
import { Page } from "../components/layout/Page"
import { Banner } from "../components/ui/Banner"
import { EmptyState } from "../components/ui/EmptyState"
import { RowLink } from "../components/ui/RowLink"
import { SkeletonRows } from "../components/ui/Skeleton"
import { StatusChip } from "../components/ui/StatusChip"
import { fetchMyTasks } from "../lib/api"
import { cn } from "../lib/cn"
import { formatDateTime } from "../lib/format"
import { STATUS_LABEL } from "../lib/status"
import type { TaskStatus } from "../lib/types"
import { useQuery } from "../lib/useQuery"

const FILTERS: Array<{ id: "all" | TaskStatus; label: string }> = [
  { id: "all", label: "Все" },
  { id: "new", label: STATUS_LABEL.new },
  { id: "in_progress", label: STATUS_LABEL.in_progress },
  { id: "review", label: STATUS_LABEL.review },
  { id: "accepted", label: STATUS_LABEL.accepted },
  { id: "rework", label: STATUS_LABEL.rework },
]

export const MyTasksPage = () => {
  const { profile } = useAuth()
  const [filter, setFilter] = useState<"all" | TaskStatus>("all")
  const { data, error, loading } = useQuery(
    `my-tasks:${profile?.id ?? ""}`,
    () => fetchMyTasks(profile?.id ?? ""),
  )

  const visible = useMemo(() => {
    if (!data) return []
    if (filter === "all") return data
    return data.filter((task) => task.status === filter)
  }, [data, filter])

  return (
    <Page title="Мои задачи" subtitle="Задачи, назначенные вам">
      <div
        className="mb-4 inline-flex flex-wrap rounded-control border border-line bg-surface p-0.5"
        role="group"
        aria-label="Фильтр по статусу"
      >
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "cursor-pointer rounded-[6px] px-2.5 py-1 text-xs font-medium",
              filter === item.id
                ? "bg-brand text-white"
                : "text-ink-3 hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <Banner className="mb-3">{error}</Banner> : null}
      {loading ? <SkeletonRows /> : null}
      {!loading && visible.length === 0 ? (
        <EmptyState>
          {filter === "all" ? "Нет назначенных задач" : "Нет задач с этим статусом"}
        </EmptyState>
      ) : null}
      {!loading && visible.length > 0 ? (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
          <div className="hidden border-b border-line px-4 py-2 text-xs font-medium text-ink-4 sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_8rem_9rem]">
            <span>Задача</span>
            <span>Объект</span>
            <span>Статус</span>
            <span>Создана</span>
          </div>
          {visible.map((task) => (
            <RowLink key={task.id} to={`/tasks/${task.id}`}>
              <div className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_8rem_9rem] sm:items-center">
                <div>
                  <div className="font-medium text-ink">{task.title}</div>
                  <div className="text-sm text-ink-3 sm:hidden">
                    {task.object?.name ?? "—"}
                  </div>
                </div>
                <div className="hidden truncate text-sm text-ink-2 sm:block">
                  {task.object?.name ?? "—"}
                </div>
                <div>
                  <StatusChip status={task.status} />
                </div>
                <div className="text-sm text-ink-3">
                  {formatDateTime(task.created_at)}
                </div>
              </div>
            </RowLink>
          ))}
        </div>
      ) : null}
    </Page>
  )
}
