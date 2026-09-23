import netlifyIdentity from 'netlify-identity-widget'

const IDENTITY_CALLBACK_PATTERN = /(?:access_token|confirmation_token|invite_token|recovery_token|email_change_token|error=access_denied)=?/
let identityCallbackPending = IDENTITY_CALLBACK_PATTERN.test(window.location.hash)

// Decode only display/onboarding claims from the widget JWT; authorization still uses user.jwt().
function decodeJwtClaims(tokenValue) {
  if (typeof tokenValue !== 'string') return {}

  const encodedPayload = tokenValue.split('.')[1]
  if (!encodedPayload) return {}

  try {
    const normalized = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return {}
  }
}

function getIdentityClaims(user) {
  const tokenDetails = typeof user?.tokenDetails === 'function'
    ? user.tokenDetails()
    : user?.token
  return decodeJwtClaims(tokenDetails?.access_token || tokenDetails?.id_token)
}

function getIdentityMetadata(user) {
  const claims = getIdentityClaims(user)
  return {
    ...(claims.user_metadata || {}),
    ...(user?.userMetadata || {}),
    ...(user?.user_metadata || {}),
  }
}

function firstIdentityData(user) {
  if (!Array.isArray(user?.identities)) return {}
  return user.identities.find((identity) => identity?.identity_data)?.identity_data || {}
}

function normalizeDisplayName(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const trimmed = value.trim()
  return trimmed.includes('@') ? trimmed.split('@')[0] : trimmed
}

// Read the widget-owned user instead of keeping a second JWT or user snapshot.
export function loadCurrentUser() {
  return netlifyIdentity.currentUser()
}

export function isIdentityReady() {
  return Boolean(netlifyIdentity.store?.gotrue)
}

// Tell the router when the widget completed an OAuth, confirmation, invite, or recovery callback.
export function consumeIdentityCallback() {
  // Wait until the widget has consumed the hash; a restored stale user may arrive first.
  if (IDENTITY_CALLBACK_PATTERN.test(window.location.hash)) return false
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
  const metadata = getIdentityMetadata(user)
  return user.update({
    data: {
      ...metadata,
      brightbridge_onboarded: true,
    },
  })
}

// Prefer provider/profile metadata and fall back to the email prefix for a friendly greeting.
export function getDisplayName(user) {
  const metadata = getIdentityMetadata(user)
  const claims = getIdentityClaims(user)
  const providerData = firstIdentityData(user)
  const candidates = [
    user?.name,
    metadata.full_name,
    metadata.name,
    providerData.full_name,
    providerData.name,
    claims.name,
    user?.email,
    providerData.email,
    claims.email,
  ]

  for (const value of candidates) {
    const displayName = normalizeDisplayName(value)
    if (displayName) return displayName
  }

  return 'User'
}

export function hasCompletedOnboarding(user) {
  const metadata = getIdentityMetadata(user)
  return metadata.brightbridge_onboarded === true
}
