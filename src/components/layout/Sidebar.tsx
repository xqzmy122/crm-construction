import { Building2, ClipboardList, LogOut } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { cn } from "../../lib/cn"
import { ROLE_LABEL } from "../../lib/labels"
import { Avatar } from "../ui/Avatar"

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-control px-2.5 py-2 text-sm",
    isActive
      ? "bg-sidebar-active text-white"
      : "text-sidebar-text hover:bg-sidebar-hover",
  )

export const Sidebar = ({
  onNavigate,
  showBrand = true,
}: {
  onNavigate?: () => void
  showBrand?: boolean
}) => {
  const { profile, signOut } = useAuth()

  const handleLogout = () => {
    void signOut()
  }

  if (!profile) return null

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-sidebar text-sidebar-text">
      {showBrand ? (
        <div className="flex items-center gap-2.5 px-4 py-4">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-control bg-white/10">
            <Building2 size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">Объекты и задачи</div>
            <div className="truncate text-xs text-sidebar-muted">
              CRM для стройки
            </div>
          </div>
        </div>
      ) : (
        <div className="h-3" />
      )}

      <nav className="flex flex-1 flex-col gap-0.5 px-2" aria-label="Разделы">
        <NavLink to="/objects" className={navClass} onClick={onNavigate}>
          <Building2 size={16} aria-hidden="true" />
          Объекты
        </NavLink>
        {profile.role === "executor" ? (
          <NavLink to="/my-tasks" className={navClass} onClick={onNavigate}>
            <ClipboardList size={16} aria-hidden="true" />
            Мои задачи
          </NavLink>
        ) : null}
      </nav>

      <div className="mt-auto border-t border-white/10 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={profile.full_name} id={profile.id} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{profile.full_name}</div>
            <div className="text-xs text-sidebar-muted">
              {ROLE_LABEL[profile.role]}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-control p-1.5 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text"
            aria-label="Выйти"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
