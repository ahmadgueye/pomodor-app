import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan'

export const NEAR_PRAYER_MS = 10 * 60 * 1000

export const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export const PRAYER_LABELS = {
  Fajr: 'Fajr',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha',
}

export const PRAYER_METHODS = [
  {
    id: 'MuslimWorldLeague',
    label: 'Ligue musulmane mondiale',
  },
  {
    id: 'Egyptian',
    label: 'Autorité égyptienne',
  },
  {
    id: 'MoonsightingCommittee',
    label: 'Comité d’observation lunaire',
  },
]

const METHOD_FACTORIES = {
  MuslimWorldLeague: () => CalculationMethod.MuslimWorldLeague(),
  Egyptian: () => CalculationMethod.Egyptian(),
  MoonsightingCommittee: () => CalculationMethod.MoonsightingCommittee(),
}

function resolveMethodParams(method) {
  const factory =
    METHOD_FACTORIES[method] ?? METHOD_FACTORIES.MuslimWorldLeague
  return factory()
}

/**
 * @param {Date} date
 * @param {{ lat: number, lng: number }} coords
 * @param {string} [method]
 * @returns {{ Fajr: Date, Sunrise: Date, Dhuhr: Date, Asr: Date, Maghrib: Date, Isha: Date } | null}
 */
export function getPrayerTimes(date, coords, method = 'MuslimWorldLeague') {
  if (
    !coords ||
    !Number.isFinite(coords.lat) ||
    !Number.isFinite(coords.lng)
  ) {
    return null
  }

  const coordinates = new Coordinates(coords.lat, coords.lng)
  const params = resolveMethodParams(method)
  const times = new PrayerTimes(coordinates, date, params)

  return {
    Fajr: times.fajr,
    Sunrise: times.sunrise,
    Dhuhr: times.dhuhr,
    Asr: times.asr,
    Maghrib: times.maghrib,
    Isha: times.isha,
  }
}

/**
 * @param {Date} now
 * @param {Record<string, Date> | null} times
 * @returns {{ name: string, at: Date } | null}
 */
export function getNextPrayer(now, times) {
  if (!times || !(now instanceof Date)) return null

  for (const name of PRAYER_ORDER) {
    const at = times[name]
    if (at instanceof Date && at.getTime() > now.getTime()) {
      return { name, at }
    }
  }

  return null
}

/**
 * @param {number} ms
 * @returns {string}
 */
export function formatRemaining(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '0 min'

  const totalMinutes = Math.ceil(ms / 60_000)
  if (totalMinutes < 60) return `${totalMinutes} min`

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) return `${hours} h`
  return `${hours} h ${String(minutes).padStart(2, '0')}`
}

/**
 * @param {{ at: Date } | null} next
 * @param {number} [thresholdMs]
 * @returns {boolean}
 */
export function isNearPrayer(next, thresholdMs = NEAR_PRAYER_MS) {
  if (!next?.at || !(next.at instanceof Date)) return false
  const remaining = next.at.getTime() - Date.now()
  return remaining > 0 && remaining <= thresholdMs
}

/**
 * @param {Date} date
 * @returns {string}
 */
export function formatPrayerClock(date) {
  if (!(date instanceof Date)) return ''
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
