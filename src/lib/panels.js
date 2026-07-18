const STORAGE_KEY = 'takku-panels'

export const DEFAULT_PANELS = {
  showTodos: true,
  showQuotes: true,
  showStats: true,
}

function asBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

export function loadPanels() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PANELS }
    const parsed = JSON.parse(raw)
    return {
      showTodos: asBoolean(parsed.showTodos, DEFAULT_PANELS.showTodos),
      showQuotes: asBoolean(parsed.showQuotes, DEFAULT_PANELS.showQuotes),
      showStats: asBoolean(parsed.showStats, DEFAULT_PANELS.showStats),
    }
  } catch {
    return { ...DEFAULT_PANELS }
  }
}

export function savePanels(panels) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        showTodos: Boolean(panels.showTodos),
        showQuotes: Boolean(panels.showQuotes),
        showStats: Boolean(panels.showStats),
      }),
    )
  } catch {
    /* ignore */
  }
}
