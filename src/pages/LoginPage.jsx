import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { QuickExit, StatusMessage } from '../components/layout/SharedUI.jsx'
import { useAuth } from '../features/auth/authContext.js'
import { hasCompletedOnboarding } from '../features/auth/authClient.js'
import usePageTitle from '../lib/usePageTitle.js'

const RETURN_TO_KEY = 'brightbridge.auth.returnTo'

function requestedPathFromLocation(location) {
  const requested = location.state?.from
  return requested?.pathname?.startsWith('/') && !requested.pathname.startsWith('//')
    ? `${requested.pathname}${requested.search || ''}`
    : ''
}

// Preserve a validated deep link across Google's full-page OAuth round trip.
function rememberRequestedPath(location) {
  const requested = requestedPathFromLocation(location)
  if (!requested) return
  try {
    sessionStorage.setItem(RETURN_TO_KEY, requested)
  } catch {
    // In-memory router state still works when storage is unavailable.
  }
}

function consumeRequestedPath(location) {
  const inMemoryPath = requestedPathFromLocation(location)
  let storedPath = ''

  try {
    storedPath = sessionStorage.getItem(RETURN_TO_KEY) || ''
    sessionStorage.removeItem(RETURN_TO_KEY)
  } catch {
    // Fall back to the dashboard when storage is unavailable.
  }

  const safeStoredPath = storedPath.startsWith('/') && !storedPath.startsWith('//')
    ? storedPath
    : ''
  return inMemoryPath || safeStoredPath || '/home'
}

// The Netlify widget owns login, signup, recovery, invites, and Google provider UI.
export default function LoginPage() {
  usePageTitle('Login')
  const { error: authError, openLogin, status, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const requestedPathRef = useRef('')
  const [routing, setRouting] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated' || !user) return undefined

    let active = true
    function chooseDestination() {
      setRouting(true)
      if (!active) return
      const requestedPath = requestedPathRef.current || consumeRequestedPath(location)
      requestedPathRef.current = requestedPath
      const destination = hasCompletedOnboarding(user)
        ? requestedPath
        : '/journal/today'
      navigate(destination, { replace: true })
    }

    chooseDestination()
    return () => {
      active = false
    }
  }, [location, navigate, status, user])

  const busy = status === 'loading' || routing

  function handleOpenLogin() {
    rememberRequestedPath(location)
    openLogin()
  }

  return (
    <div className="login-page gradient-bg page-shell">
      <main className="container center-content login-main">
        <section className="login-card fade-in" aria-labelledby="login-heading">
          <h1 id="login-heading" className="text-white">Welcome to BrightBridge!</h1>

          <button
            type="button"
            className="btn btn-light btn-large login-button"
            onClick={handleOpenLogin}
            disabled={busy}
          >
            {busy ? 'Checking your session…' : 'Log In / Sign Up'}
          </button>

          <p className="login-note text-white">
            Use email and password or choose Continue with Google in the secure Netlify window.
          </p>
          <StatusMessage tone="error">{authError}</StatusMessage>
          <p className="login-note text-white">
            Signing out of BrightBridge does not sign you out of Google, so Google may reuse its active account.
          </p>
          <Link to="/" className="text-link text-white">Back to welcome</Link>
        </section>
      </main>
      <QuickExit />
    </div>
  )
}
