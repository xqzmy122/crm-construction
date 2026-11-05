import type { ReactNode } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { ScreenMessage } from "../components/ui/ScreenMessage"
import { useAuth } from "./useAuth"

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { profile, loading } = useAuth()
  if (loading) return <ScreenMessage>Загрузка…</ScreenMessage>
  if (!profile) return <Navigate to="/login" replace />
  return children
}

export const ManagerRoute = () => {
  const { profile } = useAuth()
  if (profile?.role !== "manager") return <Navigate to="/objects" replace />
  return <Outlet />
}

export const ExecutorRoute = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth()
  if (profile?.role !== "executor") return <Navigate to="/objects" replace />
  return children
}
