const STORAGE_KEY = 'takku-todos'

function normalizeTodo(item) {
  if (!item || typeof item.text !== 'string') return null
  const text = item.text.trim().slice(0, 120)
  if (!text) return null
  return {
    id: String(item.id || crypto.randomUUID()),
    text,
    done: Boolean(item.done),
  }
}

function normalizeItems(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeTodo).filter(Boolean)
}

function resolveActiveId(activeId, items) {
  if (typeof activeId !== 'string' || !activeId) return null
  const match = items.find((item) => item.id === activeId)
  if (!match || match.done) return null
  return match.id
}

export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], activeId: null }
    const parsed = JSON.parse(raw)

    // Legacy: bare array of todos
    if (Array.isArray(parsed)) {
      const items = normalizeItems(parsed)
      return { items, activeId: null }
    }

    const items = normalizeItems(parsed?.items)
    return {
      items,
      activeId: resolveActiveId(parsed?.activeId, items),
    }
  } catch {
    return { items: [], activeId: null }
  }
}

export function saveTodos({ items, activeId }) {
  try {
    const list = Array.isArray(items) ? items : []
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        items: list,
        activeId: resolveActiveId(activeId, list),
      }),
    )
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

export function getActiveTodo(items, activeId) {
  if (!activeId || !Array.isArray(items)) return null
  return items.find((item) => item.id === activeId && !item.done) ?? null
}
