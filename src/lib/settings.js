const STORAGE_KEY = 'takku-settings'

export const DEFAULT_SETTINGS = {
  sessionLength: 25,
  breakLength: 5,
  longBreakLength: 15,
  soundEnabled: true,
  autoStartNext: true,
  completeActiveOnFocusEnd: false,
}

function clampMinutes(value, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(60, Math.max(1, Math.round(n)))
}

function asBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    return {
      sessionLength: clampMinutes(
        parsed.sessionLength,
        DEFAULT_SETTINGS.sessionLength,
      ),
      breakLength: clampMinutes(
        parsed.breakLength,
        DEFAULT_SETTINGS.breakLength,
      ),
      longBreakLength: clampMinutes(
        parsed.longBreakLength,
        DEFAULT_SETTINGS.longBreakLength,
      ),
      soundEnabled: asBoolean(
        parsed.soundEnabled,
        DEFAULT_SETTINGS.soundEnabled,
      ),
      autoStartNext: asBoolean(
        parsed.autoStartNext,
        DEFAULT_SETTINGS.autoStartNext,
      ),
      completeActiveOnFocusEnd: asBoolean(
        parsed.completeActiveOnFocusEnd,
        DEFAULT_SETTINGS.completeActiveOnFocusEnd,
      ),
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sessionLength: clampMinutes(
          settings.sessionLength,
          DEFAULT_SETTINGS.sessionLength,
        ),
        breakLength: clampMinutes(
          settings.breakLength,
          DEFAULT_SETTINGS.breakLength,
        ),
        longBreakLength: clampMinutes(
          settings.longBreakLength,
          DEFAULT_SETTINGS.longBreakLength,
        ),
        soundEnabled: Boolean(settings.soundEnabled),
        autoStartNext: Boolean(settings.autoStartNext),
        completeActiveOnFocusEnd: Boolean(settings.completeActiveOnFocusEnd),
      }),
    )
  } catch {
    /* ignore */
  }
}
