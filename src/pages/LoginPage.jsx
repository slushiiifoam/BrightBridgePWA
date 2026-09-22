import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { QuickExit, StatusMessage } from '../components/layout/SharedUI.jsx'
import { useAuth } from '../features/auth/authContext.js'
import {
  hasCompletedOnboarding,
  markOnboardingComplete,
} from '../features/auth/authClient.js'
import { getRecentEntries } from '../features/journal/journalApi.js'
import usePageTitle from '../lib/usePageTitle.js'

// Reuse only an internal route captured by ProtectedRoute after login.
function safeRequestedPath(location) {
  const requested = location.state?.from
  return requested?.pathname?.startsWith('/')
    ? `${requested.pathname}${requested.search || ''}`
    : '/home'
}

// The Netlify widget owns login, signup, recovery, invites, and Google provider UI.
export default function LoginPage() {
  usePageTitle('Login')
  const { error: authError, openLogin, status, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [routing, setRouting] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated' || !user) return undefined

    let active = true
    async function chooseDestination() {
      setRouting(true)
      let onboarded = hasCompletedOnboarding(user)

      if (!onboarded) {
        try {
          const entries = await getRecentEntries(1)
          onboarded = entries.length > 0
          if (onboarded) await markOnboardingComplete(user)
        } catch {
          // A missing journal configuration should not create an auth redirect loop.
          onboarded = false
        }
      }

      if (!active) return
      navigate(onboarded ? safeRequestedPath(location) : '/journal/today', { replace: true })
    }

    chooseDestination()
    return () => {
      active = false
    }
  }, [location, navigate, status, user])

  const busy = status === 'loading' || routing

  return (
    <div className="login-page gradient-bg page-shell">
      <main className="container center-content login-main">
        <section className="login-card fade-in" aria-labelledby="login-heading">
          <h1 id="login-heading" className="text-white">Welcome to BrightBridge!</h1>

          <button
            type="button"
            className="btn btn-light btn-large login-button"
            onClick={openLogin}
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
