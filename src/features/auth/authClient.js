import netlifyIdentity from 'netlify-identity-widget'

const IDENTITY_CALLBACK_PATTERN = /(?:access_token|confirmation_token|invite_token|recovery_token|email_change_token|error=access_denied)=?/
let identityCallbackPending = IDENTITY_CALLBACK_PATTERN.test(window.location.hash)

// Read the widget-owned user instead of keeping a second JWT or user snapshot.
export function loadCurrentUser() {
  return netlifyIdentity.currentUser()
}

export function isIdentityReady() {
  return Boolean(netlifyIdentity.store?.gotrue)
}

// Tell the router when the widget completed an OAuth, confirmation, invite, or recovery callback.
export function consumeIdentityCallback() {
  const pending = identityCallbackPending
  identityCallbackPending = false
  return pending
}

// Normalize widget events and cross-tab session changes for the React auth provider.
export function subscribeToAuthChanges(callback) {
  const handleInit = (user) => callback('init', user || null)
  const handleLogin = (user) => {
    netlifyIdentity.close()
    callback('login', user || null)
  }
  const handleLogout = () => callback('logout', null)
  const handleError = (error) => callback('error', error)
  const handleStorage = (event) => {
    if (event.key !== 'gotrue.user') return
    queueMicrotask(() => callback('storage', loadCurrentUser()))
  }

  netlifyIdentity.on('init', handleInit)
  netlifyIdentity.on('login', handleLogin)
  netlifyIdentity.on('logout', handleLogout)
  netlifyIdentity.on('error', handleError)
  window.addEventListener('storage', handleStorage)

  return () => {
    netlifyIdentity.off('init', handleInit)
    netlifyIdentity.off('login', handleLogin)
    netlifyIdentity.off('logout', handleLogout)
    netlifyIdentity.off('error', handleError)
    window.removeEventListener('storage', handleStorage)
  }
}

// The widget contains email login, signup, recovery, invite handling, and enabled OAuth providers.
export function openLoginWidget() {
  netlifyIdentity.open('login')
}

export async function signOut() {
  await netlifyIdentity.logout()
}

// Refresh through the widget before authenticated API calls; never persist another token copy.
export async function getAccessToken() {
  const user = loadCurrentUser()
  return user ? user.jwt() : null
}

// Store onboarding state on the Identity profile so it follows the correct account.
export function markOnboardingComplete(user) {
  const metadata = user?.user_metadata || user?.userMetadata || {}
  return user.update({
    data: {
      ...metadata,
      brightbridge_onboarded: true,
    },
  })
}

// Prefer provider/profile metadata and fall back to the email prefix for a friendly greeting.
export function getDisplayName(user) {
  const metadata = user?.user_metadata || user?.userMetadata || {}
  const candidates = [user?.name, metadata.full_name, metadata.name]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  if (typeof user?.email === 'string' && user.email.trim()) {
    return user.email.split('@')[0]
  }

  return 'User'
}

export function hasCompletedOnboarding(user) {
  const metadata = user?.user_metadata || user?.userMetadata || {}
  return metadata.brightbridge_onboarded === true
}
