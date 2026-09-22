import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { QuickExit, StatusMessage } from '../components/SharedUI.jsx'
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

// LoginPage routes authenticated users only after the SDK has resolved its real session.
export default function LoginPage() {
  usePageTitle('Login')
  const {
    callbackResult,
    clearAuthError,
    completePasswordSetup,
    error: authError,
    loginWithEmail,
    loginWithGoogle,
    requestPasswordRecovery,
    signUpWithEmail,
    status,
    user,
  } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [loginError, setLoginError] = useState('')
  const [notice, setNotice] = useState('')
  const [routing, setRouting] = useState(false)
  const [emailBusy, setEmailBusy] = useState(false)
  const [emailMode, setEmailMode] = useState('login')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [callbackHandled, setCallbackHandled] = useState(false)

  const needsPasswordSetup = !callbackHandled
    && (callbackResult?.type === 'recovery' || callbackResult?.type === 'invite')

  useEffect(() => {
    if (
      status !== 'authenticated'
      || !user
      || needsPasswordSetup
    ) return undefined

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
  }, [location, navigate, needsPasswordSetup, status, user])

  // Start OAuth and keep any synchronous setup error on the login card.
  function handleGoogleLogin() {
    setLoginError('')
    setNotice('')
    setRouting(true)
    try {
      loginWithGoogle()
    } catch (error) {
      setRouting(false)
      setLoginError(error instanceof Error ? error.message : 'Google login could not start.')
    }
  }

  // Switch between login, signup, and recovery without carrying stale passwords or errors.
  function changeEmailMode(nextMode) {
    clearAuthError()
    setLoginError('')
    setNotice('')
    setPassword('')
    setConfirmPassword('')
    setEmailMode(nextMode)
  }

  // Submit the selected email/password flow through the same centralized auth provider.
  async function handleEmailSubmit(event) {
    event.preventDefault()
    setLoginError('')
    setNotice('')
    setEmailBusy(true)

    try {
      if (emailMode === 'recovery') {
        await requestPasswordRecovery(email.trim())
        setNotice('If that email belongs to an account, Netlify will send password-reset instructions.')
        setEmailMode('login')
        return
      }

      if (emailMode === 'signup') {
        const result = await signUpWithEmail(email.trim(), password, displayName)
        if (!result.signedIn) {
          setNotice('Account created. Check your email for the confirmation link before signing in.')
          setPassword('')
          setEmailMode('login')
        }
        return
      }

      await loginWithEmail(email.trim(), password)
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Email authentication failed.')
    } finally {
      setEmailBusy(false)
    }
  }

  // Recovery and invite links both finish by choosing and confirming a password.
  async function handlePasswordSetup(event) {
    event.preventDefault()
    setLoginError('')
    setNotice('')

    if (password !== confirmPassword) {
      setLoginError('The passwords do not match.')
      return
    }

    setEmailBusy(true)
    try {
      await completePasswordSetup({
        inviteToken: callbackResult?.type === 'invite' ? callbackResult.token : undefined,
        password,
      })
      setCallbackHandled(true)
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'The password could not be saved.')
    } finally {
      setEmailBusy(false)
    }
  }

  const busy = status === 'loading' || routing || emailBusy
  const emailButtonLabel = emailMode === 'signup'
    ? 'Create Account'
    : emailMode === 'recovery'
      ? 'Send Reset Email'
      : 'Sign In with Email'

  return (
    <div className="login-page gradient-bg page-shell">
      <main className="container center-content login-main">
        <section className="login-card fade-in" aria-labelledby="login-heading">
          <h1 id="login-heading" className="text-white">Welcome to BrightBridge!</h1>

          {needsPasswordSetup ? (
            <form className="email-auth-form" onSubmit={handlePasswordSetup}>
              <h2 className="email-auth-heading">
                {callbackResult.type === 'invite' ? 'Finish Account Setup' : 'Choose a New Password'}
              </h2>
              <label htmlFor="new-password" className="form-label text-white">New password</label>
              <input
                id="new-password"
                className="form-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength="6"
                required
                disabled={busy}
              />
              <label htmlFor="confirm-password" className="form-label text-white">Confirm password</label>
              <input
                id="confirm-password"
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength="6"
                required
                disabled={busy}
              />
              <button type="submit" className="btn btn-light btn-large full-width" disabled={busy}>
                {emailBusy ? 'Saving…' : 'Save Password'}
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-light btn-large login-button"
                onClick={handleGoogleLogin}
                disabled={busy}
              >
                {status === 'loading' || routing ? 'Checking your session…' : 'Continue with Google'}
              </button>

              <div className="login-divider"><span>or use email</span></div>

              {emailMode !== 'recovery' ? (
                <div className="auth-mode-tabs" role="tablist" aria-label="Email account options">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={emailMode === 'login'}
                    className={emailMode === 'login' ? 'active' : ''}
                    onClick={() => changeEmailMode('login')}
                    disabled={busy}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={emailMode === 'signup'}
                    className={emailMode === 'signup' ? 'active' : ''}
                    onClick={() => changeEmailMode('signup')}
                    disabled={busy}
                  >
                    Create Account
                  </button>
                </div>
              ) : null}

              <form className="email-auth-form" onSubmit={handleEmailSubmit}>
                {emailMode === 'signup' ? (
                  <>
                    <label htmlFor="display-name" className="form-label text-white">Name</label>
                    <input
                      id="display-name"
                      className="form-input"
                      type="text"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      autoComplete="name"
                      disabled={busy}
                    />
                  </>
                ) : null}

                <label htmlFor="email" className="form-label text-white">Email</label>
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  disabled={busy}
                />

                {emailMode !== 'recovery' ? (
                  <>
                    <label htmlFor="password" className="form-label text-white">Password</label>
                    <input
                      id="password"
                      className="form-input"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'}
                      minLength="6"
                      required
                      disabled={busy}
                    />
                  </>
                ) : null}

                <button type="submit" className="btn btn-primary btn-large full-width" disabled={busy}>
                  {emailBusy ? 'Please wait…' : emailButtonLabel}
                </button>
              </form>

              {emailMode === 'login' ? (
                <button type="button" className="login-link-button" onClick={() => changeEmailMode('recovery')} disabled={busy}>
                  Forgot your password?
                </button>
              ) : null}
              {emailMode === 'recovery' ? (
                <button type="button" className="login-link-button" onClick={() => changeEmailMode('login')} disabled={busy}>
                  Back to sign in
                </button>
              ) : null}
            </>
          )}

          <StatusMessage tone="error">{loginError || authError}</StatusMessage>
          <StatusMessage tone="success">{notice}</StatusMessage>
          {!needsPasswordSetup ? (
            <p className="login-note text-white">
              BrightBridge sign-out does not sign you out of Google, so Google may reuse its active account next time.
            </p>
          ) : null}
          <Link to="/" className="text-link text-white">Back to welcome</Link>
        </section>
      </main>
      <QuickExit />
    </div>
  )
}
