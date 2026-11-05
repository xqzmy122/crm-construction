import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { Page } from "../components/layout/Page"
import { Banner } from "../components/ui/Banner"
import { Button } from "../components/ui/Button"
import { Field, Input } from "../components/ui/Field"
import { ScreenMessage } from "../components/ui/ScreenMessage"
import { createObject, fetchObject, updateObject } from "../lib/api"
import { toUserMessage } from "../lib/errors"

export const ObjectFormPage = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [busy, setBusy] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetchObject(id)
      .then((object) => {
        if (cancelled) return
        if (!object) {
          setMissing(true)
          return
        }
        setName(object.name)
        setAddress(object.address)
      })
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
  }, [id])

  const handleCancel = () => {
    navigate(id ? `/objects/${id}` : "/objects")
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedAddress = address.trim()
    if (!trimmedName) {
      setError("Укажите название")
      return
    }
    if (!trimmedAddress) {
      setError("Укажите адрес")
      return
    }
    if (!profile) return
    setError(null)
    setBusy(true)
    try {
      if (id) {
        await updateObject(id, { name: trimmedName, address: trimmedAddress })
        navigate(`/objects/${id}`)
        return
      }
      const created = await createObject({
        name: trimmedName,
        address: trimmedAddress,
        createdBy: profile.id,
      })
      navigate(`/objects/${created.id}`)
    } catch (err) {
      setError(toUserMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <ScreenMessage>Загрузка…</ScreenMessage>
  if (missing) {
    return (
      <Page title="Объект не найден" subtitle="Проверьте ссылку и права доступа">
        <Button tone="ghost" onClick={() => navigate("/objects")}>
          К списку объектов
        </Button>
      </Page>
    )
  }

  return (
    <Page
      title={isEdit ? "Редактирование объекта" : "Новый объект"}
      subtitle={isEdit ? "Название и адрес" : "Создание строительного объекта"}
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="max-w-lg space-y-3 rounded-card border border-line bg-surface p-5 shadow-sm"
      >
        {error ? <Banner>{error}</Banner> : null}
        <Field label="Название">
          <Input
            name="name"
            required
            maxLength={200}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Адрес">
          <Input
            name="address"
            required
            maxLength={300}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button tone="ghost" onClick={handleCancel} disabled={busy}>
            Отмена
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </form>
    </Page>
  )
}
