import './App.css'
import { useEffect, useRef, useState } from 'react'
import beep from './assets/beep.mp3'
import QuoteRotator from './components/QuoteRotator'

const DEFAULT_TITLE = 'takku — Pomodoro'

function formatTime(time) {
  const minutes = Math.floor(time / 60).toString().padStart(2, '0')
  const seconds = (time % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

function App() {
  const [breakLength, setBreakLength] = useState(5)
  const [sessionLength, setSessionLength] = useState(25)
  const [timeleft, setTimeleft] = useState(25 * 60)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBreakTime, setIsBreakTime] = useState(false)
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('theme')
      return stored === 'light' || stored === 'dark' ? stored : 'dark'
    } catch {
      return 'dark'
    }
  })

  const intervalRef = useRef(null)
  const deadlineRef = useRef(null)
  const breakRef = useRef(false)
  const audioRef = useRef(null)
  const isPlayingRef = useRef(false)
  const timeleftRef = useRef(timeleft)
  const sessionLengthRef = useRef(sessionLength)
  const breakLengthRef = useRef(breakLength)

  useEffect(() => {
    timeleftRef.current = timeleft
  }, [timeleft])

  useEffect(() => {
    sessionLengthRef.current = sessionLength
  }, [sessionLength])

  useEffect(() => {
    breakLengthRef.current = breakLength
  }, [breakLength])

  useEffect(() => {
    if (!isPlayingRef.current) {
      const next = sessionLength * 60
      timeleftRef.current = next
      setTimeleft(next)
    }
  }, [sessionLength])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    if (isPlaying) {
      const mode = isBreakTime ? 'Break' : 'Focus'
      document.title = `${formatTime(timeleft)} · ${mode} · takku`
    } else {
      document.title = DEFAULT_TITLE
    }
  }, [timeleft, isPlaying, isBreakTime])

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current)
      document.title = DEFAULT_TITLE
    }
  }, [])

  const remainingFromDeadline = () => {
    if (!deadlineRef.current) return timeleftRef.current
    return Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
  }

  const startPhase = (seconds) => {
    deadlineRef.current = Date.now() + seconds * 1000
    timeleftRef.current = seconds
    setTimeleft(seconds)
  }

  const tick = () => {
    if (!deadlineRef.current || !isPlayingRef.current) return

    const remaining = remainingFromDeadline()

    if (remaining > 0) {
      if (remaining !== timeleftRef.current) {
        timeleftRef.current = remaining
        setTimeleft(remaining)
      }
      return
    }

    audioRef.current?.play()

    if (!breakRef.current) {
      breakRef.current = true
      setIsBreakTime(true)
      startPhase(breakLengthRef.current * 60)
      return
    }

    breakRef.current = false
    setIsBreakTime(false)
    startPhase(sessionLengthRef.current * 60)
  }

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && isPlayingRef.current) {
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const playTimer = () => {
    if (!isPlaying) {
      isPlayingRef.current = true
      setIsPlaying(true)
      deadlineRef.current = Date.now() + timeleftRef.current * 1000
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(tick, 250)
      tick()
    } else {
      const remaining = remainingFromDeadline()
      timeleftRef.current = remaining
      setTimeleft(remaining)
      deadlineRef.current = null
      isPlayingRef.current = false
      setIsPlaying(false)
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const resetTimer = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    deadlineRef.current = null
    isPlayingRef.current = false
    setSessionLength(25)
    setBreakLength(5)
    setTimeleft(25 * 60)
    timeleftRef.current = 25 * 60
    setIsPlaying(false)
    setIsBreakTime(false)
    breakRef.current = false
    document.title = DEFAULT_TITLE
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.pause()
    }
  }

  const modeLabel = isBreakTime ? 'Break' : 'Focus'

  return (
    <div className="app-shell" id="app">
      <header className="app-header">
        <h1 className="brand">takku</h1>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {theme === 'dark' ? (
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
              />
            </svg>
          ) : (
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 14.35A7.5 7.5 0 0 1 9.65 3 9 9 0 1 0 21 14.35Z"
              />
            </svg>
          )}
        </button>
      </header>

      <audio src={beep} controls={false} id="beep" ref={audioRef} />

      <section className="hero">
        <QuoteRotator />

        <div className="timer-card" id="timer">
          <h2
            id="timer-label"
            className={`timer-status${isPlaying ? ' is-active' : ''}`}
          >
            <span className="status-dot" aria-hidden="true" />
            {modeLabel}
          </h2>
          <p id="time-left" className="time-left" aria-live="polite">
            {formatTime(timeleft)}
          </p>
        </div>

        <div className="cta-group">
          <button
            type="button"
            className="btn-primary"
            id="start_stop"
            onClick={playTimer}
            aria-label={isPlaying ? 'Mettre en pause' : 'Démarrer'}
          >
            {isPlaying ? (
              <>
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 6H8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm7 0h-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z"
                  />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 18V6l8 6-8 6Z"
                  />
                </svg>
                Start
              </>
            )}
          </button>
          <button
            type="button"
            className="btn-outline"
            id="reset"
            onClick={resetTimer}
            aria-label="Réinitialiser"
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
              />
            </svg>
          </button>
        </div>
      </section>

      <section className="settings" aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="settings-title">
          Durées
        </h2>
        <div className="settings-panel setting">
          <div className="setting-block">
            <h3 id="break-label" className="setting-label">
              Break
            </h3>
            <div className="setting-controls setting_box">
              <button
                type="button"
                className="icon-btn"
                id="break-decrement"
                disabled={isPlaying}
                aria-label="Diminuer la pause"
                onClick={() => {
                  if (breakLength > 1) setBreakLength(breakLength - 1)
                }}
              >
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7.119 8h9.762a1 1 0 0 1 .772 1.636l-4.881 5.927a1 1 0 0 1-1.544 0l-4.88-5.927A1 1 0 0 1 7.118 8Z"
                  />
                </svg>
              </button>
              <span className="setting-value-wrap">
                <span className="setting-value set_txt" id="break-length">
                  {breakLength}
                </span>
                <span className="setting-unit">min</span>
              </span>
              <button
                type="button"
                className="icon-btn"
                id="break-increment"
                disabled={isPlaying}
                aria-label="Augmenter la pause"
                onClick={() => {
                  if (breakLength < 60) setBreakLength(breakLength + 1)
                }}
              >
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16.881 16H7.119a1 1 0 0 1-.772-1.636l4.881-5.927a1 1 0 0 1 1.544 0l4.88 5.927a1 1 0 0 1-.77 1.636Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="setting-block">
            <h3 id="session-label" className="setting-label">
              Session
            </h3>
            <div className="setting-controls setting_box">
              <button
                type="button"
                className="icon-btn"
                id="session-decrement"
                disabled={isPlaying}
                aria-label="Diminuer la session"
                onClick={() => {
                  if (sessionLength > 1) setSessionLength(sessionLength - 1)
                }}
              >
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7.119 8h9.762a1 1 0 0 1 .772 1.636l-4.881 5.927a1 1 0 0 1-1.544 0l-4.88-5.927A1 1 0 0 1 7.118 8Z"
                  />
                </svg>
              </button>
              <span className="setting-value-wrap">
                <span className="setting-value set_txt" id="session-length">
                  {sessionLength}
                </span>
                <span className="setting-unit">min</span>
              </span>
              <button
                type="button"
                className="icon-btn"
                id="session-increment"
                disabled={isPlaying}
                aria-label="Augmenter la session"
                onClick={() => {
                  if (sessionLength < 60) setSessionLength(sessionLength + 1)
                }}
              >
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16.881 16H7.119a1 1 0 0 1-.772-1.636l4.881-5.927a1 1 0 0 1 1.544 0l4.88 5.927a1 1 0 0 1-.77 1.636Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div id="sessions" className="session-dots" aria-hidden="true">
          <span className="session-dot session" />
          <span className="session-dot session" />
          <span className="session-dot session" />
          <span className="session-dot session" />
          <span className="session-dot session" />
        </div>
      </section>
    </div>
  )
}

export default App
