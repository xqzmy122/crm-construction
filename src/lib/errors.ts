export const toUserMessage = (error: unknown) => {
  if (typeof error === "object" && error && "message" in error) {
    const message = String((error as { message: string }).message)
    const lower = message.toLowerCase()
    if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
      return "Неверный email или пароль"
    }
    if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("network")) {
      return "Нет соединения с сервером"
    }
    if (lower.includes("jwt") || lower.includes("not authenticated") || lower.includes("session")) {
      return "Сессия истекла. Войдите снова."
    }
    return message
  }
  return "Не удалось выполнить действие"
}
