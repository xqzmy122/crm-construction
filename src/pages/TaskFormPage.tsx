import { useEffect, useState, type FormEvent } from "react"
import { useMatch, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { Page } from "../components/layout/Page"
import { Banner } from "../components/ui/Banner"
import { Button } from "../components/ui/Button"
import { Field, Input, Select, Textarea } from "../components/ui/Field"
import { ScreenMessage } from "../components/ui/ScreenMessage"
import {
  createTask,
  fetchExecutors,
  fetchObject,
  fetchTask,
  updateTask,
} from "../lib/api"
import { toUserMessage } from "../lib/errors"
import type { Profile } from "../lib/types"

export const TaskFormPage = () => {
  const params = useParams()
  const createMatch = useMatch("/objects/:objectId/tasks/new")
  const isEdit = !createMatch
  const objectId = createMatch?.params.objectId ?? ""
  const taskId = isEdit ? (params.id ?? "") : ""
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [executors, setExecutors] = useState<Profile[]>([])
  const [objectName, setObjectName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const people = await fetchExecutors()
      if (cancelled) return
      setExecutors(people)

      if (isEdit) {
        const task = await fetchTask(taskId)
        if (cancelled) return
        if (!task) {
          setMissing(true)
          return
        }
        setTitle(task.title)
        setDescription(task.description)
        setAssigneeId(task.assignee_id)
        setObjectName(task.object?.name ?? "")
        return
      }

      const object = await fetchObject(objectId)
      if (cancelled) return
      if (!object) {
        setMissing(true)
        return
      }
      setObjectName(object.name)
    }

    load()
      .catch((err: unknown) => {
        if (cancelled) return
        setError(toUserMessage(err))
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, objectId, taskId])

  const handleCancel = () => {
    navigate(isEdit ? `/tasks/${taskId}` : `/objects/${objectId}`)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError("Укажите название задачи")
      return
    }
    if (!assigneeId) {
      setError("Выберите исполнителя")
      return
    }
    if (!profile) return
    setError(null)
    setBusy(true)
    try {
      if (isEdit) {
        await updateTask(taskId, {
          title: trimmedTitle,
          description: description.trim(),
          assigneeId,
        })
        navigate(`/tasks/${taskId}`)
        return
      }
      const created = await createTask({
        title: trimmedTitle,
        description: description.trim(),
        objectId,
        assigneeId,
        authorId: profile.id,
      })
      navigate(`/tasks/${created.id}`)
    } catch (err) {
      setError(toUserMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <ScreenMessage>Загрузка…</ScreenMessage>
  if (missing) {
    return (
      <Page title="Не найдено" subtitle="Проверьте ссылку и права доступа">
        <Button tone="ghost" onClick={() => navigate("/objects")}>
          К списку объектов
        </Button>
      </Page>
    )
  }

  return (
    <Page
      title={isEdit ? "Редактирование задачи" : "Новая задача"}
      subtitle={objectName || "Поля задачи"}
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="max-w-lg space-y-3 rounded-card border border-line bg-surface p-5 shadow-sm"
      >
        {error ? <Banner>{error}</Banner> : null}
        <Field label="Название">
          <Input
            name="title"
            required
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field label="Описание">
          <Textarea
            name="description"
            maxLength={4000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <Field label="Исполнитель">
          <Select
            name="assignee"
            required
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
          >
            <option value="">Выберите исполнителя</option>
            {executors.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name}
              </option>
            ))}
          </Select>
        </Field>
        {executors.length === 0 ? (
          <p className="text-sm text-ink-3">Нет доступных исполнителей</p>
        ) : null}
        <div className="flex justify-end gap-2 pt-1">
          <Button tone="ghost" onClick={handleCancel} disabled={busy}>
            Отмена
          </Button>
          <Button type="submit" disabled={busy || executors.length === 0}>
            {busy ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </form>
    </Page>
  )
}
