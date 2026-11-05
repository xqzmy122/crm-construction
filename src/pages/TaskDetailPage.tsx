import { Pencil } from "lucide-react"
import { useCallback, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { Page } from "../components/layout/Page"
import { HistoryTimeline } from "../components/tasks/HistoryTimeline"
import { Avatar } from "../components/ui/Avatar"
import { Banner } from "../components/ui/Banner"
import { Button } from "../components/ui/Button"
import { Field, Textarea } from "../components/ui/Field"
import { Modal } from "../components/ui/Modal"
import { SkeletonRows } from "../components/ui/Skeleton"
import { StatusChip } from "../components/ui/StatusChip"
import { fetchTask, fetchTaskHistory, transitionTask } from "../lib/api"
import { toUserMessage } from "../lib/errors"
import { formatDateTime } from "../lib/format"
import { allowedActions, type TaskAction } from "../lib/status"
import type { TaskStatus } from "../lib/types"
import { useQuery } from "../lib/useQuery"

export const TaskDetailPage = () => {
  const { id = "" } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [commentAction, setCommentAction] = useState<TaskAction | null>(null)
  const [comment, setComment] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [task, history] = await Promise.all([
      fetchTask(id),
      fetchTaskHistory(id),
    ])
    return { task, history }
  }, [id])

  const { data, error, loading, reload } = useQuery(`task:${id}`, load)

  const runTransition = async (to: TaskStatus, nextComment?: string) => {
    setActionError(null)
    setPending(to)
    try {
      await transitionTask(id, to, nextComment)
      setCommentAction(null)
      setComment("")
      reload()
    } catch (err) {
      setActionError(toUserMessage(err))
    } finally {
      setPending(null)
    }
  }

  const handleAction = (action: TaskAction) => {
    if (action.needsComment) {
      setComment("")
      setActionError(null)
      setCommentAction(action)
      return
    }
    void runTransition(action.to)
  }

  const handleCloseComment = () => {
    if (pending) return
    setCommentAction(null)
    setComment("")
  }

  const handleSubmitComment = () => {
    if (!commentAction) return
    const trimmed = comment.trim()
    if (!trimmed) {
      setActionError("Укажите комментарий")
      return
    }
    void runTransition(commentAction.to, trimmed)
  }

  if (loading) {
    return (
      <Page title="Задача" subtitle="Загрузка">
        <SkeletonRows rows={4} />
      </Page>
    )
  }

  if (error) {
    return (
      <Page title="Задача">
        <Banner>{error}</Banner>
      </Page>
    )
  }

  if (!data?.task || !profile) {
    return (
      <Page title="Задача не найдена" subtitle="Проверьте ссылку и права доступа">
        <Button tone="ghost" onClick={() => navigate("/objects")}>
          К списку объектов
        </Button>
      </Page>
    )
  }

  const { task, history } = data
  const actions = allowedActions(
    task.status,
    profile.role,
    task.assignee_id === profile.id,
  )

  return (
    <Page
      title={task.title}
      subtitle={task.object?.name ?? "Задача"}
      action={
        <>
          {profile.role === "manager" ? (
            <Button
              tone="ghost"
              onClick={() => navigate(`/tasks/${task.id}/edit`)}
            >
              <Pencil size={14} aria-hidden="true" />
              Изменить
            </Button>
          ) : null}
          {actions.map((action) => (
            <Button
              key={action.to}
              tone={action.tone}
              disabled={Boolean(pending)}
              onClick={() => handleAction(action)}
            >
              {pending === action.to ? "Сохранение…" : action.label}
            </Button>
          ))}
        </>
      }
    >
      {actionError && !commentAction ? (
        <Banner className="mb-4">{actionError}</Banner>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <section className="rounded-card border border-line bg-surface p-5 shadow-sm">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-ink-4">Статус</dt>
              <dd className="mt-1">
                <StatusChip status={task.status} />
              </dd>
            </div>
            <div>
              <dt className="text-ink-4">Объект</dt>
              <dd className="mt-1 text-ink">
                {task.object ? (
                  <Link
                    to={`/objects/${task.object.id}`}
                    className="text-accent hover:underline"
                  >
                    {task.object.name}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-ink-4">Исполнитель</dt>
              <dd className="mt-1 flex items-center gap-2 text-ink">
                {task.assignee ? (
                  <>
                    <Avatar
                      name={task.assignee.full_name}
                      id={task.assignee.id}
                    />
                    {task.assignee.full_name}
                  </>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-ink-4">Постановщик</dt>
              <dd className="mt-1 flex items-center gap-2 text-ink">
                {task.author ? (
                  <>
                    <Avatar name={task.author.full_name} id={task.author.id} />
                    {task.author.full_name}
                  </>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-ink-4">Создана</dt>
              <dd className="mt-1 text-ink">{formatDateTime(task.created_at)}</dd>
            </div>
            <div>
              <dt className="text-ink-4">Описание</dt>
              <dd className="mt-1 whitespace-pre-wrap text-ink">
                {task.description || "Без описания"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-card border border-line bg-surface p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-ink">История</h2>
          <HistoryTimeline entries={history} />
        </section>
      </div>

      {commentAction ? (
        <Modal title={commentAction.label} onClose={handleCloseComment}>
          <p className="mb-3 text-sm text-ink-3">
            Укажите причину возврата на доработку.
          </p>
          {actionError ? <Banner className="mb-3">{actionError}</Banner> : null}
          <Field label="Комментарий">
            <Textarea
              name="comment"
              required
              maxLength={2000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </Field>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              tone="ghost"
              onClick={handleCloseComment}
              disabled={Boolean(pending)}
            >
              Отмена
            </Button>
            <Button
              tone="danger"
              onClick={handleSubmitComment}
              disabled={Boolean(pending)}
            >
              {pending ? "Сохранение…" : commentAction.label}
            </Button>
          </div>
        </Modal>
      ) : null}
    </Page>
  )
}
