import type { ReactNode } from "react"

export const PageHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) => (
  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6">
    <div className="min-w-0">
      <h1 className="text-base font-semibold text-ink">{title}</h1>
      {subtitle ? <p className="mt-0.5 text-sm text-ink-3">{subtitle}</p> : null}
    </div>
    {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
  </header>
)

export const Page = ({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}) => (
  <>
    <PageHeader title={title} subtitle={subtitle} action={action} />
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">{children}</div>
  </>
)
