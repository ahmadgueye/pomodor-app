import { useEffect, useState } from 'react'
import quotes from '../data/quotes.json'

const DISPLAY_MS = 5500
const FADE_MS = 400

function QuoteRotator() {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('in')

  useEffect(() => {
    if (!quotes.length) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
          setIndex((i) => (i + 1) % quotes.length)
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
  }, [])

  const quote = quotes[index]
  if (!quote) return null

  return (
    <div className="quote-rotator" aria-live="polite">
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
