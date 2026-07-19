import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import prayerCities from '../data/prayer-cities.json'
import { PRAYER_METHODS } from '../lib/prayers'

const EXIT_MS = 300
const GEO_TIMEOUT_MS = 10_000

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

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
  completeActiveOnFocusEnd,
  onToggleCompleteActive,
  prayersEnabled,
  onTogglePrayers,
  prayerCityLabel,
  prayerMethod,
  onPrayerMethodChange,
  onUseGeolocation,
  onSelectPrayerCity,
}) {
  const titleId = useId()
  const closeRef = useRef(null)
  const previouslyFocused = useRef(null)
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  const [geoStatus, setGeoStatus] = useState('idle')
  const [geoError, setGeoError] = useState('')

  const selectedCityId =
    prayerCities.find((city) => city.label === prayerCityLabel)?.id ?? ''

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      setGeoError('Géolocalisation indisponible sur cet appareil.')
      return
    }

    setGeoStatus('loading')
    setGeoError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onUseGeolocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setGeoStatus('ready')
      },
      () => {
        setGeoStatus('error')
        setGeoError('Impossible d’obtenir la position. Choisis une ville.')
      },
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS, maximumAge: 300_000 },
    )
  }

  useEffect(() => {
    if (prefersReducedMotion()) {
      setMounted(open)
      setClosing(false)
      return undefined
    }

    if (open) {
      setMounted(true)
      setClosing(false)
      return undefined
    }

    if (!mounted) return undefined

    setClosing(true)
    const timer = window.setTimeout(() => {
      setMounted(false)
      setClosing(false)
    }, EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [open, mounted])

  useEffect(() => {
    if (!mounted) return undefined

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
  }, [mounted, onClose])

  if (!mounted) return null

  return createPortal(
    <div className={`drawer-root${closing ? ' is-closing' : ''}`}>
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Fermer les réglages"
        onClick={closing ? undefined : onClose}
        tabIndex={closing ? -1 : undefined}
      />
      <aside
        className="settings-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={closing || undefined}
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
            disabled={closing}
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
                id="setting-rituals"
                label="Rituels de pause"
                description="Suggestion à côté du label Break"
                checked={panels.showRituals}
                onChange={() => onTogglePanel('showRituals')}
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

          <section className="drawer-section" aria-labelledby="settings-zen">
            <h3 id="settings-zen" className="drawer-section-title">
              Mode zen
            </h3>
            <div className="drawer-section-list">
              <SettingToggle
                id="setting-zen"
                label="Zen"
                description="Cache tâches et durées"
                checked={panels.zenMode}
                onChange={() => onTogglePanel('zenMode')}
              />
              <SettingToggle
                id="setting-auto-zen"
                label="Zen auto"
                description="Masque le superflu pendant le timer"
                checked={panels.autoZen}
                onChange={() => onTogglePanel('autoZen')}
              />
              <SettingToggle
                id="setting-zen-quotes"
                label="Citations en zen"
                description="Garde la phrase au-dessus du timer"
                checked={panels.zenShowQuotes}
                onChange={() => onTogglePanel('zenShowQuotes')}
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
              <SettingToggle
                id="setting-complete-active"
                label="Terminer l’intention"
                description="Marque la tâche active comme faite en fin de focus"
                checked={completeActiveOnFocusEnd}
                onChange={onToggleCompleteActive}
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
                description="Beep discret à la fin d’une phase"
                checked={soundEnabled}
                onChange={onToggleSound}
              />
            </div>
          </section>

          <section className="drawer-section" aria-labelledby="settings-salah">
            <h3 id="settings-salah" className="drawer-section-title">
              Salah
            </h3>
            <div className="drawer-section-list">
              <SettingToggle
                id="setting-prayers"
                label="Horaires de prière"
                description="Prochaine prière dans le header"
                checked={prayersEnabled}
                onChange={onTogglePrayers}
              />
            </div>

            {prayersEnabled ? (
              <div className="drawer-salah-controls">
                <button
                  type="button"
                  className="drawer-salah-btn"
                  onClick={handleUseLocation}
                  disabled={geoStatus === 'loading' || closing}
                >
                  {geoStatus === 'loading'
                    ? 'Localisation…'
                    : 'Utiliser ma position'}
                </button>
                {prayerCityLabel ? (
                  <p className="drawer-salah-hint">
                    Lieu : {prayerCityLabel}
                  </p>
                ) : (
                  <p className="drawer-salah-hint">
                    Active ta position ou choisis une ville pour afficher les
                    horaires.
                  </p>
                )}
                {geoError ? (
                  <p className="drawer-salah-error" role="alert">
                    {geoError}
                  </p>
                ) : null}

                <label className="drawer-field" htmlFor="setting-prayer-city">
                  <span className="drawer-field-label">Ville</span>
                  <select
                    id="setting-prayer-city"
                    className="drawer-select"
                    value={selectedCityId}
                    onChange={(event) => {
                      const city = prayerCities.find(
                        (item) => item.id === event.target.value,
                      )
                      if (city) onSelectPrayerCity(city)
                    }}
                  >
                    <option value="" disabled>
                      Choisir une ville
                    </option>
                    {prayerCities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="drawer-field" htmlFor="setting-prayer-method">
                  <span className="drawer-field-label">Méthode de calcul</span>
                  <select
                    id="setting-prayer-method"
                    className="drawer-select"
                    value={prayerMethod}
                    onChange={(event) =>
                      onPrayerMethodChange(event.target.value)
                    }
                  >
                    {PRAYER_METHODS.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <p className="drawer-salah-hint">
                Active les horaires pour voir la prochaine prière dans le
                header — calcul local, rien ne quitte ton appareil.
              </p>
            )}
          </section>

          <section className="drawer-section" aria-labelledby="settings-shortcuts">
            <h3 id="settings-shortcuts" className="drawer-section-title">
              Raccourcis
            </h3>
            <ul className="drawer-shortcuts" aria-label="Raccourcis clavier">
              <li>
                <kbd>Espace</kbd>
                <span>Démarrer / pause</span>
              </li>
              <li>
                <kbd>R</kbd>
                <span>Réinitialiser</span>
              </li>
            </ul>
          </section>

          <section className="drawer-section" aria-labelledby="settings-privacy">
            <h3 id="settings-privacy" className="drawer-section-title">
              Confidentialité
            </h3>
            <p className="drawer-privacy">
              takku — app de productivité pour les muslims. Le temps est une
              bénédiction : passe-le avec intention. Calme, privé, sur ton
              appareil. Rien ne quitte ton appareil.
            </p>
          </section>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
