import { formatDateTime } from "../../lib/format"
import type { HistoryWithActor } from "../../lib/types"
import { StatusChip } from "../ui/StatusChip"

export const HistoryTimeline = ({ entries }: { entries: HistoryWithActor[] }) => {
  if (entries.length === 0) {
    return <p className="text-sm text-ink-3">История пока пуста</p>
  }

  return (
    <ol>
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="relative border-l border-line pb-4 pl-4 last:pb-0"
        >
          <span className="absolute -left-1 top-1.5 h-2 w-2 rounded-full bg-accent" />
          <div className="flex flex-wrap items-center gap-2">
            {entry.from_status ? (
              <>
                <StatusChip status={entry.from_status} />
                <span className="text-ink-4">→</span>
                <StatusChip status={entry.to_status} />
              </>
            ) : (
              <StatusChip status={entry.to_status} />
            )}
          </div>
          <p className="mt-1 text-sm text-ink-3">
            {entry.actor?.full_name ?? "Система"} · {formatDateTime(entry.created_at)}
          </p>
          {entry.comment ? (
            <p className="mt-2 rounded-control bg-bg px-3 py-2 text-sm text-ink-2">
              {entry.comment}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
