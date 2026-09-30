import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  consumeIdentityCallback,
  getDisplayName,
  isIdentityReady,
  loadCurrentUser,
  openLoginWidget,
  signOut,
  subscribeToAuthChanges,
} from './authClient.js'
import { AuthContext } from './authContext.js'

// Turn unknown widget/network failures into a short message the UI can safely show.
function readableError(error) {
  return error instanceof Error ? error.message : 'Authentication is unavailable right now.'
}

// AuthProvider is the single React owner of the Netlify Identity widget session.
export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    function applyUser(nextUser) {
      if (!active) return
      setUser(nextUser)
      setStatus(nextUser ? 'authenticated' : 'anonymous')
      setError('')

      // Identity callbacks usually return to the site root; finish routing from /login.
      if (nextUser && consumeIdentityCallback()) {
        navigate('/login', { replace: true })
      }
    }

    const unsubscribe = subscribeToAuthChanges((event, payload) => {
      if (!active) return
      if (event === 'error') {
        setError(readableError(payload))
        if (isIdentityReady()) setStatus(loadCurrentUser() ? 'authenticated' : 'anonymous')
        return
      }
      applyUser(payload || null)
    })

    // The widget may have initialized before React subscribed, especially after hot reload.
    const currentUser = loadCurrentUser()
    const isLocalPreview = ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname)
    if (currentUser || isIdentityReady() || isLocalPreview) applyUser(currentUser)

    return () => {
      active = false
      unsubscribe()
    }
  }, [navigate])

  const beginLogin = useCallback(() => {
    setError('')
    try {
      openLoginWidget()
    } catch (loginError) {
      setError(readableError(loginError))
    }
  }, [])

  const endSession = useCallback(async () => {
    setError('')
    try {
      await signOut()
      setUser(null)
      setStatus('anonymous')
    } catch (logoutError) {
      const currentUser = loadCurrentUser()
      setUser(currentUser)
      setStatus(currentUser ? 'authenticated' : 'anonymous')
      const message = readableError(logoutError)
      setError(message)
      throw new Error(message, { cause: logoutError })
    }
  }, [])

  const value = useMemo(
    () => ({
      displayName: getDisplayName(user),
      error,
      openLogin: beginLogin,
      logout: endSession,
      status,
      user,
    }),
    [beginLogin, endSession, error, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
