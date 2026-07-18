const STORAGE_KEY = 'takku-todos'

export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && typeof item.text === 'string')
      .map((item) => ({
        id: String(item.id || crypto.randomUUID()),
        text: item.text.trim().slice(0, 120),
        done: Boolean(item.done),
      }))
      .filter((item) => item.text.length > 0)
  } catch {
    return []
  }
}

export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    /* ignore */
  }
}

export function createTodo(text) {
  const trimmed = text.trim().slice(0, 120)
  if (!trimmed) return null
  return {
    id: crypto.randomUUID(),
    text: trimmed,
    done: false,
  }
}
