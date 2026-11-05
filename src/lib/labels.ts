import type { UserRole } from "./types"

export const ROLE_LABEL: Record<UserRole, string> = {
  manager: "Постановщик",
  executor: "Исполнитель",
}

export const taskCountLabel = (count: number) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} задача`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} задачи`
  }
  return `${count} задач`
}
