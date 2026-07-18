import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

function SettingToggle({ id, label, description, checked, onChange }) {
  return (
    <label className="setting-row" htmlFor={id}>
      <span className="setting-row-text">
        <span className="setting-row-label">{label}</span>
        {description ? (
          <span className="setting-row-desc">{description}</span>
        ) : null}
      </span>
      <input
        id={id}
        type="checkbox"
        className="setting-switch"
        checked={checked}
        onChange={onChange}
      />
    </label>
  )
}

export default function SettingsDrawer({
  open,
  onClose,
  theme,
  onToggleTheme,
  panels,
  onTogglePanel,
  soundEnabled,
  onToggleSound,
  autoStartNext,
  onToggleAutoStart,
}) {
  const titleId = useId()
  const closeRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    previouslyFocused.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frame = window.requestAnimationFrame(() => {
      closeRef.current?.focus()
    })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
      if (
        previouslyFocused.current instanceof HTMLElement &&
        document.contains(previouslyFocused.current)
      ) {
        previouslyFocused.current.focus()
      }
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="drawer-root">
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Fermer les réglages"
        onClick={onClose}
      />
      <aside
        className="settings-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="drawer-header">
          <h2 id={titleId} className="drawer-title">
            Réglages
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="drawer-close"
            aria-label="Fermer"
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18 17.94 6M18 18 6.06 6"
              />
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          <section className="drawer-section" aria-labelledby="settings-display">
            <h3 id="settings-display" className="drawer-section-title">
              Affichage
            </h3>
            <div className="drawer-section-list">
              <SettingToggle
                id="setting-theme"
                label="Mode sombre"
                description="Fond sombre par défaut"
                checked={theme === 'dark'}
                onChange={onToggleTheme}
              />
              <SettingToggle
                id="setting-todos"
                label="Tâches"
                description="Liste sous le timer"
                checked={panels.showTodos}
                onChange={() => onTogglePanel('showTodos')}
              />
              <SettingToggle
                id="setting-quotes"
                label="Citations"
                description="Phrase au-dessus du timer"
                checked={panels.showQuotes}
                onChange={() => onTogglePanel('showQuotes')}
              />
              <SettingToggle
                id="setting-stats"
                label="Progression"
                description="Points de cycle et totaux"
                checked={panels.showStats}
                onChange={() => onTogglePanel('showStats')}
              />
            </div>
          </section>

          <section className="drawer-section" aria-labelledby="settings-timer">
            <h3 id="settings-timer" className="drawer-section-title">
              Timer
            </h3>
            <div className="drawer-section-list">
              <SettingToggle
                id="setting-autostart"
                label="Enchaîner automatiquement"
                description="Passe à la phase suivante sans pause"
                checked={autoStartNext}
                onChange={onToggleAutoStart}
              />
            </div>
          </section>

          <section className="drawer-section" aria-labelledby="settings-sound">
            <h3 id="settings-sound" className="drawer-section-title">
              Son
            </h3>
            <div className="drawer-section-list">
              <SettingToggle
                id="setting-sound"
                label="Son de fin"
                description="Beep à la fin d’une phase"
                checked={soundEnabled}
                onChange={onToggleSound}
              />
            </div>
          </section>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
