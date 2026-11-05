import type { Session } from "@supabase/supabase-js"
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { supabase } from "../lib/supabase"
import type { Profile } from "../lib/types"
import { AuthContext } from "./auth-context"

const NO_PROFILE = "Нет доступа. Учётную запись создаёт администратор."

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessError, setAccessError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadProfile = (nextSession: Session | null) => {
      setSession(nextSession)
      window.setTimeout(() => {
        void (async () => {
          if (cancelled) return
          if (!nextSession) {
            setProfile(null)
            setLoading(false)
            return
          }

          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", nextSession.user.id)
            .maybeSingle()

          if (cancelled) return

          if (error) {
            setProfile(null)
            setAccessError("Не удалось загрузить профиль")
            setLoading(false)
            return
          }

          if (!data) {
            setAccessError(NO_PROFILE)
            setProfile(null)
            setLoading(false)
            await supabase.auth.signOut()
            return
          }

          setAccessError(null)
          setProfile(data as Profile)
          setLoading(false)
        })()
      }, 0)
    }

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "TOKEN_REFRESHED") {
        setSession(nextSession)
        return
      }
      setLoading(true)
      loadProfile(nextSession)
    })

    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setAccessError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    setAccessError(null)
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo(
    () => ({ session, profile, loading, accessError, signIn, signOut }),
    [session, profile, loading, accessError, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
