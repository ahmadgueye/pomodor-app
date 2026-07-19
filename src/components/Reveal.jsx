import { useEffect, useState } from 'react'

const DURATION_MS = 300

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/**
 * Monte/démonte avec une courte entrée·sortie (opacity + translate).
 * Respecte prefers-reduced-motion (cut immédiat).
 */
export default function Reveal({ show, className = '', children }) {
  const [mounted, setMounted] = useState(show)
  const [open, setOpen] = useState(show)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setMounted(show)
      setOpen(show)
      return undefined
    }

    if (show) {
      setMounted(true)
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setOpen(true))
      })
      return () => window.cancelAnimationFrame(frame)
    }

    setOpen(false)
    const timer = window.setTimeout(() => setMounted(false), DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [show])

  if (!mounted) return null

  return (
    <div
      className={`reveal${open ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden={!open}
    >
      <div className="reveal-inner">{children}</div>
    </div>
  )
}
