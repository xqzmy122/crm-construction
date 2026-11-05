import type { Session } from "@supabase/supabase-js"
import { createContext } from "react"
import type { Profile } from "../lib/types"

export type AuthValue = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  accessError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)
