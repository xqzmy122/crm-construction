import { Building2, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export const AppShell = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleOpenMenu = () => setMenuOpen(true)
  const handleCloseMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [menuOpen])

  return (
    <div className="min-h-dvh bg-bg lg:flex">
      <div className="relative z-50 flex items-center justify-between bg-sidebar px-3 py-2 text-sidebar-text lg:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-control bg-white/10">
            <Building2 size={14} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium">Объекты и задачи</span>
        </div>
        <button
          type="button"
          className="rounded-control p-1.5 hover:bg-sidebar-hover"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          onClick={menuOpen ? handleCloseMenu : handleOpenMenu}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-11 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={handleCloseMenu}
            role="presentation"
          />
          <div className="relative h-full w-64 max-w-[85vw] shadow-md">
            <Sidebar onNavigate={handleCloseMenu} showBrand={false} />
          </div>
        </div>
      ) : null}

      <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
