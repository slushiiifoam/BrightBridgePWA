import { Link } from 'react-router-dom'

// Preserve the original bridge-and-sun artwork as a scalable inline logo.
export function BrandLogo() {
  return (
    <svg
      className="app-logo"
      width="200"
      height="200"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="BrightBridge sun and bridge logo"
    >
      <rect width="200" height="200" rx="40" fill="#F5F5DC" />
      <circle cx="100" cy="80" r="35" fill="#FFA500" opacity="0.9" />
      <circle cx="100" cy="80" r="30" fill="#FF6B35" />
      <line x1="100" y1="45" x2="100" y2="30" stroke="#FFA500" strokeWidth="3" />
      <line x1="120" y1="50" x2="130" y2="40" stroke="#FFA500" strokeWidth="3" />
      <line x1="80" y1="50" x2="70" y2="40" stroke="#FFA500" strokeWidth="3" />
      <rect x="30" y="100" width="140" height="8" fill="#2C2C2C" />
      <rect x="40" y="90" width="6" height="20" fill="#2C2C2C" />
      <rect x="95" y="85" width="10" height="25" fill="#2C2C2C" />
      <rect x="155" y="90" width="6" height="20" fill="#2C2C2C" />
      <line x1="45" y1="90" x2="100" y2="85" stroke="#2C2C2C" strokeWidth="2" />
      <line x1="100" y1="85" x2="158" y2="90" stroke="#2C2C2C" strokeWidth="2" />
      <ellipse cx="100" cy="130" rx="60" ry="15" fill="#E85D8A" opacity="0.6" />
    </svg>
  )
}

// Safety controls remain fixed and reachable across the same pages as the legacy app.
export function QuickExit() {
  return (
    <a href="https://www.weather.com" className="quick-exit" aria-label="Quick exit to weather website">
      quick exit
    </a>
  )
}

export function HelpFab() {
  return (
    <Link to="/help" className="help-fab pulse" aria-label="Get help now">
      HELP
    </Link>
  )
}

// Shared page header supports a safe explicit back route and one optional action.
export function PageHeader({
  title,
  backTo,
  backLabel = 'Back',
  actionLabel,
  actionDisabled = false,
  onAction,
}) {
  return (
    <header className="page-header gradient-header">
      <div className="container page-header__inner">
        {backTo ? (
          <Link to={backTo} className="header-control header-control--left">
            ← {backLabel}
          </Link>
        ) : null}
        <h1>{title}</h1>
        {actionLabel ? (
          <button
            type="button"
            className="header-control header-control--right"
            onClick={onAction}
            disabled={actionDisabled}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </header>
  )
}

const moods = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'sad', emoji: '☹️', label: 'Sad' },
]

// A controlled selector avoids implicit browser event globals and works on Safari.
export function MoodSelector({ value, onChange, disabled = false, compact = false }) {
  return (
    <div className={`mood-selector${compact ? ' mood-selector--compact' : ''}`} role="group" aria-label="Select your mood">
      {moods.map((mood) => (
        <button
          key={mood.value}
          type="button"
          className={`mood-btn ${mood.value}${value === mood.value ? ' active' : ''}`}
          onClick={() => onChange(mood.value)}
          aria-label={`${mood.label} mood`}
          aria-pressed={value === mood.value}
          disabled={disabled}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  )
}

// StatusMessage gives async success and failure text a consistent accessible treatment.
export function StatusMessage({ children, tone = 'info' }) {
  if (!children) return null
  return (
    <p className={`status-message status-message--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}
