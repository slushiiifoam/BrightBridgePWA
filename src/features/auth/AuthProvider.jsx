import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  acceptIdentityInvite,
  getDisplayName,
  loadCurrentUser,
  loginWithEmail,
  loginWithGoogle,
  processAuthCallback,
  sendPasswordRecovery,
  signOut,
  signUpWithEmail,
  subscribeToAuthChanges,
  updatePassword,
} from './authClient.js'
import { AuthContext } from './authContext.js'

// Turn unknown SDK/network failures into a short message the UI can safely show.
function readableError(error) {
  return error instanceof Error ? error.message : 'Authentication is unavailable right now.'
}

// AuthProvider is the single source of truth for the Netlify Identity session.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [callbackResult, setCallbackResult] = useState(null)

  useEffect(() => {
    let active = true

    const unsubscribe = subscribeToAuthChanges((_event, nextUser) => {
      if (!active) return
      setUser(nextUser)
      setStatus(nextUser ? 'authenticated' : 'anonymous')
      setError('')
    })

    async function restoreSession() {
      try {
        const result = await processAuthCallback()
        if (!active) return
        setCallbackResult(result)

        const nextUser = result?.user || (await loadCurrentUser())
        if (!active) return
        setUser(nextUser)
        setStatus(nextUser ? 'authenticated' : 'anonymous')
      } catch (authError) {
        if (!active) return
        const nextUser = await loadCurrentUser()
        if (!active) return
        setUser(nextUser)
        setStatus(nextUser ? 'authenticated' : 'anonymous')
        setError(readableError(authError))
      }
    }

    restoreSession()

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const beginGoogleLogin = useCallback(() => {
    setError('')
    loginWithGoogle()
  }, [])

  const clearAuthError = useCallback(() => setError(''), [])

  // Email login returns only after Netlify has created a real SDK-managed session.
  const beginEmailLogin = useCallback(async (email, password) => {
    setError('')
    try {
      const nextUser = await loginWithEmail(email, password)
      setUser(nextUser)
      setStatus('authenticated')
      return nextUser
    } catch (loginError) {
      const message = readableError(loginError)
      setError(message)
      throw new Error(message, { cause: loginError })
    }
  }, [])

  // Signup may require email confirmation, so report whether a session exists yet.
  const beginEmailSignup = useCallback(async (email, password, displayName) => {
    setError('')
    try {
      const createdUser = await signUpWithEmail(email, password, displayName)
      const currentUser = await loadCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setStatus('authenticated')
      }
      return { createdUser, signedIn: Boolean(currentUser) }
    } catch (signupError) {
      const message = readableError(signupError)
      setError(message)
      throw new Error(message, { cause: signupError })
    }
  }, [])

  // Recovery requests intentionally return one generic success state to the page.
  const beginPasswordRecovery = useCallback(async (email) => {
    setError('')
    try {
      await sendPasswordRecovery(email)
    } catch (recoveryError) {
      const message = readableError(recoveryError)
      setError(message)
      throw new Error(message, { cause: recoveryError })
    }
  }, [])

  // Complete recovery or invite callbacks and promote the result to active session state.
  const finishPasswordSetup = useCallback(async ({ inviteToken, password }) => {
    setError('')
    try {
      const nextUser = inviteToken
        ? await acceptIdentityInvite(inviteToken, password)
        : await updatePassword(password)
      setUser(nextUser)
      setStatus('authenticated')
      return nextUser
    } catch (passwordError) {
      const message = readableError(passwordError)
      setError(message)
      throw new Error(message, { cause: passwordError })
    }
  }, [])

  const endSession = useCallback(async () => {
    setError('')
    try {
      await signOut()
      setUser(null)
      setStatus('anonymous')
    } catch (logoutError) {
      const currentUser = await loadCurrentUser()
      setUser(currentUser)
      setStatus(currentUser ? 'authenticated' : 'anonymous')
      const message = readableError(logoutError)
      setError(message)
      throw new Error(message, { cause: logoutError })
    }
  }, [])

  const value = useMemo(
    () => ({
      callbackResult,
      clearAuthError,
      completePasswordSetup: finishPasswordSetup,
      displayName: getDisplayName(user),
      error,
      loginWithEmail: beginEmailLogin,
      loginWithGoogle: beginGoogleLogin,
      logout: endSession,
      requestPasswordRecovery: beginPasswordRecovery,
      signUpWithEmail: beginEmailSignup,
      status,
      user,
    }),
    [
      beginEmailLogin,
      beginEmailSignup,
      beginGoogleLogin,
      beginPasswordRecovery,
      callbackResult,
      clearAuthError,
      endSession,
      error,
      finishPasswordSetup,
      status,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
