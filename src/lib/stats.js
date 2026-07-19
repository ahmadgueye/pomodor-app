const STORAGE_KEY = 'takku-stats'
const CYCLE_SIZE = 4

const DEFAULT_STATS = {
  completedFocus: 0,
  totalFocusSeconds: 0,
  cycleFilled: 0,
  lastFocusDate: null,
  streakDays: 0,
  todayCompletedFocus: 0,
  todayFocusSeconds: 0,
}

export { CYCLE_SIZE }

/** Clé jour locale YYYY-MM-DD. */
export function dateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function shiftDateKey(key, deltaDays) {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + deltaDays)
  return dateKey(dt)
}

function asNonNegInt(value) {
  return Math.max(0, Math.floor(Number(value) || 0))
}

function normalizeDayCounters(stats, today = dateKey()) {
  if (stats.lastFocusDate === today) {
    return {
      todayCompletedFocus: asNonNegInt(stats.todayCompletedFocus),
      todayFocusSeconds: asNonNegInt(stats.todayFocusSeconds),
    }
  }
  return { todayCompletedFocus: 0, todayFocusSeconds: 0 }
}

/** Streak affiché : 0 si le dernier focus n’est ni aujourd’hui ni hier. */
export function resolveStreakDays(stats, today = dateKey()) {
  const streak = asNonNegInt(stats.streakDays)
  if (!stats.lastFocusDate || streak === 0) return 0
  if (
    stats.lastFocusDate === today ||
    stats.lastFocusDate === shiftDateKey(today, -1)
  ) {
    return streak
  }
  return 0
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATS }
    const parsed = JSON.parse(raw)
    const today = dateKey()
    const base = {
      completedFocus: asNonNegInt(parsed.completedFocus),
      totalFocusSeconds: asNonNegInt(parsed.totalFocusSeconds),
      cycleFilled: Math.min(CYCLE_SIZE, asNonNegInt(parsed.cycleFilled)),
      lastFocusDate:
        typeof parsed.lastFocusDate === 'string' && parsed.lastFocusDate
          ? parsed.lastFocusDate
          : null,
      streakDays: asNonNegInt(parsed.streakDays),
      todayCompletedFocus: asNonNegInt(parsed.todayCompletedFocus),
      todayFocusSeconds: asNonNegInt(parsed.todayFocusSeconds),
    }
    const day = normalizeDayCounters(base, today)
    return {
      ...base,
      ...day,
      streakDays: resolveStreakDays(base, today),
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

/**
 * Applique un focus terminé : totaux, jour, streak, cycle.
 */
export function applyFocusComplete(prev, focusSeconds, cycleFilled) {
  const today = dateKey()
  const seconds = asNonNegInt(focusSeconds)
  const day = normalizeDayCounters(prev, today)

  let streakDays = asNonNegInt(prev.streakDays)
  if (prev.lastFocusDate === today) {
    /* même jour : streak inchangé */
  } else if (prev.lastFocusDate === shiftDateKey(today, -1)) {
    streakDays += 1
  } else {
    streakDays = 1
  }

  return {
    completedFocus: asNonNegInt(prev.completedFocus) + 1,
    totalFocusSeconds: asNonNegInt(prev.totalFocusSeconds) + seconds,
    cycleFilled: Math.min(CYCLE_SIZE, asNonNegInt(cycleFilled)),
    lastFocusDate: today,
    streakDays,
    todayCompletedFocus: day.todayCompletedFocus + 1,
    todayFocusSeconds: day.todayFocusSeconds + seconds,
  }
}

export function formatFocusTotal(seconds) {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)

  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${String(minutes).padStart(2, '0')}`
}

export function formatSessionCount(count) {
  const n = asNonNegInt(count)
  return n === 1 ? '1 session' : `${n} sessions`
}

/** Phrase sous les dots de cycle. */
export function formatCycleHint(cycleFilled) {
  const n = Math.min(CYCLE_SIZE, asNonNegInt(cycleFilled))
  const base = `${n}/${CYCLE_SIZE}`

  if (n === 0) return `${base} — prêt à démarrer`
  if (n >= CYCLE_SIZE) return `${base} — longue pause`
  if (n === CYCLE_SIZE - 1) return `${base} — bientôt la longue pause`

  const left = CYCLE_SIZE - n
  return `${base} — encore ${left} focus`
}

export function formatStreakLabel(streakDays) {
  const n = asNonNegInt(streakDays)
  if (n <= 0) return null
  return n === 1 ? '1 jour' : `${n} jours`
}
