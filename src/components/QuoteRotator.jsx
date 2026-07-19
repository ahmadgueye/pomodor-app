import { useEffect, useMemo, useState } from 'react'
import quotes from '../data/quotes.json'

const DISPLAY_MS = 5500
const FADE_MS = 400

function matchesPhase(entry, timerPhase) {
  const phases = entry?.phases
  if (!Array.isArray(phases) || phases.length === 0) {
    return timerPhase === 'focus'
  }
  return phases.includes(timerPhase)
}

function QuoteRotator({ timerPhase = 'focus' }) {
  const pool = useMemo(
    () => quotes.filter((quote) => matchesPhase(quote, timerPhase)),
    [timerPhase],
  )

  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('in')

  useEffect(() => {
    setIndex(0)
    setPhase('in')
  }, [timerPhase])

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

  if (!quote) return null

  return (
    <div
      className="quote-rotator"
      aria-live="polite"
      data-phase={timerPhase}
    >
      <p className={`hero-tagline quote-text quote-${phase}`}>
        <span className="quote-body">« {quote.text} »</span>
        {quote.author ? (
          <cite className="quote-author">{quote.author}</cite>
        ) : null}
      </p>
    </div>
  )
}

export default QuoteRotator
