const STORAGE_KEY = 'takku-stats'
const CYCLE_SIZE = 4

const DEFAULT_STATS = {
  completedFocus: 0,
  totalFocusSeconds: 0,
  cycleFilled: 0,
}

export { CYCLE_SIZE }

export function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATS }
    const parsed = JSON.parse(raw)
    return {
      completedFocus: Math.max(0, Number(parsed.completedFocus) || 0),
      totalFocusSeconds: Math.max(0, Number(parsed.totalFocusSeconds) || 0),
      cycleFilled: Math.min(
        CYCLE_SIZE,
        Math.max(0, Number(parsed.cycleFilled) || 0),
      ),
    }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    /* ignore */
  }
}

export function nextCycleFilled(current) {
  return Math.min(current + 1, CYCLE_SIZE)
}

export function isLongBreakCycle(cycleFilled) {
  return cycleFilled >= CYCLE_SIZE
}

export function formatFocusTotal(seconds) {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)

  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${String(minutes).padStart(2, '0')}`
}
