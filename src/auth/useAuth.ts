import { useContext } from "react"
import { AuthContext } from "./auth-context"

export const useAuth = () => {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error("useAuth должен вызываться внутри AuthProvider")
  }
  return value
}
