import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { Page } from "../components/layout/Page"
import { Banner } from "../components/ui/Banner"
import { Button } from "../components/ui/Button"
import { EmptyState } from "../components/ui/EmptyState"
import { RowLink } from "../components/ui/RowLink"
import { SkeletonRows } from "../components/ui/Skeleton"
import { fetchObjects } from "../lib/api"
import { taskCountLabel } from "../lib/labels"
import { useQuery } from "../lib/useQuery"

export const ObjectsPage = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { data, error, loading } = useQuery("objects", fetchObjects)

  const handleCreate = () => {
    navigate("/objects/new")
  }

  return (
    <Page
      title="Объекты"
      subtitle="Строительные объекты и связанные задачи"
      action={
        profile?.role === "manager" ? (
          <Button onClick={handleCreate}>
            <Plus size={16} aria-hidden="true" />
            Новый объект
          </Button>
        ) : null
      }
    >
      {error ? <Banner className="mb-3">{error}</Banner> : null}
      {loading ? <SkeletonRows /> : null}
      {!loading && data && data.length === 0 ? (
        <EmptyState>Пока нет объектов</EmptyState>
      ) : null}
      {!loading && data && data.length > 0 ? (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
          <div className="hidden border-b border-line px-4 py-2 text-xs font-medium text-ink-4 sm:grid sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_7rem]">
            <span>Название</span>
            <span>Адрес</span>
            <span className="text-right">Задачи</span>
          </div>
          {data.map((object) => (
            <RowLink key={object.id} to={`/objects/${object.id}`}>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_7rem] sm:items-center">
                <div>
                  <div className="font-medium text-ink">{object.name}</div>
                  <div className="text-sm text-ink-3 sm:hidden">
                    {object.address}
                  </div>
                </div>
                <div className="hidden text-sm text-ink-2 sm:block">
                  {object.address}
                </div>
                <div className="text-sm text-ink-3 sm:text-right">
                  {taskCountLabel(object.tasks.length)}
                </div>
              </div>
            </RowLink>
          ))}
        </div>
      ) : null}
    </Page>
  )
}
