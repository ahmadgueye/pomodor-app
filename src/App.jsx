import './App.css'
import { useEffect, useRef, useState } from 'react'
import beep from './assets/beep.mp3'
import QuoteRotator from './components/QuoteRotator'
import TodoList from './components/TodoList'
import DurationsInline from './components/DurationsInline'
import SettingsDrawer from './components/SettingsDrawer'
import { loadPanels, savePanels } from './lib/panels'
import { loadSettings, saveSettings } from './lib/settings'
import {
  CYCLE_SIZE,
  formatFocusTotal,
  isLongBreakCycle,
  loadStats,
  nextCycleFilled,
  saveStats,
} from './lib/stats'
import { loadTodos, saveTodos } from './lib/todos'

const DEFAULT_TITLE = 'takku — Pomodoro'

function formatTime(time) {
  const minutes = Math.floor(time / 60).toString().padStart(2, '0')
  const seconds = (time % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

function modeTitle(isBreak, isLong) {
  if (!isBreak) return 'Focus'
  return isLong ? 'Long break' : 'Break'
}

function App() {
  const [breakLength, setBreakLength] = useState(
    () => loadSettings().breakLength,
  )
  const [longBreakLength, setLongBreakLength] = useState(
    () => loadSettings().longBreakLength,
  )
  const [sessionLength, setSessionLength] = useState(
    () => loadSettings().sessionLength,
  )
  const [soundEnabled, setSoundEnabled] = useState(
    () => loadSettings().soundEnabled,
  )
  const [autoStartNext, setAutoStartNext] = useState(
    () => loadSettings().autoStartNext,
  )
  const [timeleft, setTimeleft] = useState(
    () => loadSettings().sessionLength * 60,
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBreakTime, setIsBreakTime] = useState(false)
  const [isLongBreak, setIsLongBreak] = useState(false)
  const [stats, setStats] = useState(() => loadStats())
  const [todos, setTodos] = useState(() => loadTodos())
  const [panels, setPanels] = useState(() => loadPanels())
  const [settingsOpen, setSettingsOpen] = useState(false)
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
  const isLongBreakRef = useRef(false)
  const audioRef = useRef(null)
  const isPlayingRef = useRef(false)
  const timeleftRef = useRef(timeleft)
  const sessionLengthRef = useRef(sessionLength)
  const breakLengthRef = useRef(breakLength)
  const longBreakLengthRef = useRef(longBreakLength)
  const cycleFilledRef = useRef(stats.cycleFilled)
  const phaseSecondsRef = useRef(sessionLength * 60)
  const soundEnabledRef = useRef(soundEnabled)
  const autoStartNextRef = useRef(autoStartNext)

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
    longBreakLengthRef.current = longBreakLength
  }, [longBreakLength])

  useEffect(() => {
    cycleFilledRef.current = stats.cycleFilled
  }, [stats.cycleFilled])

  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  useEffect(() => {
    autoStartNextRef.current = autoStartNext
  }, [autoStartNext])

  useEffect(() => {
    saveSettings({
      sessionLength,
      breakLength,
      longBreakLength,
      soundEnabled,
      autoStartNext,
    })
  }, [
    sessionLength,
    breakLength,
    longBreakLength,
    soundEnabled,
    autoStartNext,
  ])

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  useEffect(() => {
    savePanels(panels)
  }, [panels])

  useEffect(() => {
    if (!isPlayingRef.current) {
      const next = sessionLength * 60
      timeleftRef.current = next
      phaseSecondsRef.current = next
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
      const mode = modeTitle(isBreakTime, isLongBreak)
      document.title = `${formatTime(timeleft)} · ${mode} · takku`
    } else {
      document.title = DEFAULT_TITLE
    }
  }, [timeleft, isPlaying, isBreakTime, isLongBreak])

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

  const startPhase = (seconds, { continuePlaying } = { continuePlaying: true }) => {
    phaseSecondsRef.current = seconds
    timeleftRef.current = seconds
    setTimeleft(seconds)

    if (continuePlaying) {
      deadlineRef.current = Date.now() + seconds * 1000
      return
    }

    deadlineRef.current = null
    isPlayingRef.current = false
    setIsPlaying(false)
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  const recordFocusComplete = (focusSeconds, cycleFilled) => {
    setStats((prev) => {
      const next = {
        completedFocus: prev.completedFocus + 1,
        totalFocusSeconds: prev.totalFocusSeconds + focusSeconds,
        cycleFilled,
      }
      saveStats(next)
      return next
    })
  }

  const clearCycleProgress = () => {
    cycleFilledRef.current = 0
    setStats((prev) => {
      if (prev.cycleFilled === 0) return prev
      const next = { ...prev, cycleFilled: 0 }
      saveStats(next)
      return next
    })
  }

  const playEndSound = () => {
    if (!soundEnabledRef.current || !audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {
      /* autoplay / interaction restrictions */
    })
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

    playEndSound()
    const continuePlaying = autoStartNextRef.current

    if (!breakRef.current) {
      const cycleFilled = nextCycleFilled(cycleFilledRef.current)
      const longBreak = isLongBreakCycle(cycleFilled)
      cycleFilledRef.current = cycleFilled
      isLongBreakRef.current = longBreak
      recordFocusComplete(phaseSecondsRef.current, cycleFilled)
      breakRef.current = true
      setIsBreakTime(true)
      setIsLongBreak(longBreak)
      const minutes = longBreak
        ? longBreakLengthRef.current
        : breakLengthRef.current
      startPhase(minutes * 60, { continuePlaying })
      return
    }

    const wasLongBreak = isLongBreakRef.current
    breakRef.current = false
    isLongBreakRef.current = false
    setIsBreakTime(false)
    setIsLongBreak(false)
    if (wasLongBreak) clearCycleProgress()
    startPhase(sessionLengthRef.current * 60, { continuePlaying })
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

  const togglePanel = (key) => {
    setPanels((prev) => ({ ...prev, [key]: !prev[key] }))
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
    isLongBreakRef.current = false
    const sessionSeconds = sessionLengthRef.current * 60
    setTimeleft(sessionSeconds)
    timeleftRef.current = sessionSeconds
    phaseSecondsRef.current = sessionSeconds
    setIsPlaying(false)
    setIsBreakTime(false)
    setIsLongBreak(false)
    breakRef.current = false
    document.title = DEFAULT_TITLE
    clearCycleProgress()
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.pause()
    }
  }

  const modeLabel = modeTitle(isBreakTime, isLongBreak)
  const sessionLabel =
    stats.completedFocus === 1
      ? '1 session'
      : `${stats.completedFocus} sessions`

  return (
    <div className="app-shell" id="app">
      <header className="app-header">
        <h1 className="brand">takku</h1>
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSettingsOpen(true)}
            aria-label="Ouvrir les réglages"
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065Z"
              />
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </button>
        </div>
      </header>

      <audio src={beep} controls={false} id="beep" ref={audioRef} />

      <section className="hero">
        {panels.showQuotes ? <QuoteRotator /> : null}

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
          <DurationsInline
            isPlaying={isPlaying}
            sessionLength={sessionLength}
            breakLength={breakLength}
            longBreakLength={longBreakLength}
            setSessionLength={setSessionLength}
            setBreakLength={setBreakLength}
            setLongBreakLength={setLongBreakLength}
          />
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

        {panels.showStats ? (
          <div className="session-progress">
            <div
              id="sessions"
              className="session-dots"
              role="img"
              aria-label={`Cycle : ${stats.cycleFilled} sur ${CYCLE_SIZE}`}
            >
              {Array.from({ length: CYCLE_SIZE }, (_, i) => (
                <span
                  key={i}
                  className={`session-dot${i < stats.cycleFilled ? ' is-filled' : ''}`}
                />
              ))}
            </div>

            <p className="flow-stats">
              {sessionLabel}
              <span className="flow-stats-sep" aria-hidden="true">
                ·
              </span>
              {formatFocusTotal(stats.totalFocusSeconds)} de focus
            </p>
          </div>
        ) : null}
      </section>

      {panels.showTodos ? (
        <TodoList todos={todos} onChange={setTodos} />
      ) : null}

      <footer className="app-footer">
        <p>
          Made for you 🚀 · © {new Date().getFullYear()}{' '}
          <a
            href="https://akhmad.ninja"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ahmad Gueye
          </a>
        </p>
      </footer>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        panels={panels}
        onTogglePanel={togglePanel}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        autoStartNext={autoStartNext}
        onToggleAutoStart={() => setAutoStartNext((prev) => !prev)}
      />
    </div>
  )
}

export default App
