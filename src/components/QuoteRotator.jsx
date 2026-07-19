import { useEffect, useMemo, useState } from 'react'
import quotes from '../data/quotes.json'
import rituals from '../data/rituals.json'

const DISPLAY_MS = 5500
const FADE_MS = 400

function matchesPhase(entry, timerPhase) {
  const phases = entry?.phases
  if (!Array.isArray(phases) || phases.length === 0) {
    return timerPhase === 'focus'
  }
  return phases.includes(timerPhase)
}

function pickIndex(length) {
  if (length <= 0) return 0
  return Math.floor(Math.random() * length)
}

function QuoteRotator({ timerPhase = 'focus', showRituals = true }) {
  const pool = useMemo(
    () => quotes.filter((quote) => matchesPhase(quote, timerPhase)),
    [timerPhase],
  )
  const ritualPool = useMemo(
    () => rituals.filter((ritual) => matchesPhase(ritual, timerPhase)),
    [timerPhase],
  )

  const isBreak = timerPhase === 'break' || timerPhase === 'longBreak'
  const [index, setIndex] = useState(0)
  const [ritualIndex, setRitualIndex] = useState(0)
  const [phase, setPhase] = useState('in')

  useEffect(() => {
    setIndex(0)
    setRitualIndex(pickIndex(ritualPool.length))
    setPhase('in')
  }, [timerPhase, ritualPool.length])

  useEffect(() => {
    if (!pool.length) return undefined

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const fade = reduceMotion ? 0 : FADE_MS
    let timeoutId
    let cancelled = false

    const later = (fn, ms) => {
      timeoutId = window.setTimeout(fn, ms)
    }

    const scheduleNext = () => {
      later(() => {
        if (cancelled) return
        setPhase('out')
        later(() => {
          if (cancelled) return
          setIndex((i) => (i + 1) % pool.length)
          setPhase('in')
          scheduleNext()
        }, fade)
      }, DISPLAY_MS)
    }

    scheduleNext()

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [pool])

  const quote = pool[index % Math.max(pool.length, 1)]
  const ritual =
    isBreak && showRituals && ritualPool.length
      ? ritualPool[ritualIndex % ritualPool.length]
      : null

  if (!quote && !ritual) return null

  return (
    <div
      className={`quote-rotator${isBreak ? ' is-break' : ''}`}
      aria-live="polite"
      data-phase={timerPhase}
    >
      {quote ? (
        <p className={`hero-tagline quote-text quote-${phase}`}>
          <span className="quote-body">« {quote.text} »</span>
          {quote.author ? (
            <cite className="quote-author">{quote.author}</cite>
          ) : null}
        </p>
      ) : null}
      {ritual ? (
        <p className="quote-ritual">
          <span className="quote-ritual-label">Pause</span>
          <span className="quote-ritual-sep" aria-hidden="true">
            ·
          </span>
          <span className="quote-ritual-text">{ritual.text}</span>
        </p>
      ) : null}
    </div>
  )
}

export default QuoteRotator
