const STORAGE_KEY = 'takku-panels'

export const DEFAULT_PANELS = {
  showTodos: true,
  showQuotes: true,
  showStats: true,
  zenMode: false,
  autoZen: true,
  zenShowQuotes: false,
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
      zenMode: asBoolean(parsed.zenMode, DEFAULT_PANELS.zenMode),
      autoZen: asBoolean(parsed.autoZen, DEFAULT_PANELS.autoZen),
      zenShowQuotes: asBoolean(
        parsed.zenShowQuotes,
        DEFAULT_PANELS.zenShowQuotes,
      ),
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
        zenMode: Boolean(panels.zenMode),
        autoZen: Boolean(panels.autoZen),
        zenShowQuotes: Boolean(panels.zenShowQuotes),
      }),
    )
  } catch {
    /* ignore */
  }
}

/** Visibilité effective des panels (zen manuel + auto-zen pendant isPlaying). */
export function resolvePanelVisibility(panels, { isPlaying, suppressZen = false }) {
  const zenActive =
    !suppressZen &&
    (Boolean(panels.zenMode) || (Boolean(panels.autoZen) && isPlaying))
  return {
    zenActive,
    showQuotes: zenActive
      ? Boolean(panels.zenShowQuotes)
      : Boolean(panels.showQuotes),
    showTodos: !zenActive && Boolean(panels.showTodos),
    showStats: !zenActive && Boolean(panels.showStats),
    showDurations: !zenActive,
  }
}
