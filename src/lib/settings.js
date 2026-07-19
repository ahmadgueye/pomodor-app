const STORAGE_KEY = 'takku-settings'

export const DEFAULT_SETTINGS = {
  sessionLength: 25,
  breakLength: 5,
  longBreakLength: 15,
  soundEnabled: true,
  autoStartNext: true,
  completeActiveOnFocusEnd: false,
  prayersEnabled: true,
  prayerCoords: null,
  prayerCityLabel: '',
  prayerMethod: 'MuslimWorldLeague',
}

const PRAYER_METHODS = new Set([
  'MuslimWorldLeague',
  'Egyptian',
  'MoonsightingCommittee',
])

function clampMinutes(value, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(60, Math.max(1, Math.round(n)))
}

function asBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

function asPrayerCoords(value) {
  if (!value || typeof value !== 'object') return null
  const lat = Number(value.lat)
  const lng = Number(value.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}

function asPrayerMethod(value) {
  return PRAYER_METHODS.has(value) ? value : DEFAULT_SETTINGS.prayerMethod
}

function asCityLabel(value) {
  return typeof value === 'string' ? value : DEFAULT_SETTINGS.prayerCityLabel
}

function normalizeSettings(raw) {
  return {
    sessionLength: clampMinutes(
      raw.sessionLength,
      DEFAULT_SETTINGS.sessionLength,
    ),
    breakLength: clampMinutes(raw.breakLength, DEFAULT_SETTINGS.breakLength),
    longBreakLength: clampMinutes(
      raw.longBreakLength,
      DEFAULT_SETTINGS.longBreakLength,
    ),
    soundEnabled: asBoolean(raw.soundEnabled, DEFAULT_SETTINGS.soundEnabled),
    autoStartNext: asBoolean(raw.autoStartNext, DEFAULT_SETTINGS.autoStartNext),
    completeActiveOnFocusEnd: asBoolean(
      raw.completeActiveOnFocusEnd,
      DEFAULT_SETTINGS.completeActiveOnFocusEnd,
    ),
    prayersEnabled: asBoolean(
      raw.prayersEnabled,
      DEFAULT_SETTINGS.prayersEnabled,
    ),
    prayerCoords: asPrayerCoords(raw.prayerCoords),
    prayerCityLabel: asCityLabel(raw.prayerCityLabel),
    prayerMethod: asPrayerMethod(raw.prayerMethod),
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return normalizeSettings(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalizeSettings(settings)),
    )
  } catch {
    /* ignore */
  }
}
