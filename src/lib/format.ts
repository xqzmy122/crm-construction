const dateTime = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export const formatDateTime = (value: string) => dateTime.format(new Date(value))

export const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
}

export const avatarTone = (id: string) => {
  const tones = [
    "bg-[oklch(0.92_0.04_250)] text-[oklch(0.38_0.1_250)]",
    "bg-[oklch(0.93_0.04_155)] text-[oklch(0.38_0.08_155)]",
    "bg-[oklch(0.94_0.04_70)] text-[oklch(0.45_0.1_70)]",
    "bg-[oklch(0.93_0.03_320)] text-[oklch(0.4_0.08_320)]",
  ] as const
  let hash = 0
  for (const char of id) hash = (hash + char.charCodeAt(0)) % tones.length
  return tones[hash]
}
