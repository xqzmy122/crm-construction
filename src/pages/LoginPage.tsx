import { Building2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { Banner } from "../components/ui/Banner"
import { Button } from "../components/ui/Button"
import { Field, Input } from "../components/ui/Field"
import { ScreenMessage } from "../components/ui/ScreenMessage"
import { toUserMessage } from "../lib/errors"

export const LoginPage = () => {
  const { profile, loading, accessError, signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading && !accessError) {
    return <ScreenMessage>Загрузка…</ScreenMessage>
  }

  if (profile) {
    return <Navigate to="/objects" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(toUserMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-start justify-center bg-bg px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand text-white">
            <Building2 size={18} aria-hidden="true" />
          </span>
          <h1 className="mt-3 text-lg font-semibold text-ink">Объекты и задачи</h1>
          <p className="text-sm text-ink-3">Вход в систему</p>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="rounded-card border border-line bg-surface p-5 shadow-sm"
        >
          {accessError || error ? (
            <Banner className="mb-4">{accessError ?? error}</Banner>
          ) : null}

          <div className="space-y-3">
            <Field label="Email">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label="Пароль">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
          </div>

          <Button type="submit" className="mt-4 w-full" disabled={busy}>
            {busy ? "Входим…" : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  )
}
