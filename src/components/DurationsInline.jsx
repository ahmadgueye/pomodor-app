function MinusIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        d="M6 12h12"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        d="M12 6v12M6 12h12"
      />
    </svg>
  )
}

function DurationControl({
  id,
  label,
  value,
  isPlaying,
  onDecrement,
  onIncrement,
}) {
  return (
    <div className="duration-control">
      <span id={`${id}-label`} className="duration-label">
        {label}
      </span>
      <div className="duration-controls setting_box">
        <button
          type="button"
          className="duration-btn"
          id={`${id}-decrement`}
          disabled={isPlaying}
          aria-label={`Diminuer ${label.toLowerCase()} d’une minute`}
          onClick={onDecrement}
        >
          <MinusIcon />
        </button>
        <span className="duration-value set_txt" id={`${id}-length`}>
          {value}
          <span className="duration-unit">min</span>
        </span>
        <button
          type="button"
          className="duration-btn"
          id={`${id}-increment`}
          disabled={isPlaying}
          aria-label={`Augmenter ${label.toLowerCase()} d’une minute`}
          onClick={onIncrement}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  )
}

export default function DurationsInline({
  isPlaying,
  sessionLength,
  breakLength,
  longBreakLength,
  setSessionLength,
  setBreakLength,
  setLongBreakLength,
}) {
  return (
    <div
      id="settings"
      className="durations-inline"
      role="group"
      aria-label="Durées"
    >
      <DurationControl
        id="session"
        label="Session"
        value={sessionLength}
        isPlaying={isPlaying}
        onDecrement={() => {
          if (sessionLength > 1) setSessionLength(sessionLength - 1)
        }}
        onIncrement={() => {
          if (sessionLength < 60) setSessionLength(sessionLength + 1)
        }}
      />
      <span className="duration-sep" aria-hidden="true" />
      <DurationControl
        id="break"
        label="Break"
        value={breakLength}
        isPlaying={isPlaying}
        onDecrement={() => {
          if (breakLength > 1) setBreakLength(breakLength - 1)
        }}
        onIncrement={() => {
          if (breakLength < 60) setBreakLength(breakLength + 1)
        }}
      />
      <span className="duration-sep" aria-hidden="true" />
      <DurationControl
        id="long-break"
        label="Long"
        value={longBreakLength}
        isPlaying={isPlaying}
        onDecrement={() => {
          if (longBreakLength > 1) setLongBreakLength(longBreakLength - 1)
        }}
        onIncrement={() => {
          if (longBreakLength < 60) setLongBreakLength(longBreakLength + 1)
        }}
      />
    </div>
  )
}
