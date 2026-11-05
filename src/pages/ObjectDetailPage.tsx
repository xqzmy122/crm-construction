import { Pencil, Plus, Trash2 } from "lucide-react"
import { useCallback, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { Page } from "../components/layout/Page"
import { Avatar } from "../components/ui/Avatar"
import { Banner } from "../components/ui/Banner"
import { Button } from "../components/ui/Button"
import { EmptyState } from "../components/ui/EmptyState"
import { Modal } from "../components/ui/Modal"
import { RowLink } from "../components/ui/RowLink"
import { SkeletonRows } from "../components/ui/Skeleton"
import { StatusChip } from "../components/ui/StatusChip"
import { deleteObject, fetchObject, fetchTasksForObject } from "../lib/api"
import { toUserMessage } from "../lib/errors"
import { formatDateTime } from "../lib/format"
import { useQuery } from "../lib/useQuery"

export const ObjectDetailPage = () => {
  const { id = "" } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    const [object, tasks] = await Promise.all([
      fetchObject(id),
      fetchTasksForObject(id),
    ])
    return { object, tasks }
  }, [id])

  const { data, error, loading } = useQuery(`object:${id}`, load)
  const isManager = profile?.role === "manager"

  const handleCloseDelete = () => {
    setConfirmDelete(false)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    setDeleteError(null)
    setDeleting(true)
    try {
      await deleteObject(id)
      navigate("/objects")
    } catch (err) {
      setDeleteError(toUserMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Page title="Объект" subtitle="Загрузка">
        <SkeletonRows rows={4} />
      </Page>
    )
  }

  if (error) {
    return (
      <Page title="Объект">
        <Banner>{error}</Banner>
      </Page>
    )
  }

  if (!data?.object) {
    return (
      <Page title="Объект не найден" subtitle="Проверьте ссылку и права доступа">
        <Button tone="ghost" onClick={() => navigate("/objects")}>
          К списку объектов
        </Button>
      </Page>
    )
  }

  const { object, tasks } = data

  return (
    <Page
      title={object.name}
      subtitle={object.address}
      action={
        isManager ? (
          <>
            <Button
              tone="ghost"
              onClick={() => navigate(`/objects/${object.id}/edit`)}
            >
              <Pencil size={14} aria-hidden="true" />
              Изменить
            </Button>
            <Button
              tone="danger"
              onClick={() => setConfirmDelete(true)}
              aria-label="Удалить объект"
            >
              <Trash2 size={14} aria-hidden="true" />
              Удалить
            </Button>
            <Button onClick={() => navigate(`/objects/${object.id}/tasks/new`)}>
              <Plus size={16} aria-hidden="true" />
              Новая задача
            </Button>
          </>
        ) : null
      }
    >
      {tasks.length === 0 ? (
        <EmptyState>У объекта пока нет задач</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
          <div className="hidden border-b border-line px-4 py-2 text-xs font-medium text-ink-4 sm:grid sm:grid-cols-[minmax(0,1.4fr)_8rem_minmax(0,1fr)_9rem]">
            <span>Задача</span>
            <span>Статус</span>
            <span>Исполнитель</span>
            <span>Создана</span>
          </div>
          {tasks.map((task) => (
            <RowLink key={task.id} to={`/tasks/${task.id}`}>
              <div className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1.4fr)_8rem_minmax(0,1fr)_9rem] sm:items-center">
                <div className="font-medium text-ink">{task.title}</div>
                <div>
                  <StatusChip status={task.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-2">
                  {task.assignee ? (
                    <>
                      <Avatar
                        name={task.assignee.full_name}
                        id={task.assignee.id}
                      />
                      <span className="truncate">{task.assignee.full_name}</span>
                    </>
                  ) : (
                    <span className="text-ink-4">Не назначен</span>
                  )}
                </div>
                <div className="text-sm text-ink-3">
                  {formatDateTime(task.created_at)}
                </div>
              </div>
            </RowLink>
          ))}
        </div>
      )}

      {confirmDelete ? (
        <Modal title="Удалить объект?" onClose={handleCloseDelete}>
          <p className="text-sm text-ink-2">
            Объект «{object.name}» и все его задачи будут удалены.
          </p>
          {deleteError ? <Banner className="mt-3">{deleteError}</Banner> : null}
          <div className="mt-4 flex justify-end gap-2">
            <Button tone="ghost" onClick={handleCloseDelete} disabled={deleting}>
              Отмена
            </Button>
            <Button
              tone="danger"
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
            >
              {deleting ? "Удаление…" : "Удалить"}
            </Button>
          </div>
        </Modal>
      ) : null}
    </Page>
  )
}
