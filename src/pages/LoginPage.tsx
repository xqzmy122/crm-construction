import { Building2 } from "lucide-react"
import { useState, type FormEvent, type KeyboardEvent } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { Banner } from "../components/ui/Banner"
import { Button } from "../components/ui/Button"
import { Field, Input } from "../components/ui/Field"
import { ScreenMessage } from "../components/ui/ScreenMessage"
import { toUserMessage } from "../lib/errors"

const DEMO_ACCOUNTS = [
  {
    email: "anna@crm-demo.com",
    password: "Manager123!",
    role: "Постановщик",
    name: "Анна Петрова",
  },
  {
    email: "elena@crm-demo.com",
    password: "Elena123456!",
    role: "Постановщик",
    name: "Елена Орлова",
  },
  {
    email: "ivan@crm-demo.com",
    password: "Ivan123456!",
    role: "Исполнитель",
    name: "Иван Сидоров",
  },
  {
    email: "olga@crm-demo.com",
    password: "Olga123456!",
    role: "Исполнитель",
    name: "Ольга Козлова",
  },
] as const

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

  const handlePickDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError(null)
  }

  const handleDemoKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    account: (typeof DEMO_ACCOUNTS)[number],
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handlePickDemo(account)
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

        <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface shadow-sm">
          <p className="border-b border-line px-3 py-2 text-xs text-ink-4">
            Демо-доступ для проверки
          </p>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-4">
                <th className="px-3 py-2 font-medium">Учётная запись</th>
                <th className="px-3 py-2 font-medium">Роль</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ACCOUNTS.map((account) => (
                <tr
                  key={account.email}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer border-b border-line last:border-0 hover:bg-bg"
                  onClick={() => handlePickDemo(account)}
                  onKeyDown={(event) => handleDemoKeyDown(event, account)}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-ink">{account.name}</div>
                    <div className="font-mono text-ink-3">{account.email}</div>
                    <div className="font-mono text-ink-4">{account.password}</div>
                  </td>
                  <td className="px-3 py-2 text-ink-2">{account.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
