import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// Read the one app-wide session and fail clearly if the provider was omitted.
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }
  return context
}
