import rituals from '../data/rituals.json'

function matchesPhase(entry, timerPhase) {
  const phases = entry?.phases
  if (!Array.isArray(phases) || phases.length === 0) return false
  return phases.includes(timerPhase)
}

export function pickBreakRitual(timerPhase) {
  const pool = rituals.filter((ritual) => matchesPhase(ritual, timerPhase))
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)].text
}
