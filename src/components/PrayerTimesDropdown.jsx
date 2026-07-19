import { useEffect, useId, useRef, useState } from 'react'
import {
  formatPrayerClock,
  formatRemaining,
  isNearPrayer,
  PRAYER_LABELS,
  PRAYER_ORDER,
} from '../lib/prayers'

/**
 * @param {{
 *   times: Record<string, Date> | null,
 *   next: { name: string, at: Date } | null,
 *   now: number,
 * }} props
 */
export default function PrayerTimesDropdown({ times, next, now }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const listId = useId()
  const near = isNearPrayer(next)

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!times || !next) return null

  const remainingMs = Math.max(0, next.at.getTime() - now)
  const label = PRAYER_LABELS[next.name] ?? next.name
  const closedLabel = `${label} · ${formatRemaining(remainingMs)}`

  return (
    <div
      className={`prayer-dropdown${near ? ' is-near' : ''}${open ? ' is-open' : ''}`}
      ref={rootRef}
    >
      <button
        ref={buttonRef}
        type="button"
        className="prayer-chip"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        title="Horaires de prière"
      >
        <span className="prayer-chip-label">{closedLabel}</span>
        {near ? (
          <span className="sr-only" aria-live="polite">
            {label} dans moins de 10 minutes
          </span>
        ) : null}
      </button>

      {open ? (
        <ul
          id={listId}
          className="prayer-menu is-animated"
          role="menu"
          aria-label="Horaires de prière du jour"
        >
          {PRAYER_ORDER.map((name) => {
            const at = times[name]
            const isNext =
              next.name === name &&
              at instanceof Date &&
              next.at.getTime() === at.getTime()
            return (
              <li
                key={name}
                role="menuitem"
                className={`prayer-menu-item${isNext ? ' is-next' : ''}`}
                aria-current={isNext ? 'true' : undefined}
              >
                <span className="prayer-menu-name">
                  {PRAYER_LABELS[name] ?? name}
                </span>
                <span className="prayer-menu-time">
                  {formatPrayerClock(at)}
                </span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
