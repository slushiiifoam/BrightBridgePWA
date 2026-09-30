import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './authContext.js'

// Wait for cookie hydration before deciding whether a protected route is allowed.
export default function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <main className="page-center" aria-live="polite">
        <div className="loading-card">Restoring your session…</div>
      </main>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
